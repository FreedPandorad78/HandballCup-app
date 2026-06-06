import os
from dotenv import load_dotenv

load_dotenv()


def _fix_db_url(url: str) -> str:
    # Supabase / Heroku-style postgres:// → postgresql:// (SQLAlchemy 2.x requiere esto)
    if url and url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql://", 1)
    return url


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-key")
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "dev-jwt-secret")
    JWT_ACCESS_TOKEN_EXPIRES = 8 * 3600
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    CORS_ORIGINS = os.environ.get("ALLOWED_ORIGINS", "*")


class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = _fix_db_url(
        os.environ.get("DATABASE_URL", "sqlite:///hublecop_dev.db")
    )


class ProductionConfig(Config):
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = _fix_db_url(os.environ.get("DATABASE_URL", ""))


config_by_name = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
}
