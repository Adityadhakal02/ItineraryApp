"""Merge NL parsing, geocoding, and external APIs into a single itinerary payload."""
from __future__ import annotations

import asyncio
from datetime import datetime, timedelta
from typing import Any, Dict, List, Tuple

from app.clients import amadeus, mapbox, ticketmaster, yelp
from app.services.geocode import geocode_destination
from app.services.parse_trip import parse_trip_query


def _parse_ymd(s: str) -> datetime:
    return datetime.strptime((s or "")[:10], "%Y-%m-%d")


def _date_range_inclusive(start_s: str, end_s: str) -> List[str]:
    start = _parse_ymd(start_s)
    end = _parse_ymd(end_s)
    if end < start:
        end = start
    out: List[str] = []
    cur = start
    while cur <= end:
        out.append(cur.strftime("%Y-%m-%d"))
        cur += timedelta(days=1)
    return out


def _apply_geo_center(items: List[dict], lat: float, lon: float) -> List[dict]:
    res: List[dict] = []
    for i, it in enumerate(items):
        d = dict(it)
        la, lo = d.get("lat"), d.get("lon")
        if la in (None, "") or lo in (None, ""):
            d["lat"] = lat + (i % 4) * 0.004
            d["lon"] = lon + ((i + 1) % 3) * 0.004
        res.append(d)
    return res


async def build_itinerary_from_query(raw_query: str) -> Dict[str, Any]:
    plan = await parse_trip_query(raw_query)
    lat, lon = await geocode_destination(plan.destination)

    start_date = plan.start_date
    end_date = plan.end_date
    iata = (plan.iata_city_code or "NYC").strip().upper()[:3]
    yelp_term = (plan.interests or "restaurants").strip() or "restaurants"

    events, restaurants, hotels = await asyncio.gather(
        ticketmaster.search_events(
            plan.destination,
            start_date,
            end_date,
            keyword=plan.event_keyword,
        ),
        yelp.search_restaurants(lat, lon, term=yelp_term, limit=8),
        amadeus.get_hotels(iata, near_lat=lat, near_lon=lon),
    )

    events = _apply_geo_center(list(events), lat, lon)
    restaurants = _apply_geo_center(list(restaurants), lat + 0.008, lon + 0.008)
    hotels = _apply_geo_center(list(hotels), lat - 0.008, lon - 0.008)

    if not events:
        events = [
            {
                "name": "Explore " + plan.destination,
                "venue": plan.destination,
                "date": start_date,
                "time": "10:00",
                "lat": lat,
                "lon": lon,
                "price_min": 0,
                "price_max": 0,
            }
        ]

    dates = _date_range_inclusive(start_date, end_date)
    if not dates:
        dates = [start_date]

    n = len(dates)
    days: List[Dict[str, Any]] = []
    for i, d_str in enumerate(dates):
        ev_slice = [events[j] for j in range(len(events)) if j % n == i]
        if not ev_slice and events:
            ev_slice = [events[i % len(events)]]
        rest_slice = [restaurants[j] for j in range(len(restaurants)) if j % n == i]
        if not rest_slice and restaurants:
            rest_slice = [restaurants[i % len(restaurants)]]
        days.append(
            {
                "day": i + 1,
                "date": d_str,
                "events": ev_slice,
                "dining": rest_slice,
                "notes": "",
            }
        )

    waypoints: List[Tuple[float, float]] = []
    for src in (events[0] if events else None, restaurants[0] if restaurants else None, hotels[0] if hotels else None):
        if src and src.get("lon") is not None and src.get("lat") is not None:
            waypoints.append((float(src["lon"]), float(src["lat"])))

    route = None
    if len(waypoints) >= 2:
        route = await mapbox.get_route(waypoints)

    markers: List[Dict[str, Any]] = []
    for e in events[:6]:
        if e.get("lat") is not None and e.get("lon") is not None:
            markers.append(
                {
                    "lat": float(e["lat"]),
                    "lon": float(e["lon"]),
                    "label": str(e.get("name", "Event"))[:48],
                    "kind": "event",
                }
            )
    for r in restaurants[:6]:
        if r.get("lat") is not None and r.get("lon") is not None:
            markers.append(
                {
                    "lat": float(r["lat"]),
                    "lon": float(r["lon"]),
                    "label": str(r.get("name", "Dining"))[:48],
                    "kind": "restaurant",
                }
            )
    for h in hotels[:4]:
        if h.get("lat") is not None and h.get("lon") is not None:
            markers.append(
                {
                    "lat": float(h["lat"]),
                    "lon": float(h["lon"]),
                    "label": str(h.get("name", "Hotel"))[:48],
                    "kind": "hotel",
                }
            )

    total_ev = 0.0
    for e in events:
        pm, px = e.get("price_min"), e.get("price_max")
        if pm is not None or px is not None:
            total_ev += float((pm or 0) + (px or 0)) / 2.0
    event_avg = total_ev / len(events) if events else 0.0
    num_days = len(dates)
    estimated_cost = round(
        event_avg + 35 * min(len(restaurants), 6) + 95 * min(num_days, 5),
        2,
    )

    budget_total = plan.budget_usd
    title = (plan.title or "").strip() or f"{plan.destination} trip"

    payload: Dict[str, Any] = {
        "destination": plan.destination,
        "start_date": start_date,
        "end_date": end_date,
        "budget": budget_total,
        "estimated_cost": estimated_cost,
        "events": events,
        "restaurants": restaurants,
        "hotels": hotels,
        "days": days,
        "map": {
            "center": {"lat": lat, "lon": lon},
            "zoom": 11,
            "markers": markers,
            "route": route,
        },
        "parsed_plan": {
            "title": plan.title,
            "interests": plan.interests,
            "event_keyword": plan.event_keyword,
        },
    }

    return {
        "title": title,
        "destination": plan.destination,
        "start_date": start_date,
        "end_date": end_date,
        "budget_total": budget_total,
        "estimated_cost": estimated_cost,
        "payload": payload,
    }
