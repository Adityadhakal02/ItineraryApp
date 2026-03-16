# Development Notes

Notes I keep for myself and for progress reports.

## Infrastructure and auth (Weeks 1–4)

- Chose FastAPI for the backend for async support and automatic OpenAPI docs; Next.js 15 for the frontend to match the proposal stack.
- Kept auth in a single router (`/api/auth`) so the repo clearly reflects “foundation only” before adding itinerary endpoints.
- Used SQLAlchemy async with PostgreSQL; added a simple `create_tables.py` script instead of full Alembic migrations for the first phase so I could iterate on the schema quickly.
- API clients return mocks when keys are missing so I could run everything locally without signing up for every API right away.

## Compatibility and tooling

- Backend kept compatible with Python 3.9 (e.g. `Optional[...]` instead of `X | None`) for consistency with the environment I use.
- Had to add greenlet to requirements after the first run failed (async SQLAlchemy needs it).

## Stub itinerary flow (current)

- Added itineraries API (create, list, get). Create uses a stub that takes the first word as destination and uses the Ticketmaster mock for events; dining/hotels are hardcoded so the JSON shape matches the frontend. Lets me demo the full flow before adding Gemini.
- Dashboard has the input + list; detail page shows day-by-day and the events/dining/hotels. Map not done yet.

## Next phase (post–midterm)

- NL parsing (Gemini) to turn natural language into structured params.
- Orchestrator (single flow or LangGraph) to call the four clients and merge results.
- Replace stub with real orchestration; keep the same API and frontend.
- Mapbox map and route display; then testing and deployment.
