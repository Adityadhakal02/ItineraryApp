# Architecture

## Overview

Travel Itinerary AI Orchestrator is a three-tier web application: **Next.js** frontend, **FastAPI** backend, **PostgreSQL** persistence, and **external APIs** (events, dining, hotels, maps). Natural-language requests are turned into structured parameters, then merged into a single **JSON payload** per itinerary.

## System layers

```
┌──────────────────────────────────────────────────────────────┐
│  Frontend (Next.js 15)                                       │
│  Auth, dashboard (NL query → create itinerary), detail + map │
└────────────────────────────┬─────────────────────────────────┘
                             │ HTTP/JSON + JWT
                             ▼
┌──────────────────────────────────────────────────────────────┐
│  Backend (FastAPI)                                           │
│  /api/auth  ·  /api/itineraries (create uses orchestrator)   │
└────────────────────────────┬─────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        ▼                    ▼                    ▼
   PostgreSQL            (Redis – optional)    External APIs
   users, itineraries                         Gemini, Ticketmaster,
                                              Yelp, Amadeus, Mapbox
```

## Request flow (create itinerary)

1. User submits a **natural-language query** on the dashboard.
2. **`parse_trip_query`** — Gemini extracts destination, dates, budget, interests, etc.; if no API key, **heuristic fallback**.
3. **`geocode_destination`** — Mapbox Geocoding if `MAPBOX_ACCESS_TOKEN` is set; else **Nominatim**; else default coordinates.
4. **`build_itinerary_from_query` (orchestrator)** — Runs **Ticketmaster**, **Yelp**, **Amadeus** in parallel; builds **days**, **markers**, and a **Mapbox Directions** route between sample stops; computes **estimated_cost**.
5. Row saved in **`itineraries`**; frontend loads detail and renders **`payload.map`** in **`TripMap`**.

## Backend structure

| Module | Role |
|--------|------|
| `app/main.py` | FastAPI app, CORS, routers |
| `app/config.py` | Env settings (DB, JWT, API keys) |
| `app/database.py` | Async SQLAlchemy session |
| `app/models/` | `User`, `Itinerary` |
| `app/auth/` | JWT + `get_current_user` |
| `app/routers/itineraries.py` | Create / list / get — **create** calls orchestrator |
| `app/services/parse_trip.py` | NL → `TripPlanParsed` |
| `app/services/geocode.py` | Place name → lat/lon |
| `app/services/orchestrator.py` | Merge APIs + `payload` (including `map`) |
| `app/clients/` | HTTP wrappers + mocks when keys missing |

## Database schema

| Table | Purpose |
|-------|---------|
| **users** | `id`, `email`, `hashed_password`, `full_name`, `created_at` |
| **itineraries** | `id`, `user_id`, `title`, `raw_query`, `destination`, `start_date`, `end_date`, `budget_total`, `estimated_cost`, **`payload` (JSON)**, timestamps |

`payload` includes `events`, `restaurants`, `hotels`, `days`, and **`map`** (`center`, `zoom`, `markers`, `route`).

## Frontend

| Area | Role |
|------|------|
| `app/dashboard/` | List + create itinerary |
| `app/dashboard/[id]/` | Day-by-day, lists, **`components/TripMap`** |
| `contexts/AuthContext.tsx` | JWT in `localStorage` |
| `lib/api.ts` | Typed API helpers |

## Auth flow

1. Register / login → JWT returned.
2. Client sends `Authorization: Bearer <token>` on protected routes.
3. Backend resolves user via `get_current_user`.
