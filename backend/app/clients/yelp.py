"""Yelp Fusion API client for restaurants and optional lodging."""
import httpx
from app.config import get_settings

BASE = "https://api.yelp.com/v3"


async def search_restaurants(lat: float, lon: float, limit: int = 5, term: str = "restaurants") -> list[dict]:
    settings = get_settings()
    if not settings.yelp_api_key:
        return _mock_restaurants(lat, lon)
    headers = {"Authorization": f"Bearer {settings.yelp_api_key}"}
    params = {"latitude": lat, "longitude": lon, "limit": limit, "term": term}
    async with httpx.AsyncClient() as client:
        r = await client.get(f"{BASE}/businesses/search", headers=headers, params=params)
        r.raise_for_status()
        data = r.json()
    return [
        {
            "id": b.get("id"),
            "name": b.get("name"),
            "rating": b.get("rating"),
            "price": b.get("price"),
            "url": b.get("url"),
            "lat": b.get("coordinates", {}).get("latitude"),
            "lon": b.get("coordinates", {}).get("longitude"),
            "address": ", ".join(b.get("location", {}).get("display_address", [])),
        }
        for b in data.get("businesses", [])
    ]


def _mock_restaurants(lat: float, lon: float) -> list[dict]:
    return [
        {"id": "1", "name": "Bistro Central", "rating": 4.5, "price": "$$", "url": "https://yelp.com", "lat": lat + 0.01, "lon": lon, "address": "123 Main St"},
        {"id": "2", "name": "Cafe du Marché", "rating": 4.2, "price": "$", "url": "https://yelp.com", "lat": lat, "lon": lon + 0.01, "address": "45 Market St"},
    ]
