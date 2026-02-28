# Travel Itinerary AI Orchestrator

## Project description

Web app that generates travel itineraries from natural language using multi-agent orchestration and external APIs (events, dining, hotels, transport). Current scope: setup, database schema, JWT auth, and API client structure.

## Setup instructions

- **Backend:** Python 3.10+, PostgreSQL. In `backend/`: create a venv, `pip install -r requirements.txt`, copy `.env.example` to `.env` and set `DATABASE_URL` and `JWT_SECRET`, run `python create_tables.py`.
- **Frontend:** Node 18+. In `frontend/`: run `npm install`.

## Technologies used

- Frontend: Next.js 15, React, TypeScript, Tailwind CSS
- Backend: FastAPI (Python), JWT auth, SQLAlchemy (async PostgreSQL)
- API clients: Ticketmaster, Yelp, Amadeus, Mapbox

## How to run the project

**Backend**
```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env       # set DATABASE_URL and JWT_SECRET
python create_tables.py
uvicorn app.main:app --reload
```
API: http://localhost:8000 — Docs: http://localhost:8000/docs

**Frontend**
```bash
cd frontend
npm install
npm run dev
```
App: http://localhost:3000
