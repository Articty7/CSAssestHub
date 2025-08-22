# app/config.py
import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-key-change-me')
    FLASK_RUN_PORT = os.environ.get('FLASK_RUN_PORT')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = True  # toggle if noisy

    _DB_URL = os.environ.get('DATABASE_URL', 'sqlite:///dev.db')

    # Heroku-style prefix fix
    if _DB_URL.startswith('postgres://'):
        _DB_URL = _DB_URL.replace('postgres://', 'postgresql://', 1)

    # Force psycopg2 driver on Render
    if _DB_URL.startswith('postgresql://'):
        _DB_URL = _DB_URL.replace('postgresql://', 'postgresql+psycopg2://', 1)

    SQLALCHEMY_DATABASE_URI = _DB_URL
