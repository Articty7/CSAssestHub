from flask import Blueprint, request, jsonify
from ..models import db, Tag

tag_routes = Blueprint("tags", __name__)

@tag_routes.get("")
def list_tags():
    return jsonify([t.to_dict() for t in Tag.query.order_by(Tag.name).all()])

@tag_routes.post("")
def create_tag():
    data = request.get_json(force=True) or {}
    name = (data.get("name") or "").strip()
    if not name:
        return {"error": "name is required"}, 400
    existing = Tag.query.filter_by(name=name).first()
    if existing:
        return existing.to_dict(), 200
    t = Tag(name=name)
    db.session.add(t)
    db.session.commit()
    return t.to_dict(), 201

@tag_routes.put("/<int:tag_id>")
def update_tag(tag_id):
    t = Tag.query.get(tag_id)
    if not t:
        return {"error": "not found"}, 404
    data = request.get_json(force=True) or {}
    name = (data.get("name") or "").strip()
    if not name:
        return {"error": "name is required"}, 400
    # prevent duplicates
    if Tag.query.filter(Tag.id != tag_id, Tag.name == name).first():
        return {"error": "tag name already exists"}, 400
    t.name = name
    db.session.commit()
    return t.to_dict()

@tag_routes.delete("/<int:tag_id>")
def delete_tag(tag_id):
    t = Tag.query.get(tag_id)
    if not t:
        return {"error": "not found"}, 404
    db.session.delete(t)
    db.session.commit()
    return {"ok": True}
