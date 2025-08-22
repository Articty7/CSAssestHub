# app/config.py
import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-key-change-me')
    FLASK_RUN_PORT = os.environ.get('FLASK_RUN_PORT')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = True  # toggle if noisy

    # Base URL from env with defaults
    _DB_URL = os.environ.get('DATABASE_URL', 'sqlite:///dev.db')

    # Heroku-style prefix fix
    if _DB_URL.startswith('postgres://'):
        _DB_URL = _DB_URL.replace('postgres://', 'postgresql://', 1)

    # If using SQLAlchemy + psycopg (v3), enforce the driver in the URL
    # so SQLAlchemy doesn't default to psycopg2.
    if _DB_URL.startswith('postgresql://'):
        try:
            import psycopg  # noqa: F401
            _DB_URL = _DB_URL.replace('postgresql://', 'postgresql+psycopg://', 1)
        except Exception:
            # psycopg not installed; leave as-is (will use default driver)
            pass

    SQLALCHEMY_DATABASE_URI = _DB_URL
