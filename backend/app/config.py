from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "Travel Itinerary AI Orchestrator"
    debug: bool = False

    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/itinerary_db"

    @field_validator("database_url", mode="before")
    @classmethod
    def database_url_use_asyncpg(cls, v: object) -> object:
        if not isinstance(v, str):
            return v
        s = v.strip()
        if s.startswith("postgresql+asyncpg://"):
            return s
        if s.startswith("postgresql://"):
            return "postgresql+asyncpg://" + s.removeprefix("postgresql://")
        if s.startswith("postgres://"):
            return "postgresql+asyncpg://" + s.removeprefix("postgres://")
        return s
    redis_url: str = "redis://localhost:6379/0"

    jwt_secret: str = "fFz9mK2pL8qW4vN6xR1tY7uI3oP5aS0dE"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24 * 7

    ticketmaster_api_key: str = ""
    yelp_api_key: str = ""
    amadeus_client_id: str = ""
    amadeus_client_secret: str = ""
    mapbox_access_token: str = ""
    google_gemini_api_key: str = ""
    demo_mode: bool = False

    # DEV: comma-separated extra CORS origins (e.g. https://app.vercel.app); localhost always allowed in code.
    cors_origins: str = ""


@lru_cache
def get_settings() -> Settings:
    return Settings()
