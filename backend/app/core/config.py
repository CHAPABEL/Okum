from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

# backend/app/core/config.py -> parents[2] == backend/, parent == repo root (Okum/)
_BACKEND_DIR = Path(__file__).resolve().parents[2]
_REPO_ROOT = _BACKEND_DIR.parent
_ENV_FILES = tuple(p for p in (_REPO_ROOT / ".env", _BACKEND_DIR / ".env") if p.is_file())


class Settings(BaseSettings):
    # Repo-root .env is used by docker-compose; cwd-only ".env" misses it when uvicorn runs from backend/.
    model_config = SettingsConfigDict(
        env_file=_ENV_FILES if _ENV_FILES else (".env",),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    db_url: str = Field(alias="DB_URL")
    secret_key: str = Field(alias="SECRET_KEY")

    github_client_id: str = Field(default="", alias="GITHUB_CLIENT_ID")
    github_client_secret: str = Field(default="", alias="GITHUB_CLIENT_SECRET")
    github_redirect_uri: str = Field(default="http://localhost:8000/auth/callback", alias="GITHUB_REDIRECT_URI")

    frontend_url: str = Field(default="http://localhost:3000", alias="FRONTEND_URL")
    cors_origins: list[str] = Field(default_factory=lambda: ["http://localhost:3000"], alias="CORS_ORIGINS")
    admin_email: str = Field(default="admin@flow.local", alias="ADMIN_EMAIL")
    admin_login: str = Field(default="admin", alias="ADMIN_LOGIN")
    admin_password: str = Field(default="admin", alias="ADMIN_PASSWORD")

    smtp_host: str = Field(default="", alias="SMTP_HOST")
    smtp_port: int = Field(default=587, alias="SMTP_PORT")
    smtp_user: str = Field(default="", alias="SMTP_USER")
    smtp_password: str = Field(default="", alias="SMTP_PASSWORD")
    smtp_from: str = Field(default="", alias="SMTP_FROM")
    smtp_use_tls: bool = Field(default=True, alias="SMTP_USE_TLS")


settings = Settings()
