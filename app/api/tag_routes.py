from flask import Blueprint, request, jsonify
from ..models import db, Tag

tag_routes = Blueprint("tags", __name__)

@tag_routes.get("")
def list_tags():
    return jsonify([t.to_dict(with_assets=False) for t in Tag.query.order_by(Tag.name).all()])

@tag_routes.post("")
def create_tag():
    data = request.get_json(force=True) or {}
    name = (data.get("name") or "").strip()
    if not name:
        return {"error": "name is required"}, 400
    existing = Tag.query.filter_by(name=name).first()
    if existing:
        return existing.to_dict(with_assets=False), 200
    t = Tag(name=name)
    db.session.add(t)
    db.session.commit()
    return t.to_dict(with_assets=False), 201
