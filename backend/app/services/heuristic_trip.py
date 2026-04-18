from __future__ import annotations

import re
from datetime import date, timedelta
from typing import Optional, Tuple

from app.demo_places import match_place
from app.schemas.trip_plan import TripPlanParsed

_STOP = frozenset(
    """
    a an the to in on for of at by from into over with without under around
    trip weekend week days day nights night plan want need ideas budget about
    my me i we us please help under below max around approx roughly
    """.split()
)


def _extract_budget(text: str) -> Optional[float]:
    t = text.replace(",", "")
    patterns = [
        r"(?:under|below|max|budget|around|~)\s*\$?\s*(\d{2,6})\b",
        r"\$\s*(\d{2,6})\b",
        r"€\s*(\d{2,6})\b",
        r"(\d{2,6})\s*(?:usd|dollars?)\b",
    ]
    for pat in patterns:
        m = re.search(pat, t, re.I)
        if m:
            try:
                return float(m.group(1))
            except ValueError:
                pass
    return None


def _extract_trip_length_days(low: str) -> Optional[int]:
    m = re.search(r"(\d+)\s*days?", low)
    if m:
        n = int(m.group(1))
        return max(1, min(n, 21))
    if "long weekend" in low:
        return 3
    if "weekend" in low:
        return 2
    if re.search(r"\bweek\b", low) and "weekend" not in low:
        return 7
    return None


def _next_saturday(from_d: date) -> date:
    d = from_d
    while d.weekday() != 5:
        d += timedelta(days=1)
    return d


def _date_range(low: str, raw: str) -> Tuple[str, str]:
    today = date.today()
    n_days = _extract_trip_length_days(low)

    if "tomorrow" in low:
        start = today + timedelta(days=1)
    elif "next weekend" in low:
        start = _next_saturday(today) + timedelta(days=7)
    elif "this weekend" in low:
        start = _next_saturday(today)
    elif "weekend" in low and "long weekend" not in low:
        start = _next_saturday(today)
    elif "in two weeks" in low or "two weeks" in low:
        start = today + timedelta(days=14)
    elif "next week" in low:
        start = today + timedelta(days=7)
    else:
        start = today + timedelta(days=7)

    if n_days is not None:
        end = start + timedelta(days=max(0, n_days - 1))
    else:
        end = start + timedelta(days=2)
    if end < start:
        end = start
    return start.isoformat(), end.isoformat()


def _extract_interests(low: str) -> str:
    pairs = [
        (("sushi", "ramen", "japanese"), "Japanese food"),
        (("italian", "pasta", "pizza"), "Italian restaurants"),
        (("french", "bistro"), "French dining"),
        (("vegan", "vegetarian"), "vegetarian vegan"),
        (("seafood", "fish"), "seafood"),
        (("art", "museum", "gallery"), "art museums"),
        (("nightlife", "club", "bars", "cocktail"), "nightlife cocktails"),
        (("coffee", "cafe"), "coffee cafes"),
        (("family", "kids"), "family friendly dining"),
        (("brunch",), "brunch"),
        (("bbq", "barbecue"), "BBQ"),
    ]
    for keys, label in pairs:
        if any(k in low for k in keys):
            return label
    return "local restaurants"


def _extract_event_keyword(low: str) -> Optional[str]:
    if "concert" in low or "live music" in low:
        return "concert"
    if "theatre" in low or "theater" in low or "broadway" in low:
        return "theater"
    if "festival" in low:
        return "festival"
    if "sports" in low or ("game" in low and "video" not in low):
        return "sports"
    return None


def _infer_destination_words(raw: str) -> str:
    q = raw.strip()
    low = q.lower()
    for prefix in (
        "plan a ",
        "plan ",
        "i want ",
        "i'd like ",
        "trip to ",
        "visit ",
        "weekend in ",
        "week in ",
        "days in ",
        "travel to ",
        "going to ",
    ):
        if low.startswith(prefix):
            q = q[len(prefix) :].strip()
            low = q.lower()
            break
    words = re.findall(r"[A-Za-z]+", q)
    picked: list[str] = []
    for w in words:
        wl = w.lower()
        if wl in _STOP or len(wl) < 2:
            continue
        picked.append(w.title())
        if len(picked) >= 3:
            break
    if picked:
        return " ".join(picked)
    return "City trip"


def _guess_iata_from_name(destination: str) -> Optional[str]:
    m = match_place(destination.lower())
    if m:
        return m[3]
    return None


def heuristic_trip_plan(raw_query: str) -> TripPlanParsed:
    raw = (raw_query or "").strip()
    low = raw.lower()
    start_s, end_s = _date_range(low, raw)
    budget = _extract_budget(raw)

    place = match_place(low)
    if place:
        dest, _, _, iata = place
    else:
        dest = _infer_destination_words(raw)
        iata = _guess_iata_from_name(dest)

    interests = _extract_interests(low)
    event_kw = _extract_event_keyword(low)

    try:
        sd = date.fromisoformat(start_s)
        ed = date.fromisoformat(end_s)
        nights = max(0, (ed - sd).days)
        span = nights + 1
        if span <= 2:
            title = f"{dest} · short stay"
        elif span <= 4:
            title = f"{dest} · {span}-day getaway"
        else:
            title = f"{dest} · {span} days"
    except ValueError:
        title = f"{dest} trip"

    return TripPlanParsed(
        destination=dest,
        iata_city_code=iata,
        start_date=start_s,
        end_date=end_s,
        budget_usd=budget,
        interests=interests,
        event_keyword=event_kw,
        title=title[:120],
    )
