from __future__ import annotations

import hashlib
from typing import List, Optional, Tuple

# DEV: _EventRow = (name, venue, time, price_min, price_max)
_EventRow = Tuple[str, str, str, int, int]

_EVENT_POOL: List[_EventRow] = [
    ("Songwriters in the round", "The Listening Room", "20:00", 28, 55),
    ("Indie showcase — standing room", "Mercury Hall", "21:00", 22, 45),
    ("Museum late hours + curator talk", "Contemporary Arts Annex", "18:30", 0, 22),
    ("Architecture & history walk", "Departure: Old Post Office steps", "10:00", 0, 18),
    ("Food hall tasting pass (5 vendors)", "Central Market Hall", "12:00", 35, 55),
    ("Jazz quartet — two sets", "Blue Note Cellar", "19:30", 40, 75),
    ("Comedy — early show", "Basement Laughter Club", "19:00", 25, 40),
    ("Outdoor film — bring blanket", "Riverside Amphitheater", "20:30", 0, 15),
    ("Farmers market + coffee crawl", "Downtown Square", "09:00", 0, 0),
    ("Cooking class: regional staples", "Kitchen Studio 4B", "17:00", 85, 110),
    ("Gallery opening — local artists", "North End Gallery", "18:00", 0, 0),
    ("Sunset kayak rental (2 hr)", "Harbor Outfitters Dock", "17:30", 45, 45),
]

_EVENT_CONCERT: List[_EventRow] = [
    ("Arena tour stop — general admission", "Metro Arena", "20:00", 65, 180),
    ("Outdoor amphitheater — lawn seats", "Summit Amphitheater", "19:30", 45, 95),
    ("Symphony — pops night", "Civic Concert Hall", "20:00", 38, 92),
]

_RESTAURANTS: List[Tuple[str, str, str]] = [
    ("Marlowe & Sons", "$$$", "1847 Morrison St"),
    ("Nighthawk Diner", "$", "22 Fleet Alley"),
    ("Petite Cerise", "$$$", "108 Rowan Pl"),
    ("Kin Khao", "$$", "400 Cedar Row"),
    ("Bar Volpe", "$$", "61 Harbor Walk"),
    ("Saint Étienne", "$$$", "9 Mercer Lane"),
    ("Talula's Table", "$$", "233 Birch Ave"),
    ("Cypress Room", "$$$", "88 Station St"),
    ("The Daily Catch", "$$", "15 Pier Rd"),
    ("Nightjar Supper Club", "$$$", "44 Elm Ct"),
    ("Pho Linh", "$", "902 District Blvd"),
    ("Café Ostara", "$$", "17 Larkspur Mews"),
]

_HOTELS: List[str] = [
    "The Atherton",
    "Harper Court Inn",
    "Grayson Hotel",
    "21c Museum Hotel",
    "The Line — City Center",
    "The Restoration",
    "Whitmore Place",
    "Evelyn Hotel",
]

_DAY_NOTES = [
    "Leave buffers between stops; transit runs ~15 min in the core.",
    "Book the evening ticket ahead; walk-ins fill fast on weekends.",
    "Start early for the market; grab coffee before the crowds.",
    "Swap lunch for a food-hall pass if you want more variety.",
    "Rain plan: swap the walk for the museum block — same area.",
]


def _seed(*parts: str) -> int:
    h = hashlib.sha256("|".join(p.lower().strip() for p in parts if p).encode()).hexdigest()
    return int(h[:12], 16)


def _pick(pool: List, seed: int, i: int):
    return pool[(seed + i) % len(pool)]


def demo_events(
    city: str,
    start_date: Optional[str],
    end_date: Optional[str],
    keyword: Optional[str],
    near_lat: float,
    near_lon: float,
) -> List[dict]:
    seed = _seed(city or "", keyword or "")
    pool: List[_EventRow] = list(_EVENT_POOL)
    kw = (keyword or "").lower()
    if any(x in kw for x in ("concert", "music", "show", "band", "live")):
        pool = _EVENT_CONCERT + pool
    d1 = start_date or "2026-04-01"
    d2 = end_date or start_date or "2026-04-03"
    out: List[dict] = []
    offsets = [0.006, -0.005, 0.003]
    for i in range(3):
        name, venue, time, pmin, pmax = _pick(pool, seed, i)
        out.append(
            {
                "id": f"demo-ev-{i + 1}",
                "name": name,
                "url": "https://example.com",
                "date": d1 if i < 2 else d2,
                "time": time,
                "venue": venue,
                "lat": near_lat + offsets[i],
                "lon": near_lon + (0.004, 0.007, -0.006)[i],
                "price_min": pmin,
                "price_max": pmax,
            }
        )
    return out


def demo_restaurants(lat: float, lon: float, place_name: Optional[str], limit: int = 8) -> List[dict]:
    seed = _seed(place_name or "", "r")
    shifts = [
        (0.008, 0.003),
        (-0.004, 0.009),
        (0.002, -0.007),
        (0.005, -0.002),
        (-0.003, 0.005),
        (0.007, 0.006),
    ]
    n = min(max(limit, 3), len(_RESTAURANTS))
    out: List[dict] = []
    for i in range(n):
        name, price, address = _pick(_RESTAURANTS, seed, i)
        dlat, dlon = shifts[i % len(shifts)]
        out.append(
            {
                "id": f"demo-y-{i + 1}",
                "name": name,
                "rating": round(4.1 + ((seed + i) % 7) * 0.08, 1),
                "price": price,
                "url": "https://example.com",
                "lat": lat + dlat,
                "lon": lon + dlon,
                "address": address,
            }
        )
    return out


def demo_hotels(city_code: str, near_lat: float, near_lon: float) -> List[dict]:
    seed = _seed(city_code or "", "h")
    shifts = [(0.009, 0.005), (-0.007, -0.004), (0.004, -0.008)]
    out: List[dict] = []
    for i in range(3):
        name = _pick(_HOTELS, seed, i)
        dlat, dlon = shifts[i]
        out.append(
            {
                "id": f"demo-h-{i + 1}",
                "name": name,
                "lat": near_lat + dlat,
                "lon": near_lon + dlon,
            }
        )
    return out


def day_note(day_index: int, city: str) -> str:
    return str(_pick(_DAY_NOTES, _seed(city, "notes"), day_index))
