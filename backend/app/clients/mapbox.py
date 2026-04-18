# DEV: directions — Mapbox if MAPBOX_ACCESS_TOKEN; else OSRM public demo; else straight-line mock. coords are (lon, lat).
import logging
from typing import Optional

import httpx
from app.config import get_settings

logger = logging.getLogger(__name__)

_OSRM_BASE = "https://router.project-osrm.org/route/v1/driving"


async def get_route(coordinates: list[tuple[float, float]]) -> Optional[dict]:
    if len(coordinates) < 2:
        return None
    settings = get_settings()
    if settings.demo_mode:
        return _mock_route(coordinates)

    token = (settings.mapbox_access_token or "").strip()
    if token:
        route = await _mapbox_route(coordinates, token)
        if route is not None:
            return route

    route = await _osrm_route(coordinates)
    if route is not None:
        return route

    return _mock_route(coordinates)


async def _mapbox_route(coordinates: list[tuple[float, float]], access_token: str) -> Optional[dict]:
    coords_str = ";".join(f"{lon},{lat}" for lon, lat in coordinates)
    url = f"https://api.mapbox.com/directions/v5/mapbox/driving/{coords_str}"
    try:
        async with httpx.AsyncClient() as client:
            r = await client.get(
                url,
                params={"access_token": access_token, "geometries": "geojson"},
                timeout=30.0,
            )
            r.raise_for_status()
            data = r.json()
    except Exception as e:
        logger.warning("Mapbox Directions failed (%s); trying OSRM.", e)
        return None
    routes = data.get("routes", [])
    if not routes:
        return None
    route = routes[0]
    return {
        "geometry": route.get("geometry"),
        "duration_seconds": route.get("duration"),
        "distance_meters": route.get("distance"),
    }


async def _osrm_route(coordinates: list[tuple[float, float]]) -> Optional[dict]:
    coords_str = ";".join(f"{lon},{lat}" for lon, lat in coordinates)
    url = f"{_OSRM_BASE}/{coords_str}"
    try:
        async with httpx.AsyncClient() as client:
            r = await client.get(
                url,
                params={"overview": "full", "geometries": "geojson"},
                headers={"User-Agent": "ItineraryApp/1.0 (student project)"},
                timeout=30.0,
            )
            r.raise_for_status()
            data = r.json()
    except Exception as e:
        logger.warning("OSRM routing failed (%s); using straight-line route.", e)
        return None
    if data.get("code") != "Ok":
        return None
    routes = data.get("routes") or []
    if not routes:
        return None
    route = routes[0]
    geom = route.get("geometry")
    if not geom or geom.get("type") != "LineString":
        return None
    return {
        "geometry": geom,
        "duration_seconds": route.get("duration"),
        "distance_meters": route.get("distance"),
    }


def _mock_route(coordinates: list[tuple[float, float]]) -> dict:
    return {
        "geometry": {"type": "LineString", "coordinates": list(coordinates)},
        "duration_seconds": 900,
        "distance_meters": 5000,
    }
