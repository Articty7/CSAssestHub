# backend/api/asset_routes.py

from flask import Blueprint, request, jsonify
from app.models import db, Asset

asset_routes = Blueprint('assets', __name__, url_prefix='/api/assets')

# Get all assets
@asset_routes.route('/', methods=['GET'])
def get_assets():
    assets = Asset.query.all()
    return jsonify([asset.to_dict() for asset in assets])

# Get a single asset
@asset_routes.route('/<int:id>', methods=['GET'])
def get_asset(id):
    asset = Asset.query.get(id)
    if asset:
        return jsonify(asset.to_dict())
    return jsonify({'error': 'Asset not found'}), 404

# Create a new asset
@asset_routes.route('/', methods=['POST'])
def create_asset():
    data = request.get_json()
    new_asset = Asset(
        name=data.get('name'),
        type=data.get('type'),
        format=data.get('format')
    )
    db.session.add(new_asset)
    db.session.commit()
    return jsonify(new_asset.to_dict()), 201

# Update an asset
@asset_routes.route('/<int:id>', methods=['PUT'])
def update_asset(id):
    asset = Asset.query.get(id)
    if not asset:
        return jsonify({'error': 'Asset not found'}), 404

    data = request.get_json()
    asset.name = data.get('name', asset.name)
    asset.type = data.get('type', asset.type)
    asset.format = data.get('format', asset.format)

    db.session.commit()
    return jsonify(asset.to_dict())

# Delete an asset
@asset_routes.route('/<int:id>', methods=['DELETE'])
def delete_asset(id):
    asset = Asset.query.get(id)
    if not asset:
        return jsonify({'error': 'Asset not found'}), 404

    db.session.delete(asset)
    db.session.commit()
    return jsonify({'message': 'Asset deleted'})
