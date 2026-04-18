import logging
import re
from typing import Any, Optional

import httpx

logger = logging.getLogger(__name__)

_OVERPASS_URL = "https://overpass-api.de/api/interpreter"


def _norm(s: str) -> str:
    return re.sub(r"\s+", " ", (s or "").lower()).strip()


def _overpass_body(lat: float, lon: float, radius_m: int) -> str:
    return f"""[out:json][timeout:25];
(
  node["amenity"~"restaurant|fast_food|cafe|bar|food_court|ice_cream"](around:{radius_m},{lat},{lon});
  way["amenity"~"restaurant|fast_food|cafe|bar|food_court|ice_cream"](around:{radius_m},{lat},{lon});
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


def _element_id_url(el: dict[str, Any]) -> tuple[str, str]:
    t = el.get("type") or "node"
    eid = el.get("id")
    sid = f"{t}/{eid}" if eid is not None else "unknown"
    if t == "way" and eid is not None:
        return sid, f"https://www.openstreetmap.org/way/{eid}"
    if t == "node" and eid is not None:
        return sid, f"https://www.openstreetmap.org/node/{eid}"
    return sid, "https://www.openstreetmap.org/"


def _address(tags: dict[str, Any]) -> str:
    parts = [
        tags.get("addr:housenumber"),
        tags.get("addr:street"),
        tags.get("addr:city") or tags.get("addr:place"),
    ]
    return ", ".join(p for p in parts if p)


def _score_match(tags: dict[str, Any], term: str) -> int:
    if not term:
        return 1
    blob = _norm(f"{tags.get('name', '')} {tags.get('cuisine', '')} {tags.get('amenity', '')}")
    score = 0
    for w in re.findall(r"[a-z0-9]+", _norm(term)):
        if len(w) < 3:
            continue
        if w in blob:
            score += 2
    return score


async def search_restaurants_nearby(
    lat: float,
    lon: float,
    limit: int = 8,
    term: str = "restaurants",
) -> list[dict]:
    rows: list[dict[str, Any]] = []
    for radius in (1500, 4000, 10000):
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
            logger.warning("Overpass request failed (radius=%s): %s", radius, e)
            continue
        elements = data.get("elements") or []
        for el in elements:
            tags = el.get("tags") or {}
            name = (tags.get("name") or "").strip()
            if not name:
                continue
            pt = _element_point(el)
            if not pt:
                continue
            la, lo = pt
            sid, url = _element_id_url(el)
            rows.append(
                {
                    "_score": _score_match(tags, term),
                    "id": f"osm:{sid}",
                    "name": name[:200],
                    "rating": None,
                    "price": None,
                    "url": url,
                    "lat": la,
                    "lon": lo,
                    "address": _address(tags) or None,
                    "source": "openstreetmap",
                }
            )
        if len(rows) >= max(limit, 4):
            break

    rows.sort(key=lambda x: (-int(x.get("_score") or 0), x.get("name") or ""))
    for r in rows:
        r.pop("_score", None)
    return rows[:limit]
