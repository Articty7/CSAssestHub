# app/config.py
import os
from urllib.parse import urlparse, parse_qsl, urlencode, urlunparse

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-key-change-me")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    _is_prod = (os.environ.get("FLASK_ENV") == "production") or bool(os.environ.get("RENDER"))
    SQLALCHEMY_ECHO = False if _is_prod else True

    # Base DB URL (SQLite locally by default)
    _DB_URL = os.environ.get("DATABASE_URL", "sqlite:///dev.db")

    # Normalize old Heroku scheme
    if _DB_URL.startswith("postgres://"):
        _DB_URL = _DB_URL.replace("postgres://", "postgresql://", 1)

    # Choose driver: psycopg2 (stable) for Postgres
    if _DB_URL.startswith("postgresql://"):
        _DB_URL = _DB_URL.replace("postgresql://", "postgresql+psycopg2://", 1)

    # Add sslmode in production
    if _DB_URL.startswith("postgresql+psycopg2://") and _is_prod:
        p = urlparse(_DB_URL)
        q = dict(parse_qsl(p.query))
        q.setdefault("sslmode", "require")
        _DB_URL = urlunparse(p._replace(query=urlencode(q)))

    SQLALCHEMY_DATABASE_URI = _DB_URL

    # Engine options: Postgres gets a pool; SQLite gets none (or simple defaults)
    if SQLALCHEMY_DATABASE_URI.startswith("postgresql+psycopg2://"):
        SQLALCHEMY_ENGINE_OPTIONS = {
            "pool_pre_ping": True,
            "pool_recycle": 300,
            "pool_size": 5,
            "max_overflow": 5,
            "pool_timeout": 10,
        }
    else:
        # SQLite: avoid pool kwargs that cause TypeError
        SQLALCHEMY_ENGINE_OPTIONS = {
            # If you need multi-threaded access you could also add:
            # "connect_args": {"check_same_thread": False}
        }
# app/config.py (near the bottom of the class or right after SQLALCHEMY_DATABASE_URI is set)
if os.getenv("RENDER"):  # only log in Render
    try:
        from urllib.parse import urlparse, parse_qsl
        _u = urlparse(SQLALCHEMY_DATABASE_URI)
        _q = dict(parse_qsl(_u.query))
        print(
            "DB DEBUG -> scheme:", _u.scheme,
            "host:", _u.hostname,
            "port:", _u.port,
            "db:", _u.path,
            "sslmode:", _q.get("sslmode"),
        )
    except Exception as e:
        print("DB DEBUG -> failed to parse DATABASE_URL:", e)
