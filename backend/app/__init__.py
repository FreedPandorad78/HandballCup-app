import os
from typing import Optional
from flask import Flask
from flask_cors import CORS

from .config import config_by_name
from .extensions import db, migrate, jwt, cors


def create_app(env: Optional[str] = None) -> Flask:
    env = env or os.environ.get("FLASK_ENV", "development")
    app = Flask(__name__)
    app.config.from_object(config_by_name[env])

    _init_extensions(app)
    _register_blueprints(app)

    return app


def _init_extensions(app: Flask) -> None:
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    origins = app.config.get("CORS_ORIGINS", "*")
    cors.init_app(app, resources={r"/api/*": {"origins": origins}})

    # Importar modelos para que Alembic los detecte
    with app.app_context():
        from .models import Categoria, Equipo, Jugador, Partido, Evento  # noqa: F401


def _register_blueprints(app: Flask) -> None:
    from .routes.auth_routes import auth_bp
    from .routes.categoria_routes import categoria_bp
    from .routes.equipo_routes import equipo_bp
    from .routes.jugador_routes import jugador_bp
    from .routes.partido_routes import partido_bp
    from .routes.evento_routes import evento_bp
    from .routes.estadisticas_routes import estadisticas_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(categoria_bp, url_prefix="/api/categorias")
    app.register_blueprint(equipo_bp, url_prefix="/api/equipos")
    app.register_blueprint(jugador_bp, url_prefix="/api/jugadores")
    app.register_blueprint(partido_bp, url_prefix="/api/partidos")
    app.register_blueprint(evento_bp, url_prefix="/api/eventos")
    app.register_blueprint(estadisticas_bp, url_prefix="/api/estadisticas")
