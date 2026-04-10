# main app - auth + itineraries for now. orchestration routes later
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import auth, itineraries

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    description="Travel itinerary API. Auth and stub create/list work; still need to add real NL parsing and agent orchestration.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(itineraries.router, prefix="/api/itineraries", tags=["itineraries"])


@app.get("/")
def root():
    return {"message": "Travel Itinerary AI Orchestrator API", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok"}
