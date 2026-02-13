from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    # Authentication
    better_auth_secret: str = "NX83Ogb4FAGFppGPnkjbDP1iykJ6NPSH"

    # Database
    database_url: str = "sqlite:///./todo.db"  # Default for development
    neon_db_url: Optional[str] = None

    # API
    api_prefix: str = "/api"

    # CORS
    frontend_origin: str = "http://localhost:3000"

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False,
        extra="ignore"
    )


settings = Settings()
