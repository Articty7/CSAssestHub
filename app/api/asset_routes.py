from flask import Blueprint, request, jsonify
from ..models import db, Asset, Tag

asset_routes = Blueprint("assets", __name__)

@asset_routes.get("")
def list_assets():
    return jsonify([a.to_dict() for a in Asset.query.all()])

@asset_routes.post("")
def create_asset():
    data = request.get_json(force=True) or {}
    name = (data.get("name") or "").strip()
    if not name:
        return {"error": "name is required"}, 400
    desc = data.get("description")
    url = data.get("url")
    tag_names = data.get("tags", [])

    a = Asset(name=name, description=desc, url=url)
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
    return a.to_dict(), 201

@asset_routes.route("/<int:asset_id>", methods=["DELETE"])
def delete_asset(asset_id):
    a = Asset.query.get_or_404(asset_id)
    db.session.delete(a)
    db.session.commit()
    return jsonify({"ok": True})
