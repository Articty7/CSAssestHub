# app/api/upload_routes.py
# Requires env vars on your web service:
#   AWS_REGION (or AWS_DEFAULT_REGION)
#   S3_BUCKET (or S3_BUCKET_NAME)
# Optional:
#   S3_KEY_PREFIX (e.g., "uploads")
#   S3_PUBLIC_BASE (CDN/base URL if you front S3; otherwise it builds the standard S3 path)

import os
import mimetypes
import time
from urllib.parse import quote

from flask import Blueprint, request, jsonify, current_app
import boto3
from botocore.config import Config as BotoConfig

upload_routes = Blueprint("uploads", __name__)

# ---------- helpers -----------------------------------------------------------

def _env(name, default=None, required=False, alt_names=None):
    """Read env var by primary name or any alt names."""
    alt_names = alt_names or []
    for key in [name] + alt_names:
        val = os.environ.get(key)
        if val:
            return val
    if default is not None:
        return default
    if required:
        raise RuntimeError(f"Missing env var: {name} (checked { [name] + alt_names })")
    return None

def _safe_key(filename: str) -> str:
    """
    Build an S3 object key like: <prefix>/YYYY/MM/DD/<filename>
    """
    prefix = (_env("S3_KEY_PREFIX", "") or "").strip("/ ")
    date_path = time.strftime("%Y/%m/%d")
    safe = quote(filename)  # URL-safe, retains dots and most ascii
    key = f"{date_path}/{safe}"
    return f"{prefix}/{key}" if prefix else key

def _s3_client():
    # Support both common env names for region
    region = _env("AWS_REGION", alt_names=["AWS_DEFAULT_REGION"], required=True)
    return boto3.client(
        "s3",
        region_name=region,
        config=BotoConfig(signature_version="s3v4", s3={"addressing_style": "virtual"}),
    )

def _bucket_name():
    return _env("S3_BUCKET", alt_names=["S3_BUCKET_NAME"], required=True)

def _public_base():
    """Optional override to form public-style URLs if you host behind CDN, etc."""
    return os.environ.get("S3_PUBLIC_BASE")

def _region():
    return _env("AWS_REGION", alt_names=["AWS_DEFAULT_REGION"], required=True)

# ---------- routes ------------------------------------------------------------

@upload_routes.get("/s3-url")
def presign_put():
    """
    GET /api/uploads/s3-url?filename=<name>&contentType=<mime>

    Returns JSON with both new and legacy keys:
    {
      "put_url": "...", "get_url": "...",
      "uploadUrl": "...", "getUrl": "...",
      "publicUrl": "...", "key": "...",
      "headers": {"Content-Type": "..."}
    }
    """
    try:
        bucket = _bucket_name()
        region = _region()

        filename = request.args.get("filename")
        if not filename:
            return jsonify({"error": "filename is required"}), 400

        content_type = request.args.get("contentType")
        if not content_type:
            content_type, _ = mimetypes.guess_type(filename)
        if not content_type:
            content_type = "application/octet-stream"

        key = _safe_key(filename)
        s3 = _s3_client()

        params = {"Bucket": bucket, "Key": key, "ContentType": content_type}

        put_url = s3.generate_presigned_url(
            ClientMethod="put_object",
            Params=params,
            ExpiresIn=900,   # 15 minutes
            HttpMethod="PUT",
        )

        # Presigned GET for preview/download (object may remain private)
        get_url = s3.generate_presigned_url(
            ClientMethod="get_object",
            Params={"Bucket": bucket, "Key": key},
            ExpiresIn=300,   # 5 minutes
        )

        # Build a plain S3 URL too (useful if you ever make objects public or front with CDN)
        if _public_base():
            public_url = f"{_public_base().rstrip('/')}/{key}"
        else:
            public_url = f"https://{bucket}.s3.{region}.amazonaws.com/{key}"

        return jsonify({
            # New names
            "put_url": put_url,
            "get_url": get_url,

            # Legacy aliases (so existing frontend keeps working)
            "uploadUrl": put_url,
            "getUrl": get_url,

            # Optional public-style URL (not signed)
            "publicUrl": public_url,

            # Useful metadata
            "key": key,
            "headers": {"Content-Type": content_type},
        }), 200

    except Exception as e:
        current_app.logger.exception("presign_put failed")
        return jsonify({"error": f"presign failed: {e.__class__.__name__}: {e}"}), 500


@upload_routes.get("/get-url")
def presign_get():
    """
    GET /api/uploads/get-url?key=<s3_key>
    Returns { "url": "<presigned_get_url>" }
    """
    key = request.args.get("key")
    if not key:
        return jsonify({"error": "key is required"}), 400
    try:
        s3 = _s3_client()
        url = s3.generate_presigned_url(
            ClientMethod="get_object",
            Params={"Bucket": _bucket_name(), "Key": key},
            ExpiresIn=300,
        )
        return jsonify({"url": url}), 200
    except Exception as e:
        current_app.logger.exception("presign_get failed")
        return jsonify({"error": f"presign failed: {e.__class__.__name__}: {e}"}), 500
