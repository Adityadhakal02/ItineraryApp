"""Create database tables from models. Run once before first start: python create_tables.py (from backend dir)."""
import asyncio
from app.database import engine, Base
from app.models import User, Itinerary  # noqa: F401 - register models with Base


async def main():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Tables created.")


if __name__ == "__main__":
    asyncio.run(main())
