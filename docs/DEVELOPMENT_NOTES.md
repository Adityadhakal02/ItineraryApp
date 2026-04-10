# Development Notes

Notes for progress reports and future work.

## Infrastructure and auth (early phase)

- FastAPI backend (async), Next.js 15 frontend, PostgreSQL via async SQLAlchemy.
- `create_tables.py` for schema; Alembic listed in requirements if we migrate later.
- JWT auth in `/api/auth`; itineraries require a logged-in user.

## Post–midterm implementation (current)

- **`parse_trip.py`** — Gemini (`gemini-1.5-flash`) returns JSON fields for destination, IATA, dates, budget, interests; **fallback** when `GOOGLE_GEMINI_API_KEY` is unset or on error.
- **`geocode.py`** — Mapbox Geocoding preferred; **Nominatim** fallback; default coords if both fail.
- **`orchestrator.py`** — `asyncio.gather` for Ticketmaster, Yelp, Amadeus; builds **days**, **markers**, **Mapbox Directions** route; stores everything in `payload`.
- **`itineraries.py`** — Create route calls orchestrator only (no inline stub).
- **Frontend `TripMap`** — `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` for interactive map; otherwise a notice (data still in payload).

## Optional / next steps

- Automated tests (mock httpx / Gemini).
- Rate limiting or caching (Redis URL in config is unused).
- Richer day scheduling (true calendar logic vs. round-robin).
- Deployment (Docker, hosting DB, restricted Mapbox URLs).

## Compatibility

- Prefer `Optional[...]` in older Python if needed; project targets 3.10+.
