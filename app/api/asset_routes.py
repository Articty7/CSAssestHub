# app/api/asset_routes.py
from flask import Blueprint, request, jsonify, current_app
from ..models import db, Asset, Tag

asset_routes = Blueprint("assets", __name__)

def _asset_to_dict(a):
    # Fail-safe serializer (don’t call S3 here)
    return {
        "id": a.id,
        "name": getattr(a, "name", None),
        "description": getattr(a, "description", None),
        "url": getattr(a, "url", None),               # if you store public URL
        "s3_key": getattr(a, "s3_key", None),         # if you store S3 key
        "content_type": getattr(a, "content_type", None),
        "tags": [t.name for t in getattr(a, "tags", [])],
        "created_at": (getattr(a, "created_at", None).isoformat()
                       if getattr(a, "created_at", None) else None),
    }

@asset_routes.get("")
def list_assets():
    try:
        items = Asset.query.order_by(Asset.id.desc()).all()
        return jsonify([_asset_to_dict(a) for a in items]), 200
    except Exception as e:
        current_app.logger.exception("List assets failed")
        return jsonify({"error": "internal", "detail": str(e)}), 500

@asset_routes.post("")
def create_asset():
    try:
        data = request.get_json(force=True) or {}
        name = (data.get("name") or "").strip()
        if not name:
            return {"error": "name is required"}, 400

        desc = data.get("description")
        url = data.get("url")  # optional if saving public URL
        s3_key = data.get("s3_key")  # optional if saving S3 key
        content_type = data.get("content_type")

        tag_names = data.get("tags", []) or []

        a = Asset(name=name, description=desc)

        # Save whichever you use in your UI
        if url:
            a.url = url
        if s3_key:
            # Only set this if your Asset model actually has s3_key column
            if hasattr(a, "s3_key"):
                a.s3_key = s3_key
        if content_type and hasattr(a, "content_type"):
            a.content_type = content_type

        # Attach/create tags
        tags = []
        for tname in tag_names:
            tname = (tname or "").strip()
            if not tname:
                continue
            t = Tag.query.filter_by(name=tname).first()
            if not t:
                t = Tag(name=tname)
                db.session.add(t)
            tags.append(t)
        a.tags = tags

        db.session.add(a)
        db.session.commit()
        return _asset_to_dict(a), 201

    except Exception as e:
        current_app.logger.exception("Create asset failed")
        db.session.rollback()
        return jsonify({"error": "internal", "detail": str(e)}), 500

@asset_routes.route("/<int:asset_id>", methods=["DELETE"])
def delete_asset(asset_id):
    try:
        a = Asset.query.get_or_404(asset_id)
        db.session.delete(a)
        db.session.commit()
        return jsonify({"ok": True}), 200
    except Exception as e:
        current_app.logger.exception("Delete asset failed")
        db.session.rollback()
        return jsonify({"error": "internal", "detail": str(e)}), 500
