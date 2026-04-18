from __future__ import annotations

from typing import Optional, Tuple

# DEV: _PLACES values are (lat, lon, iata); dict keys are lowercase lookup tokens.
_PLACES: dict[str, Tuple[float, float, Optional[str]]] = {
    "paris": (48.8566, 2.3522, "PAR"),
    "london": (51.5074, -0.1278, "LON"),
    "tokyo": (35.6762, 139.6503, "TYO"),
    "new york": (40.7128, -74.0060, "NYC"),
    "nyc": (40.7128, -74.0060, "NYC"),
    "los angeles": (34.0522, -118.2437, "LAX"),
    "san francisco": (37.7749, -122.4194, "SFO"),
    "chicago": (41.8781, -87.6298, "CHI"),
    "miami": (25.7617, -80.1918, "MIA"),
    "boston": (42.3601, -71.0589, "BOS"),
    "seattle": (47.6062, -122.3321, "SEA"),
    "denver": (39.7392, -104.9903, "DEN"),
    "austin": (30.2672, -97.7431, "AUS"),
    "dallas": (32.7767, -96.7970, "DFW"),
    "atlanta": (33.7490, -84.3880, "ATL"),
    "washington dc": (38.9072, -77.0369, "WAS"),
    "washington": (38.9072, -77.0369, "WAS"),
    "philadelphia": (39.9526, -75.1652, "PHL"),
    "rome": (41.9028, 12.4964, "ROM"),
    "barcelona": (41.3851, 2.1734, "BCN"),
    "madrid": (40.4168, -3.7038, "MAD"),
    "berlin": (52.5200, 13.4050, "BER"),
    "amsterdam": (52.3676, 4.9041, "AMS"),
    "dublin": (53.3498, -6.2603, "DUB"),
    "sydney": (-33.8688, 151.2093, "SYD"),
    "melbourne": (-37.8136, 144.9631, "MEL"),
    "singapore": (1.3521, 103.8198, "SIN"),
    "dubai": (25.2048, 55.2708, "DXB"),
    "lisbon": (38.7223, -9.1393, "LIS"),
    "prague": (50.0755, 14.4378, "PRG"),
    "vienna": (48.2082, 16.3738, "VIE"),
    "istanbul": (41.0082, 28.9784, "IST"),
    "cairo": (30.0444, 31.2357, "CAI"),
    "mumbai": (19.0760, 72.8777, "BOM"),
    "bangkok": (13.7563, 100.5018, "BKK"),
    "hong kong": (22.3193, 114.1694, "HKG"),
    "toronto": (43.6532, -79.3832, "YTO"),
    "vancouver": (49.2827, -123.1207, "YVR"),
    "montreal": (45.5017, -73.5673, "YMQ"),
    "mexico city": (19.4326, -99.1332, "MEX"),
    "rio de janeiro": (-22.9068, -43.1729, "RIO"),
    "buenos aires": (-34.6037, -58.3816, "BUE"),
    "honolulu": (21.3069, -157.8583, "HNL"),
    "portland": (45.5152, -122.6784, "PDX"),
    "nashville": (36.1627, -86.7816, "BNA"),
    "new orleans": (29.9511, -90.0715, "MSY"),
    "las vegas": (36.1699, -115.1398, "LAS"),
    "orlando": (28.5383, -81.3792, "MCO"),
    "phoenix": (33.4484, -112.0740, "PHX"),
    "salt lake city": (40.7608, -111.8910, "SLC"),
    "kathmandu": (27.7172, 85.3240, "KTM"),
    "pokhara": (28.2096, 83.9856, None),
}


_DISPLAY: dict[str, str] = {
    "new york": "New York",
    "los angeles": "Los Angeles",
    "san francisco": "San Francisco",
    "washington dc": "Washington DC",
    "hong kong": "Hong Kong",
    "mexico city": "Mexico City",
    "salt lake city": "Salt Lake City",
    "new orleans": "New Orleans",
    "las vegas": "Las Vegas",
    "rio de janeiro": "Rio de Janeiro",
    "buenos aires": "Buenos Aires",
}


def match_place(query_lower: str) -> Optional[Tuple[str, float, float, Optional[str]]]:
    best: Optional[Tuple[int, str, float, float, Optional[str]]] = None
    for token, (lat, lon, iata) in _PLACES.items():
        if token in query_lower:
            if best is None or len(token) > best[0]:
                display = _DISPLAY.get(token, " ".join(w.title() for w in token.split()))
                best = (len(token), display, lat, lon, iata)
    if not best:
        return None
    _, name, lat, lon, iata = best
    return name, lat, lon, iata


def demo_coords_for_destination(destination: str) -> Optional[Tuple[float, float]]:
    m = match_place(destination.lower().strip())
    if m:
        return m[1], m[2]
    return None
