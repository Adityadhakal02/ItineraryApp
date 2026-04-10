"""Mapbox Directions API for routes between waypoints."""
import logging
from typing import Optional

import httpx
from app.config import get_settings

logger = logging.getLogger(__name__)


async def get_route(coordinates: list[tuple[float, float]]) -> Optional[dict]:
    """Get route geometry and duration/distance. coordinates = [(lon, lat), ...]."""
    if len(coordinates) < 2:
        return None
    settings = get_settings()
    if not settings.mapbox_access_token:
        return _mock_route(coordinates)
    coords_str = ";".join(f"{lon},{lat}" for lon, lat in coordinates)
    url = f"https://api.mapbox.com/directions/v5/mapbox/driving/{coords_str}"
    try:
        async with httpx.AsyncClient() as client:
            r = await client.get(
                url,
                params={"access_token": settings.mapbox_access_token, "geometries": "geojson"},
                timeout=30.0,
            )
            r.raise_for_status()
            data = r.json()
    except Exception as e:
        logger.warning("Mapbox Directions failed (%s); using straight-line mock route.", e)
        return _mock_route(coordinates)
    routes = data.get("routes", [])
    if not routes:
        return None
    route = routes[0]
    return {
        "geometry": route.get("geometry"),
        "duration_seconds": route.get("duration"),
        "distance_meters": route.get("distance"),
    }


def _mock_route(coordinates: list[tuple[float, float]]) -> dict:
    return {"geometry": {"type": "LineString", "coordinates": list(coordinates)}, "duration_seconds": 900, "distance_meters": 5000}
