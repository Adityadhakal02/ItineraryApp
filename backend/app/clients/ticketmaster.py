import logging
from typing import Optional

import httpx
from app.config import get_settings
from app.services import demo_content

logger = logging.getLogger(__name__)
BASE = "https://app.ticketmaster.com/discovery/v2"


async def search_events(
    city: str,
    start_date: Optional[str],
    end_date: Optional[str],
    keyword: Optional[str] = None,
    near_lat: Optional[float] = None,
    near_lon: Optional[float] = None,
) -> list[dict]:
    settings = get_settings()
    if settings.demo_mode or not settings.ticketmaster_api_key:
        return _mock_events(city, start_date, end_date, keyword=keyword, near_lat=near_lat, near_lon=near_lon)
    params = {"apikey": settings.ticketmaster_api_key, "city": city, "size": "10"}
    if keyword:
        params["keyword"] = keyword
    if start_date:
        params["startDateTime"] = f"{start_date}T00:00:00Z"
    if end_date:
        params["endDateTime"] = f"{end_date}T23:59:59Z"
    try:
        async with httpx.AsyncClient() as client:
            r = await client.get(f"{BASE}/events.json", params=params, timeout=30.0)
            r.raise_for_status()
            data = r.json()
    except Exception as e:
        logger.warning("Ticketmaster API failed (%s); using mock events.", e)
        return _mock_events(city, start_date, end_date, keyword=keyword, near_lat=near_lat, near_lon=near_lon)
    events = data.get("_embedded", {}).get("events", [])
    return [
        {
            "id": e.get("id"),
            "name": e.get("name"),
            "url": e.get("url"),
            "date": e.get("dates", {}).get("start", {}).get("localDate"),
            "time": e.get("dates", {}).get("start", {}).get("localTime"),
            "venue": e.get("_embedded", {}).get("venues", [{}])[0].get("name"),
            "lat": _lat(e),
            "lon": _lon(e),
            "price_min": e.get("priceRanges", [{}])[0].get("min"),
            "price_max": e.get("priceRanges", [{}])[0].get("max"),
        }
        for e in events[:10]
    ]


def _lat(e: dict) -> Optional[float]:
    v = e.get("_embedded", {}).get("venues", [{}])
    return float(v[0].get("location", {}).get("latitude")) if v and v[0].get("location") else None


def _lon(e: dict) -> Optional[float]:
    v = e.get("_embedded", {}).get("venues", [{}])
    return float(v[0].get("location", {}).get("longitude")) if v and v[0].get("location") else None


def _mock_events(
    city: str,
    start_date: Optional[str],
    end_date: Optional[str],
    keyword: Optional[str] = None,
    near_lat: Optional[float] = None,
    near_lon: Optional[float] = None,
) -> list[dict]:
    lat0 = near_lat if near_lat is not None else 40.7128
    lon0 = near_lon if near_lon is not None else -74.0060
    return demo_content.demo_events(city, start_date, end_date, keyword, lat0, lon0)
