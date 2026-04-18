from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import auth, itineraries

settings = get_settings()


def _cors_allow_origins() -> list[str]:
    base = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
    extra = [x.strip() for x in (settings.cors_origins or "").split(",") if x.strip()]
    seen: set[str] = set()
    out: list[str] = []
    for o in base + extra:
        if o not in seen:
            seen.add(o)
            out.append(o)
    return out


app = FastAPI(
    title=settings.app_name,
    description="Itineraries API — auth, NL parsing, provider aggregation, Postgres JSON payloads.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_allow_origins(),
    # Local dev + any *.vercel.app preview/production host so first deploy does not require CORS redeploy.
    allow_origin_regex=r"https://[^\s/]+\.vercel\.app|http://(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+)(:\d+)?",
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
