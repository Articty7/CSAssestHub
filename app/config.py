# app/config.py
import os
from urllib.parse import urlparse, parse_qsl, urlencode, urlunparse

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-key-change-me')
    FLASK_RUN_PORT = os.environ.get('FLASK_RUN_PORT')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Verbose SQL logs locally, quieter in production
    _is_prod = os.environ.get('FLASK_ENV') == 'production' or os.environ.get('RENDER')
    SQLALCHEMY_ECHO = False if _is_prod else True

    # Base URL (fallback to local sqlite)
    _DB_URL = os.environ.get('DATABASE_URL', 'sqlite:///dev.db')

    # 1) Heroku-style prefix fix
    if _DB_URL.startswith('postgres://'):
        _DB_URL = _DB_URL.replace('postgres://', 'postgresql://', 1)

    # 2) Prefer psycopg v3 driver
    if _DB_URL.startswith('postgresql://'):
        _DB_URL = _DB_URL.replace('postgresql://', 'postgresql+psycopg://', 1)

    # 3) Ensure sslmode=require in production (Render) if missing
    if _DB_URL.startswith('postgresql+psycopg://') and _is_prod:
        parsed = urlparse(_DB_URL)
        qs = dict(parse_qsl(parsed.query))
        if 'sslmode' not in qs:
            qs['sslmode'] = 'require'
            _DB_URL = urlunparse(parsed._replace(query=urlencode(qs)))

    SQLALCHEMY_DATABASE_URI = _DB_URL

    # Connection pool settings
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,   # validate connection before use
        "pool_recycle": 300,     # recycle every 5 minutes
        "pool_size": 5,
        "max_overflow": 5,
        "pool_timeout": 10,
    }
