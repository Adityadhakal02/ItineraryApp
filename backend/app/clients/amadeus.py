import logging
from typing import Optional

import httpx
from app.config import get_settings
from app.services import demo_content

logger = logging.getLogger(__name__)
AUTH_URL = "https://test.api.amadeus.com/v1/security/oauth2/token"
HOTELS_URL = "https://test.api.amadeus.com/v1/reference-data/locations/hotels/by-city"


async def get_hotels(
    city_code: str,
    near_lat: Optional[float] = None,
    near_lon: Optional[float] = None,
) -> list[dict]:
    settings = get_settings()
    if settings.demo_mode:
        return _mock_hotels(city_code, near_lat=near_lat, near_lon=near_lon)

    cid = (settings.amadeus_client_id or "").strip()
    sec = (settings.amadeus_client_secret or "").strip()
    if cid and sec:
        try:
            async with httpx.AsyncClient() as client:
                auth_r = await client.post(
                    AUTH_URL,
                    data={
                        "grant_type": "client_credentials",
                        "client_id": cid,
                        "client_secret": sec,
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
            amadeus_rows = [
                {"id": h.get("hotelId"), "name": h.get("name"), "lat": h.get("latitude"), "lon": h.get("longitude"), "source": "amadeus"}
                for h in data.get("data", [])[:10]
            ]
            if amadeus_rows:
                return amadeus_rows
        except Exception as e:
            logger.warning("Amadeus API failed (%s); trying OpenStreetMap hotels.", e)

    if near_lat is not None and near_lon is not None:
        from app.clients import osm_hotels

        live = await osm_hotels.search_hotels_nearby(near_lat, near_lon, limit=10)
        if live:
            return live

    return _mock_hotels(city_code, near_lat=near_lat, near_lon=near_lon)


def _mock_hotels(
    city_code: str,
    near_lat: Optional[float] = None,
    near_lon: Optional[float] = None,
) -> list[dict]:
    lat = near_lat if near_lat is not None else 48.8566
    lon = near_lon if near_lon is not None else 2.3522
    return demo_content.demo_hotels(city_code, lat, lon)
