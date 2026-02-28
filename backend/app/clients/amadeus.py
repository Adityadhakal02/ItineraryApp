"""Amadeus API client for hotels (auth + hotel list)."""
import httpx
from app.config import get_settings

AUTH_URL = "https://test.api.amadeus.com/v1/security/oauth2/token"
HOTELS_URL = "https://test.api.amadeus.com/v1/reference-data/locations/hotels/by-city"


async def get_hotels(city_code: str) -> list[dict]:
    """Fetch hotel list by city (IATA code). Uses mock data if no Amadeus keys."""
    settings = get_settings()
    if not settings.amadeus_client_id or not settings.amadeus_client_secret:
        return _mock_hotels(city_code)
    async with httpx.AsyncClient() as client:
        auth_r = await client.post(
            AUTH_URL,
            data={
                "grant_type": "client_credentials",
                "client_id": settings.amadeus_client_id,
                "client_secret": settings.amadeus_client_secret,
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        auth_r.raise_for_status()
        token = auth_r.json().get("access_token")
        r = await client.get(
            HOTELS_URL,
            params={"cityCode": city_code},
            headers={"Authorization": f"Bearer {token}"},
        )
        r.raise_for_status()
        data = r.json()
    return [
        {"id": h.get("hotelId"), "name": h.get("name"), "lat": h.get("latitude"), "lon": h.get("longitude")}
        for h in data.get("data", [])[:10]
    ]


def _mock_hotels(city_code: str) -> list[dict]:
    return [
        {"id": "1", "name": "Grand Hotel Central", "lat": 48.8566, "lon": 2.3522},
        {"id": "2", "name": "Boutique Stay", "lat": 48.8584, "lon": 2.2945},
    ]
