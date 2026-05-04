from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    db_url: str = Field(alias="DB_URL")
    secret_key: str = Field(alias="SECRET_KEY")

    github_client_id: str = Field(default="", alias="GITHUB_CLIENT_ID")
    github_client_secret: str = Field(default="", alias="GITHUB_CLIENT_SECRET")
    github_redirect_uri: str = Field(default="http://localhost:8000/auth/callback", alias="GITHUB_REDIRECT_URI")

    frontend_url: str = Field(default="http://localhost:3000", alias="FRONTEND_URL")
    cors_origins: list[str] = Field(default_factory=lambda: ["http://localhost:3000"], alias="CORS_ORIGINS")


settings = Settings()
