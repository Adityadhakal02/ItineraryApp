"""Resolve a place name to lat/lon (Mapbox if configured, else Nominatim)."""
from typing import Optional, Tuple
import httpx

from app.config import get_settings


async def geocode_destination(query: str) -> Tuple[float, float]:
    """Return (lat, lon). Never raises; falls back to a default if all lookups fail."""
    q = (query or "").strip()
    if not q:
        return 40.7128, -74.0060
    coords = await _mapbox_geocode(q)
    if coords:
        return coords
    coords = await _nominatim_geocode(q)
    if coords:
        return coords
    return 40.7128, -74.0060


async def _mapbox_geocode(q: str) -> Optional[Tuple[float, float]]:
    settings = get_settings()
    if not settings.mapbox_access_token:
        return None
    from urllib.parse import quote

    path = quote(q, safe="")
    url = f"https://api.mapbox.com/geocoding/v5/mapbox.places/{path}.json"
    try:
        async with httpx.AsyncClient() as client:
            r = await client.get(
                url,
                params={"access_token": settings.mapbox_access_token, "limit": 1},
                timeout=15.0,
            )
            r.raise_for_status()
            data = r.json()
    except Exception:
        return None
    feats = data.get("features") or []
    if not feats:
        return None
    center = feats[0].get("center") or []
    if len(center) < 2:
        return None
    lon, lat = float(center[0]), float(center[1])
    return lat, lon


async def _nominatim_geocode(q: str) -> Optional[Tuple[float, float]]:
    try:
        async with httpx.AsyncClient() as client:
            r = await client.get(
                "https://nominatim.openstreetmap.org/search",
                params={"q": q, "format": "json", "limit": 1},
                headers={"User-Agent": "ItineraryApp/1.0 (seminar project)"},
                timeout=15.0,
            )
            r.raise_for_status()
            data = r.json()
    except Exception:
        return None
    if not data:
        return None
    return float(data[0]["lat"]), float(data[0]["lon"])
