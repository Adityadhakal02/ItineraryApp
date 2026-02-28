"""FastAPI application entry point."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import auth

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    description="Multi-agent AI system for generating optimized travel itineraries (Weeks 1–4: setup, auth, API clients).",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])


@app.get("/")
def root():
    return {"message": "Travel Itinerary AI Orchestrator API", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok"}
