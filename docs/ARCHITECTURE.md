# Architecture

## Overview

Travel Itinerary AI Orchestrator is a three-tier web application: frontend (Next.js), backend (FastAPI), and data/external services (PostgreSQL, external APIs).

## System layers

```
┌─────────────────────────────────────────────────────────┐
│  Frontend (Next.js 15)                                  │
│  Auth UI, placeholder dashboard; future: NL input, map  │
└────────────────────────┬──────────────────────────────┘
                         │ HTTP/JSON
                         ▼
┌─────────────────────────────────────────────────────────┐
│  Backend (FastAPI)                                      │
│  /api/auth (register, login, me); future: itineraries   │
└────────────────────────┬──────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
   PostgreSQL      (Redis – planned)   External APIs
   users,          cache/rate limit   Ticketmaster, Yelp,
   itineraries                       Amadeus, Mapbox
```

## Backend structure

- **`app/main.py`** — FastAPI app, CORS, router mounting.
- **`app/config.py`** — Settings from environment (DB, JWT, API keys).
- **`app/database.py`** — Async SQLAlchemy engine and session; `get_db` dependency.
- **`app/models/`** — SQLAlchemy models (User, Itinerary).
- **`app/auth/`** — JWT creation/validation, `get_current_user` dependency.
- **`app/routers/auth.py`** — Register, login, me.
- **`app/routers/itineraries.py`** — Create (stub), list, get. Create uses `stub_itinerary` for now.
- **`app/services/stub_itinerary.py`** — Builds a minimal itinerary from the raw query (no LLM); uses Ticketmaster mock + static dining/hotels so the payload shape is ready for the frontend.
- **`app/clients/`** — API wrappers: Ticketmaster, Yelp, Amadeus, Mapbox (with mock fallbacks).

## Database schema

| Table | Purpose |
|-------|---------|
| **users** | `id`, `email`, `hashed_password`, `full_name`, `created_at`. |
| **itineraries** | `id`, `user_id` (FK → users), `title`, `raw_query`, `destination`, `start_date`, `end_date`, `budget_total`, `estimated_cost`, `payload` (JSON), `created_at`, `updated_at`. |

`payload` stores the full generated itinerary (events, dining, hotels, routes) for future frontend display.

## External APIs (client modules)

- **Ticketmaster** — Events by city and date.
- **Yelp** — Restaurants by location.
- **Amadeus** — Hotels by city code.
- **Mapbox** — Directions/routing.

Clients return mock data when API keys are not set so the app can run without keys.

## Frontend structure

- **`app/`** — Next.js App Router: layout, home, login, register, placeholder dashboard.
- **`contexts/AuthContext.tsx`** — Auth state and token handling.
- **`lib/api.ts`** — HTTP helper and auth API calls.

## Auth flow

1. User registers or logs in via frontend → `POST /api/auth/register` or `/login`.
2. Backend returns JWT; frontend stores it (e.g. localStorage).
3. Protected requests send `Authorization: Bearer <token>`; backend uses `get_current_user` to load the user.
