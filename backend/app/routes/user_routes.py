# backend/api/user_routes.py

from flask import Blueprint, jsonify
from flask_login import login_required, current_user
from app.models import User

user_routes = Blueprint('users', __name__, url_prefix='/api/users')

@user_routes.route('/')
@login_required
def users():
    users = User.query.all()
    return jsonify({'users': [user.to_dict() for user in users]})


@user_routes.route('/<int:id>')
@login_required
def user(id):
    user = User.query.get(id)
    if user:
        return jsonify(user.to_dict())
    return jsonify({'error': 'User not found'}), 404
