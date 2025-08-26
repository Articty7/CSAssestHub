# app/__init__.py
import os
from flask import Flask, request, redirect, jsonify
from flask_cors import CORS
from flask_migrate import Migrate
from flask_wtf.csrf import generate_csrf
from flask_login import LoginManager
from dotenv import load_dotenv
from sqlalchemy import text, event

from .models import db, User
from .api.user_routes import user_routes
from .api.auth_routes import auth_routes
from .api.asset_routes import asset_routes
from .api.tag_routes import tag_routes
from .api.upload_routes import upload_routes
from .seeds import seed_commands
from .config import Config

load_dotenv()

# Serve your Vite build from react-vite/dist
app = Flask(__name__, static_folder="../react-vite/dist", static_url_path="/")

# --- Login Manager ---
login = LoginManager(app)
login.login_view = "auth.unauthorized"

@login.user_loader
def load_user(id):
    return User.query.get(int(id))

# --- CLI Commands ---
app.cli.add_command(seed_commands)

# --- Config / DB / Migrate ---
app.config.from_object(Config)
db.init_app(app)
Migrate(app, db)

# --- CORS ---
# If your frontend is same-origin (served by Flask), this is permissive and fine.
# If you want to restrict origins, you can set ALLOWED_ORIGINS env (comma-separated).
_allowed = os.environ.get("ALLOWED_ORIGINS", "").strip()
if _allowed:
    origins = [o.strip() for o in _allowed.split(",") if o.strip()]
else:
    # Defaults that cover Render + local dev
    origins = [
        "https://csassesthub.onrender.com",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
    ]
CORS(app, resources={r"/api/*": {"origins": origins}})

# --- Ensure Postgres search_path (for every pooled connection) ---
schema = os.environ.get("SCHEMA", "public")

with app.app_context():
    backend = db.engine.url.get_backend_name()  # ex: 'postgresql+psycopg2' or 'sqlite'
    if str(backend).startswith("postgresql"):
        # Set for current connection (useful at startup/migrations)
        db.session.execute(text(f"SET search_path TO {schema}, public"))
        db.session.commit()

        # Ensure for each new connection acquired from the pool
        @event.listens_for(db.engine, "connect")
        def set_search_path(dbapi_connection, connection_record):
            try:
                with dbapi_connection.cursor() as cur:
                    cur.execute(f"SET search_path TO {schema}, public")
            except Exception:
                try:
                    dbapi_connection.execute(f"SET search_path TO {schema}, public")
                except Exception:
                    pass

# --- Blueprints ---
app.register_blueprint(user_routes, url_prefix="/api/users")
app.register_blueprint(auth_routes, url_prefix="/api/auth")
app.register_blueprint(asset_routes, url_prefix="/api/assets")
app.register_blueprint(tag_routes, url_prefix="/api/tags")
app.register_blueprint(upload_routes, url_prefix="/api/uploads")

# --- HTTPS Redirect behind Render proxy ---
@app.before_request
def https_redirect():
    # Render sets the RENDER env var; FLASK_ENV may be unset
    if os.environ.get("RENDER") or os.environ.get("FLASK_ENV") == "production":
        if request.headers.get("X-Forwarded-Proto", "https") == "http":
            url = request.url.replace("http://", "https://", 1)
            return redirect(url, code=301)

# --- CSRF cookie for forms/fetch if you use it on the frontend ---
@app.after_request
def inject_csrf_token(response):
    response.set_cookie(
        "csrf_token",
        generate_csrf(),
        secure=True if (os.environ.get("RENDER") or os.environ.get("FLASK_ENV") == "production") else False,
        samesite="Strict" if (os.environ.get("RENDER") or os.environ.get("FLASK_ENV") == "production") else None,
        httponly=True,
    )
    return response

# --- Simple DB health endpoint (handy for quick checks) ---
@app.get("/api/health/db")
def db_health():
    try:
        v = db.session.execute(text("select version()")).scalar()
        return jsonify({"ok": True, "version": v}), 200
    except Exception as e:
        app.logger.exception("DB health failed")
        return jsonify({"ok": False, "error": str(e)}), 500

# --- Global JSON error handler (prevents opaque 500s in the UI) ---
@app.errorhandler(Exception)
def handle_all_errors(e):
    app.logger.exception("Unhandled server error")
    # Keep responses generic in prod; logs will have the stack trace.
    return jsonify({"error": "internal"}), 500

# --- API docs route ---
@app.route("/api/docs")
def api_help():
    """
    Returns all API routes and their doc strings
    """
    acceptable_methods = ["GET", "POST", "PUT", "PATCH", "DELETE"]
    route_list = {
        rule.rule: [
            [m for m in rule.methods if m in acceptable_methods],
            app.view_functions[rule.endpoint].__doc__,
        ]
        for rule in app.url_map.iter_rules()
        if rule.endpoint != "static"
    }
    return route_list

# --- React root (serve Vite build) ---
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def react_root(path):
    if path == "favicon.ico":
        return app.send_from_directory("public", "favicon.ico")
    return app.send_static_file("index.html")

@app.errorhandler(404)
def not_found(e):
    return app.send_static_file("index.html")
