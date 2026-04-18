import logging
from typing import Optional

import httpx
from app.config import get_settings
from app.services import demo_content

logger = logging.getLogger(__name__)
BASE = "https://api.yelp.com/v3"


async def search_restaurants(
    lat: float,
    lon: float,
    limit: int = 5,
    term: str = "restaurants",
    place_name: Optional[str] = None,
) -> list[dict]:
    settings = get_settings()
    if settings.demo_mode:
        return _mock_restaurants(lat, lon, place_name=place_name, limit=limit)

    key = (settings.yelp_api_key or "").strip()
    if key:
        headers = {"Authorization": f"Bearer {key}"}
        params = {"latitude": lat, "longitude": lon, "limit": limit, "term": term}
        try:
            async with httpx.AsyncClient() as client:
                r = await client.get(f"{BASE}/businesses/search", headers=headers, params=params, timeout=30.0)
                r.raise_for_status()
                data = r.json()
            out = [
                {
                    "id": b.get("id"),
                    "name": b.get("name"),
                    "rating": b.get("rating"),
                    "price": b.get("price"),
                    "url": b.get("url"),
                    "lat": b.get("coordinates", {}).get("latitude"),
                    "lon": b.get("coordinates", {}).get("longitude"),
                    "address": ", ".join(b.get("location", {}).get("display_address", [])),
                    "source": "yelp",
                }
                for b in data.get("businesses", [])
            ]
            if out:
                return out
        except Exception as e:
            logger.warning("Yelp API failed (%s); trying OpenStreetMap.", e)

    from app.clients import osm_food

    live = await osm_food.search_restaurants_nearby(lat, lon, limit=limit, term=term)
    if live:
        return live
    logger.warning("No dining POIs from OpenStreetMap near (%.4f, %.4f).", lat, lon)
    return []


def _mock_restaurants(
    lat: float, lon: float, place_name: Optional[str] = None, limit: int = 8
) -> list[dict]:
    return demo_content.demo_restaurants(lat, lon, place_name, limit=limit)
