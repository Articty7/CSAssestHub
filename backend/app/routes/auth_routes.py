# backend/api/auth_routes.py

from flask import Blueprint, request, jsonify
from app.models import User, db
from flask_login import current_user, login_user, logout_user
from werkzeug.security import check_password_hash, generate_password_hash

auth_routes = Blueprint('auth', __name__, url_prefix='/api/auth')


@auth_routes.route('/')
def authenticate():
    if current_user.is_authenticated:
        return jsonify(current_user.to_dict())
    return jsonify({'errors': {'message': 'Unauthorized'}}), 401


@auth_routes.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()
    if user and check_password_hash(user.password, password):
        login_user(user)
        return jsonify(user.to_dict())
    return jsonify({'errors': {'message': 'Invalid credentials'}}), 401


@auth_routes.route('/logout', methods=['POST'])
def logout():
    logout_user()
    return jsonify({'message': 'User logged out'})


@auth_routes.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if User.query.filter_by(email=email).first():
        return jsonify({'errors': {'message': 'Email already exists'}}), 400

    new_user = User(
        username=username,
        email=email,
        password=generate_password_hash(password)
    )
    db.session.add(new_user)
    db.session.commit()
    login_user(new_user)
    return jsonify(new_user.to_dict()), 201
