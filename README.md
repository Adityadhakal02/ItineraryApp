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
- PostgreSQL running locally (or connection string to a hosted instance)

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env: set DATABASE_URL, JWT_SECRET, and optional API keys
python create_tables.py
uvicorn app.main:app --reload
```

- API: [http://localhost:8000](http://localhost:8000) — interactive docs: [http://localhost:8000/docs](http://localhost:8000/docs)

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local  # optional; see below
npm run dev
```

- App: [http://localhost:3000](http://localhost:3000)

### Environment variables

- **Backend** (`backend/.env`): `DATABASE_URL`, `JWT_SECRET`. Optional: `GOOGLE_GEMINI_API_KEY`, `TICKETMASTER_API_KEY`, `YELP_API_KEY`, `AMADEUS_CLIENT_ID` / `AMADEUS_CLIENT_SECRET`, `MAPBOX_ACCESS_TOKEN`. Missing keys use **mock or public** fallbacks where implemented so you can demo without every provider.
- **Frontend map** (`frontend/.env.local`): `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` — same Mapbox token as backend for the map; if omitted, the detail page shows a notice and the itinerary still loads from the API.

## How to run (quick)

1. Start PostgreSQL and apply schema: `python create_tables.py` in `backend/`.
2. Run backend: `uvicorn app.main:app --reload` from `backend/` with venv activated.
3. Run frontend: `npm run dev` from `frontend/`.
4. Register → login → create an itinerary from the dashboard → open the detail page to see days, lists, and map (with token).

## Progress report (assignment)

This README satisfies the course requirement to document **description**, **setup**, **technologies**, and **how to run**. For the PDF report, also include:

- **GitHub repository link** on the first page (push this project and use **meaningful commits** — not a single bulk upload).
- **Design illustrations** (architecture, flow, DB schema, UI) — see `docs/ARCHITECTURE.md` as a starting point.
- **Code snippets** with explanations in the report body (or reference key files: `orchestrator.py`, `parse_trip.py`, `TripMap.tsx`).
- **Screenshots** of running app and **commit history** (GitHub screenshot).

## Acknowledgments

Use of AI tools and open-source libraries is documented in [docs/ACKNOWLEDGMENTS.md](docs/ACKNOWLEDGMENTS.md).
