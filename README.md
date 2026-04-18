# Travel Itinerary AI Orchestrator

**Aditya Raj Dhakal — CSCI 411/412 Senior Seminar**

## Project description

A full-stack web app where a signed-in user enters a **natural-language trip request** (for example, “Paris art weekend under $800”). The backend **parses** the request (**Google Gemini** when configured, otherwise a heuristic fallback), **geocodes** the destination (**Nominatim** if Mapbox is not configured), then **aggregates** events, dining, and stays from **Ticketmaster**, **Yelp**, and **Amadeus** when API keys are present. Without those keys (or on failure), the app can still use **OpenStreetMap / Overpass**-style data for real POIs where implemented. **Driving routes** use **Mapbox Directions** if `MAPBOX_ACCESS_TOKEN` is set; otherwise **OSRM** (public demo) or a simple straight-line geometry. The itinerary is stored in **PostgreSQL** as JSON and shown in the UI with a **day-by-day** view and an **interactive map** (Leaflet + OSM tiles) on the detail page.

## Repository structure

| Path | Purpose |
|------|---------|
| `frontend/` | Next.js 15 (App Router), React, TypeScript, Tailwind — login, dashboard, itinerary detail + map |
| `backend/` | FastAPI, JWT auth, SQLAlchemy async + PostgreSQL, API clients, Gemini + LangGraph orchestration |
| `docs/` | Architecture notes, development notes, acknowledgments |
| `DEPLOY.md` | Step-by-step deploy (Railway + Vercel) |

## Technologies used

- **Frontend:** Next.js 15, React 18, TypeScript, Tailwind CSS, **Leaflet** + **react-leaflet** (OpenStreetMap tiles — **no** Mapbox GL / react-map-gl in the UI)
- **Backend:** Python 3.10+ (Dockerfile uses 3.12), FastAPI, Uvicorn, Pydantic / pydantic-settings, SQLAlchemy async, asyncpg, JWT (**python-jose**), **httpx**, **LangGraph** + **langchain-google-genai** (Gemini)
- **Database:** PostgreSQL
- **AI / external APIs (all optional in practice):** Google Gemini; **Ticketmaster**, **Yelp**, **Amadeus**, **Mapbox** (Directions + geocoding on the **server** when tokens are set). Free fallbacks include **Nominatim**, **OSRM**, and OSM-derived POIs where wired in code.

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
| **10** | Optional Mapbox Directions + geocoding on the **backend**; itinerary map in the browser via **Leaflet** + OSM (`TripMap` / `TripMapOsm`); optional `DEMO_MODE` / mocks when keys are absent |

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

`.env.local` is optional for local dev: leave **`NEXT_PUBLIC_API_URL`** empty so Next.js **rewrites** `/api/*` to the backend (see `.env.example`). The map uses **OpenStreetMap** tiles in the browser and does **not** require a Mapbox token in the frontend.

- App: [http://localhost:3000](http://localhost:3000)

### Environment variables

- **Backend** (`backend/.env`): `DATABASE_URL`, `JWT_SECRET`; other provider keys as needed. Stub responses or OSM fallbacks may apply when a client has no key or a call fails. `DEMO_MODE=true` skips much of the live provider HTTP while still using Gemini when `GOOGLE_GEMINI_API_KEY` is set. **`MAPBOX_ACCESS_TOKEN` is optional** — without it, geocoding can use **Nominatim** and routes **OSRM** (or a simple line) on the server.
- **Frontend** (`frontend/.env.local`): for production, set **`NEXT_PUBLIC_API_URL`** to your deployed API (see `DEPLOY.md`). For local dev, empty `NEXT_PUBLIC_API_URL` uses same-origin `/api` rewrites to FastAPI.

## How to run (quick)

1. Postgres up; `python create_tables.py` in `backend/`.
2. Backend: `uvicorn app.main:app --reload` (venv on).
3. Frontend: `npm run dev` in `frontend/`.
4. Register, log in, create a trip on the dashboard, open it for day view + map.

## Report / submission

Course write-up usually wants the repo link, diagrams (see `docs/ARCHITECTURE.md`), a few explained snippets (`orchestrator.py`, `parse_trip.py`, `TripMap.tsx` / `TripMapOsm.tsx`), screenshots, and a commit-history capture.

## Acknowledgments

Use of AI tools and open-source libraries is documented in [docs/ACKNOWLEDGMENTS.md](docs/ACKNOWLEDGMENTS.md).
