# app/config.py
import os
from urllib.parse import urlparse, parse_qsl, urlencode, urlunparse

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-key-change-me")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    _is_prod = (os.environ.get("FLASK_ENV") == "production") or bool(os.environ.get("RENDER"))
    SQLALCHEMY_ECHO = False if _is_prod else True

    _DB_URL = os.environ.get("DATABASE_URL", "sqlite:///dev.db")

    # 1) Normalize old Heroku prefix
    if _DB_URL.startswith("postgres://"):
        _DB_URL = _DB_URL.replace("postgres://", "postgresql://", 1)

    # 2) Force psycopg2 dialect
    if _DB_URL.startswith("postgresql://"):
        _DB_URL = _DB_URL.replace("postgresql://", "postgresql+psycopg2://", 1)

    # 3) Ensure SSL in production
    if _is_prod and _DB_URL.startswith("postgresql+psycopg2://"):
        p = urlparse(_DB_URL)
        q = dict(parse_qsl(p.query))
        q.setdefault("sslmode", "require")
        _DB_URL = urlunparse(p._replace(query=urlencode(q)))

    SQLALCHEMY_DATABASE_URI = _DB_URL

    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,
        "pool_recycle": 300,
        "pool_size": 5,
        "max_overflow": 5,
        "pool_timeout": 10,
    }
