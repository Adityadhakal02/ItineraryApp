import logging
from typing import Any, Optional

import httpx

logger = logging.getLogger(__name__)

_OVERPASS_URL = "https://overpass-api.de/api/interpreter"


def _overpass_body(lat: float, lon: float, radius_m: int) -> str:
    return f"""[out:json][timeout:25];
(
  node["tourism"~"hotel|motel|guest_house|hostel|apartment"](around:{radius_m},{lat},{lon});
  way["tourism"~"hotel|motel|guest_house|hostel|apartment"](around:{radius_m},{lat},{lon});
  node["building"="hotel"](around:{radius_m},{lat},{lon});
  way["building"="hotel"](around:{radius_m},{lat},{lon});
);
out center;
"""


def _element_point(el: dict[str, Any]) -> Optional[tuple[float, float]]:
    if el.get("type") == "node" and el.get("lat") is not None and el.get("lon") is not None:
        return float(el["lat"]), float(el["lon"])
    c = el.get("center") or {}
    if c.get("lat") is not None and c.get("lon") is not None:
        return float(c["lat"]), float(c["lon"])
    return None


def _element_id(el: dict[str, Any]) -> str:
    t = el.get("type") or "node"
    eid = el.get("id")
    return f"osm:{t}/{eid}" if eid is not None else "osm:unknown"


async def search_hotels_nearby(lat: float, lon: float, limit: int = 10) -> list[dict]:
    seen: set[str] = set()
    out: list[dict] = []
    for radius in (2500, 6000, 15000):
        body = _overpass_body(lat, lon, radius)
        try:
            async with httpx.AsyncClient() as client:
                r = await client.post(
                    _OVERPASS_URL,
                    content=body,
                    headers={"User-Agent": "ItineraryApp/1.0 (academic project)", "Content-Type": "text/plain"},
                    timeout=45.0,
                )
                r.raise_for_status()
                data = r.json()
        except Exception as e:
            logger.warning("Overpass hotels (radius=%s): %s", radius, e)
            continue
        for el in data.get("elements") or []:
            tags = el.get("tags") or {}
            name = (tags.get("name") or tags.get("operator") or "").strip()
            if not name:
                continue
            pt = _element_point(el)
            if not pt:
                continue
            la, lo = pt
            eid = _element_id(el)
            if eid in seen:
                continue
            seen.add(eid)
            out.append(
                {
                    "id": eid,
                    "name": name[:200],
                    "lat": la,
                    "lon": lo,
                    "source": "openstreetmap",
                }
            )
            if len(out) >= limit:
                return out[:limit]
    return out[:limit]
