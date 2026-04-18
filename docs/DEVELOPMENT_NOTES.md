# Development notes

## Stack

FastAPI + async SQLAlchemy/PostgreSQL, Next.js 15, JWT auth. Schema via `create_tables.py`; Alembic is in requirements if migrations are needed later.

## Behavior

- **`DEMO_MODE`** — No Ticketmaster/Yelp/Amadeus/Mapbox/Geocode HTTP; catalog lat/lon + rich fixtures. NL still uses Gemini if configured, else `heuristic_trip.py`.
- **`parse_trip.py`** — Gemini JSON extraction for trip fields; regex/heuristic path when the key is missing or the call fails.
- **`geocode.py`** — Mapbox geocoding first, then Nominatim, then a default coordinate pair.
- **`orchestrator.py`** — Parallel Ticketmaster / Yelp / Amadeus calls; builds `days`, `map.markers`, Mapbox Directions segment; writes the full blob into `payload`.
- **`itineraries` router** — POST runs the orchestrator end-to-end.
- **`TripMap`** — Reads `payload.map`; needs `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` for GL. Without it, the UI shows a short message instead of the canvas.

## Backlog

- httpx/Gemini mocks for automated tests.
- Rate limits or caching (config still has an unused `redis_url`).
- Smarter scheduling than round-robin across days.
- Hosted DB + deploy, Mapbox URL restrictions in production.

## Python

Targets 3.10+.
