# config from .env - no secrets in code
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Settings loaded from env vars / .env."""

    # App
    app_name: str = "Travel Itinerary AI Orchestrator"
    debug: bool = False

    # Database
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/itinerary_db"
    redis_url: str = "redis://localhost:6379/0"

    # JWT
    jwt_secret: str = "change-me-in-production-use-long-random-string"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24 * 7  # 7 days

    # External APIs (set in .env)
    ticketmaster_api_key: str = ""
    yelp_api_key: str = ""
    amadeus_client_id: str = ""
    amadeus_client_secret: str = ""
    mapbox_access_token: str = ""
    google_gemini_api_key: str = ""

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache
def get_settings() -> Settings:
    return Settings()
