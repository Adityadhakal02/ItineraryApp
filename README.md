# Travel Itinerary AI Orchestrator

**Aditya Raj Dhakal — CSCI 411/412 Senior Seminar**

## Project description

This is my senior seminar project. The goal is a web app where you type something like "Paris art weekend" and get an itinerary with events, places to eat, and hotels. Right now it has user auth, a stub that creates itineraries from your query (no real AI parsing yet), and the API client code for Ticketmaster, Yelp, Amadeus, and Mapbox. I'm still working on wiring in Gemini for natural language and the full orchestration layer.

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

## Acknowledgments

Use of AI tools and open-source libraries is documented in [docs/ACKNOWLEDGMENTS.md](docs/ACKNOWLEDGMENTS.md).
