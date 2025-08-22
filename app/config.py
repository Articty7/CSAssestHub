# app/config.py
import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-key-change-me')
    FLASK_RUN_PORT = os.environ.get('FLASK_RUN_PORT')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = True

    _DB_URL = os.environ.get('DATABASE_URL', 'sqlite:///dev.db')
    if _DB_URL.startswith('postgres://'):
        _DB_URL = _DB_URL.replace('postgres://', 'postgresql://', 1)
    SQLALCHEMY_DATABASE_URI = _DB_URL
