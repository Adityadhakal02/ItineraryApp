import os
from urllib.parse import parse_qsl, urlencode, urlparse

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from app.config import get_settings


def _asyncpg_database_url_and_connect_args(url: str) -> tuple[str, dict]:
    """
    Railway / managed Postgres often needs TLS. asyncpg does not use libpq's sslmode=…
    the same way; strip those query params and pass ssl explicitly when appropriate.
    """
    connect_args: dict = {}
    if "?" not in url:
        clean = url
    else:
        base, q = url.split("?", 1)
        pairs = [(k, v) for k, v in parse_qsl(q, keep_blank_values=True) if k.lower() not in ("sslmode", "channel_binding")]
        clean = base + ("?" + urlencode(pairs) if pairs else "")

    try:
        raw = clean.replace("postgresql+asyncpg://", "postgresql://", 1)
        host = (urlparse(raw).hostname or "").lower()
    except Exception:
        return clean, connect_args

    if not host or host in ("localhost", "127.0.0.1"):
        return clean, connect_args
    if host.endswith(".railway.internal") or ".railway.internal" in host:
        return clean, connect_args

    if (
        "railway.app" in host
        or "rlwy.net" in host
        or os.environ.get("DATABASE_SSL", "").lower() in ("1", "true", "yes")
    ):
        connect_args["ssl"] = True

    return clean, connect_args


settings = get_settings()
_db_url, _connect_args = _asyncpg_database_url_and_connect_args(settings.database_url)
engine = create_async_engine(
    _db_url,
    echo=settings.debug,
    connect_args=_connect_args,
)
AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
