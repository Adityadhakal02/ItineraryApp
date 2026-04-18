import asyncio
import sys
import traceback

from app.database import engine, Base
from app.models import User, Itinerary  # noqa: F401


async def main():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Tables created.", flush=True)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except Exception:
        traceback.print_exc()
        print("create_tables failed — check DATABASE_URL on Railway and Postgres is running.", file=sys.stderr, flush=True)
        raise
