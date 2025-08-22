# app/api/upload_routes.py
import os
import mimetypes
import time
from urllib.parse import quote

from flask import Blueprint, request, jsonify
import boto3
from botocore.config import Config as BotoConfig

upload_routes = Blueprint("uploads", __name__)

# ----- helpers ---------------------------------------------------------------

def _env(name, default=None, required=False):
    val = os.environ.get(name, default)
    if required and not val:
        raise RuntimeError(f"Missing env var: {name}")
    return val

def _safe_key(filename: str) -> str:
    """
    Build an S3 object key like: uploads/YYYY/MM/DD/<filename>
    """
    prefix = (_env("S3_KEY_PREFIX", "") or "").strip("/ ")
    date_path = time.strftime("%Y/%m/%d")
    safe = quote(filename)  # URL-safe, retains dots and most ascii
    return f"{prefix}/{date_path}/{safe}" if prefix else f"{date_path}/{safe}"

# ----- route ----------------------------------------------------------------

@upload_routes.get("/s3-url")
def presign_put():
    """
    GET /api/uploads/s3-url?filename=<name>&contentType=<mime>
    Returns JSON with presigned PUT URL, public URL, and headers.
    """
    try:
        bucket = _env("S3_BUCKET_NAME", required=True)
        region = _env("AWS_DEFAULT_REGION", required=True)
        public_base = os.environ.get("S3_PUBLIC_BASE")  # optional override

        filename = request.args.get("filename")
        if not filename:
            return jsonify({"error": "filename is required"}), 400

        content_type = request.args.get("contentType")
        if not content_type:
            content_type, _ = mimetypes.guess_type(filename)
        if not content_type:
            content_type = "application/octet-stream"

        key = _safe_key(filename)

        # Use regional endpoint + virtual-hosted style to avoid 307 redirects
        s3 = boto3.client(
            "s3",
            region_name=region,
            config=BotoConfig(
                signature_version="s3v4",
                s3={"addressing_style": "virtual"},  # https://<bucket>.s3.<region>...
            ),
            endpoint_url=f"https://s3.{region}.amazonaws.com",
        )

        params = {
            "Bucket": bucket,
            "Key": key,
            "ContentType": content_type,
        }

        upload_url = s3.generate_presigned_url(
            ClientMethod="put_object",
            Params=params,
            ExpiresIn=900,  # 15 minutes
            HttpMethod="PUT",
        )

        # Public URL where the object will live
        if public_base:
            public_url = f"{public_base.rstrip('/')}/{key}"
        else:
            public_url = f"https://{bucket}.s3.{region}.amazonaws.com/{key}"

        return jsonify({
            "uploadUrl": upload_url,
            "publicUrl": public_url,
            "key": key,
            "headers": {"Content-Type": content_type},
        })

    except RuntimeError as e:
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        return jsonify({"error": f"presign failed: {e.__class__.__name__}: {e}"}), 500
