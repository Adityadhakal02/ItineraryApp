# Travel Itinerary AI Orchestrator

**Aditya Raj Dhakal — CSCI 411/412 Senior Seminar**

## Project description

A full-stack web app where a signed-in user enters a **natural-language trip request** (for example, “Paris art weekend under $800”). The backend **parses the request** (Google Gemini when configured, otherwise a heuristic fallback), **geocodes** the destination, then **aggregates** results from **Ticketmaster** (events), **Yelp** (dining), **Amadeus** (hotels), and **Mapbox** (driving route between sample stops). The itinerary is stored in **PostgreSQL** as JSON and shown in the UI with a **day-by-day** view and an optional **interactive map** on the detail page.

## Repository structure

| Path | Purpose |
|------|---------|
| `frontend/` | Next.js 15 (App Router), React, TypeScript, Tailwind — login, dashboard, itinerary detail + map |
| `backend/` | FastAPI, JWT auth, SQLAlchemy async + PostgreSQL, API clients, Gemini + orchestration |
| `docs/` | Architecture notes, development notes, acknowledgments |

## Technologies used

- **Frontend:** Next.js 15, React 18, TypeScript, Tailwind CSS, Mapbox GL (`mapbox-gl`, `react-map-gl`)
- **Backend:** Python 3.10+, FastAPI, Uvicorn, Pydantic, SQLAlchemy async, asyncpg, JWT (python-jose), httpx
- **Database:** PostgreSQL
- **AI / external APIs:** Google Gemini (optional), Ticketmaster, Yelp, Amadeus, Mapbox

## Setup

### Prerequisites

- Node.js 18+
- Python 3.10+
- PostgreSQL running locally (or a hosted connection string)

### Seminar scope (weeks 7–10)

| Block | What this repo covers |
|-------|------------------------|
| **7–8** | Next.js UI, JWT auth (`/login`, `/register`, `AuthContext`), dashboard + NL trip form |
| **9** | Frontend calls FastAPI; create itinerary runs the orchestrator (parse → geocode → APIs → JSON in Postgres); detail view shows payload |
| **10** | Mapbox Directions + geocoding on the backend; `TripMap` (react-map-gl) for markers + route; optional `DEMO_MODE` / mocks when keys are absent |

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python create_tables.py
uvicorn app.main:app --reload
```

Fill in `.env` (`DATABASE_URL`, `JWT_SECRET`, and any API keys you use).

- API: [http://localhost:8000](http://localhost:8000) — interactive docs: [http://localhost:8000/docs](http://localhost:8000/docs)

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

`.env.local` is optional: leave `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` empty to use a **free OpenStreetMap** map (Leaflet). Set a Mapbox token only if you want Mapbox GL styles.

- App: [http://localhost:3000](http://localhost:3000)

### Environment variables

- **Backend** (`backend/.env`): `DATABASE_URL`, `JWT_SECRET`; other provider keys as needed. Stub responses kick in when a client has no key. `DEMO_MODE=true` skips provider HTTP (fixtures + catalog geocode) while still using Gemini when `GOOGLE_GEMINI_API_KEY` is set. **`MAPBOX_ACCESS_TOKEN` is optional** — without it, geocoding uses **Nominatim** and routes use a simple line geometry (still shown on the map).
- **Frontend** (`frontend/.env.local`): optional `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` for Mapbox GL; if unset, the UI uses **OpenStreetMap** tiles (no Mapbox account or payment).

## How to run (quick)

1. Postgres up; `python create_tables.py` in `backend/`.
2. Backend: `uvicorn app.main:app --reload` (venv on).
3. Frontend: `npm run dev` in `frontend/`.
4. Register, log in, create a trip on the dashboard, open it for day view + map.

## Report / submission

Course write-up usually wants the repo link, diagrams (see `docs/ARCHITECTURE.md`), a few explained snippets (`orchestrator.py`, `parse_trip.py`, `TripMap.tsx`), screenshots, and a commit-history capture.

## Acknowledgments

Use of AI tools and open-source libraries is documented in [docs/ACKNOWLEDGMENTS.md](docs/ACKNOWLEDGMENTS.md).
