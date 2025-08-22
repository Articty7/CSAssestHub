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

#Fixing a Time Out Error 500

SQLALCHEMY_ENGINE_OPTIONS = {
    "pool_pre_ping": True,     # validates connection before using it
    "pool_recycle": 300,       # recycle connections every 5 minutes
    "pool_size": 5,            # reasonable small pool
    "max_overflow": 5,         # allow some burst
    "pool_timeout": 10,        # wait up to 10s for a connection
}
