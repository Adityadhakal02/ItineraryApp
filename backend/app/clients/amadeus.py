"""Amadeus API client for hotels (auth + hotel list)."""
import logging
from typing import Optional

import httpx
from app.config import get_settings

logger = logging.getLogger(__name__)
AUTH_URL = "https://test.api.amadeus.com/v1/security/oauth2/token"
HOTELS_URL = "https://test.api.amadeus.com/v1/reference-data/locations/hotels/by-city"


async def get_hotels(
    city_code: str,
    near_lat: Optional[float] = None,
    near_lon: Optional[float] = None,
) -> list[dict]:
    """Fetch hotel list by city (IATA code). Test API. Mocks if no keys or on error."""
    settings = get_settings()
    if not settings.amadeus_client_id or not settings.amadeus_client_secret:
        return _mock_hotels(city_code, near_lat=near_lat, near_lon=near_lon)
    try:
        async with httpx.AsyncClient() as client:
            auth_r = await client.post(
                AUTH_URL,
                data={
                    "grant_type": "client_credentials",
                    "client_id": settings.amadeus_client_id,
                    "client_secret": settings.amadeus_client_secret,
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"},
                timeout=30.0,
            )
            auth_r.raise_for_status()
            token = auth_r.json().get("access_token")
            r = await client.get(
                HOTELS_URL,
                params={"cityCode": city_code},
                headers={"Authorization": f"Bearer {token}"},
                timeout=30.0,
            )
            r.raise_for_status()
            data = r.json()
    except Exception as e:
        logger.warning("Amadeus API failed (%s); using mock hotels.", e)
        return _mock_hotels(city_code, near_lat=near_lat, near_lon=near_lon)
    return [
        {"id": h.get("hotelId"), "name": h.get("name"), "lat": h.get("latitude"), "lon": h.get("longitude")}
        for h in data.get("data", [])[:10]
    ]


def _mock_hotels(
    city_code: str,
    near_lat: Optional[float] = None,
    near_lon: Optional[float] = None,
) -> list[dict]:
    lat = near_lat if near_lat is not None else 48.8566
    lon = near_lon if near_lon is not None else 2.3522
    return [
        {"id": "1", "name": "Grand Hotel Central", "lat": lat + 0.01, "lon": lon + 0.01},
        {"id": "2", "name": "Boutique Stay", "lat": lat - 0.01, "lon": lon - 0.01},
    ]
