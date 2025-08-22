# app/__init__.py
import os
from flask import Flask, request, redirect
from flask_cors import CORS
from flask_migrate import Migrate
from flask_wtf.csrf import CSRFProtect, generate_csrf
from flask_login import LoginManager
from dotenv import load_dotenv
from sqlalchemy import text


from .models import db, User
from .api.user_routes import user_routes
from .api.auth_routes import auth_routes
from .api.asset_routes import asset_routes   
from .api.tag_routes import tag_routes       
from .api.upload_routes import upload_routes
from .seeds import seed_commands
from .config import Config

load_dotenv()

app = Flask(__name__, static_folder='../react-vite/dist', static_url_path='/')

# --- Login Manager ---
login = LoginManager(app)
login.login_view = 'auth.unauthorized'

@login.user_loader
def load_user(id):
    return User.query.get(int(id))

# --- CLI Commands ---
app.cli.add_command(seed_commands)

# --- Config / DB / Migrate ---
app.config.from_object(Config)
db.init_app(app)
Migrate(app, db)

with app.app_context():
    uri = app.config.get("SQLALCHEMY_DATABASE_URI", "")
    if uri.startswith("postgres"):
        schema = os.environ.get("SCHEMA", "public")  # default to public if missing
        db.session.execute(text(f"SET search_path TO {schema}, public"))
        db.session.commit()


# --- Blueprints ---
app.register_blueprint(user_routes, url_prefix='/api/users')
app.register_blueprint(auth_routes, url_prefix='/api/auth')
app.register_blueprint(asset_routes, url_prefix='/api/assets')   
app.register_blueprint(tag_routes, url_prefix='/api/tags')       
app.register_blueprint(upload_routes, url_prefix="/api/uploads")


# --- Security ---
CORS(app)

@app.before_request
def https_redirect():
    if os.environ.get('FLASK_ENV') == 'production':
        if request.headers.get('X-Forwarded-Proto') == 'http':
            url = request.url.replace('http://', 'https://', 1)
            return redirect(url, code=301)

@app.after_request
def inject_csrf_token(response):
    response.set_cookie(
        'csrf_token',
        generate_csrf(),
        secure=True if os.environ.get('FLASK_ENV') == 'production' else False,
        samesite='Strict' if os.environ.get('FLASK_ENV') == 'production' else None,
        httponly=True
    )
    return response

# --- Docs Route ---
@app.route("/api/docs")
def api_help():
    """
    Returns all API routes and their doc strings
    """
    acceptable_methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
    route_list = {
        rule.rule: [
            [m for m in rule.methods if m in acceptable_methods],
            app.view_functions[rule.endpoint].__doc__
        ]
        for rule in app.url_map.iter_rules() if rule.endpoint != 'static'
    }
    return route_list

# --- React Root (Frontend build) ---
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def react_root(path):
    if path == 'favicon.ico':
        return app.send_from_directory('public', 'favicon.ico')
    return app.send_static_file('index.html')

@app.errorhandler(404)
def not_found(e):
    return app.send_static_file('index.html')
