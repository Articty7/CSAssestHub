# app/config.py
import os
from urllib.parse import urlparse, parse_qsl, urlencode, urlunparse

class Config:
    # Basic app config
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-key-change-me")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Quieter SQL logs in production
    _is_prod = os.environ.get("FLASK_ENV") == "production" or bool(os.environ.get("RENDER"))
    SQLALCHEMY_ECHO = False if _is_prod else True

    # Base DB URL (fallback to local sqlite)
    _DB_URL = os.environ.get("DATABASE_URL", "sqlite:///dev.db")

    # 1) Normalize scheme from old Heroku style
    if _DB_URL.startswith("postgres://"):
        _DB_URL = _DB_URL.replace("postgres://", "postgresql://", 1)

    # 2) Use psycopg v3 driver with SQLAlchemy 2.x
    if _DB_URL.startswith("postgresql://"):
        _DB_URL = _DB_URL.replace("postgresql://", "postgresql+psycopg://", 1)

    # 3) Enforce SSL in production (Render) if not present
    if _DB_URL.startswith("postgresql+psycopg://") and _is_prod:
        p = urlparse(_DB_URL)
        q = dict(parse_qsl(p.query))
        q.setdefault("sslmode", "require")
        _DB_URL = urlunparse(p._replace(query=urlencode(q)))

    # Final URI used by Flask-SQLAlchemy
    SQLALCHEMY_DATABASE_URI = _DB_URL

    # Connection pool tweaks (helps with transient network/SSL issues)
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,  # validate connections before use
        "pool_recycle": 300,    # recycle every 5 minutes
        "pool_size": 5,
        "max_overflow": 5,
        "pool_timeout": 10,
    }
