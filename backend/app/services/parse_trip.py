"""Natural-language trip parsing via Gemini, with offline fallback."""
import json
import re
from datetime import date, timedelta
from typing import Any, Dict, Optional

from app.config import get_settings
from app.schemas.trip_plan import TripPlanParsed


def _today_str() -> str:
    return date.today().isoformat()


def _fallback_parse(raw_query: str) -> TripPlanParsed:
    """Heuristic extraction when Gemini is unavailable."""
    query = (raw_query or "").strip()
    parts = query.replace(",", " ").split()
    destination = "Trip"
    if parts:
        destination = " ".join(parts[: min(3, len(parts))]).title()
    start = date.today() + timedelta(days=7)
    end = start + timedelta(days=2)
    budget: Optional[float] = None
    for word in parts:
        digits = "".join(c for c in word if c.isdigit())
        if digits:
            budget = float(digits)
            break
    return TripPlanParsed(
        destination=destination,
        iata_city_code=None,
        start_date=start.isoformat(),
        end_date=end.isoformat(),
        budget_usd=budget,
        interests="restaurants",
        event_keyword=None,
        title=f"{destination} trip",
    )


def _guess_iata(destination: str) -> Optional[str]:
    d = destination.lower().strip()
    mapping = {
        "paris": "PAR",
        "new york": "NYC",
        "nyc": "NYC",
        "london": "LON",
        "tokyo": "TYO",
        "los angeles": "LAX",
        "san francisco": "SFO",
        "chicago": "CHI",
        "miami": "MIA",
        "boston": "BOS",
        "seattle": "SEA",
        "denver": "DEN",
        "austin": "AUS",
        "dallas": "DFW",
        "atlanta": "ATL",
        "washington": "WAS",
        "philadelphia": "PHL",
        "rome": "ROM",
        "barcelona": "BCN",
        "madrid": "MAD",
        "berlin": "BER",
        "amsterdam": "AMS",
        "dublin": "DUB",
        "sydney": "SYD",
        "melbourne": "MEL",
    }
    for key, code in mapping.items():
        if key in d or d in key:
            return code
    return None


def _coerce_plan(data: Dict[str, Any]) -> TripPlanParsed:
    dest = str(data.get("destination") or "Trip").strip() or "Trip"
    start = str(data.get("start_date") or "").strip()
    end = str(data.get("end_date") or "").strip()
    if not re.match(r"^\d{4}-\d{2}-\d{2}$", start):
        fb = _fallback_parse(dest)
        start = fb.start_date
    if not re.match(r"^\d{4}-\d{2}-\d{2}$", end):
        fb = _fallback_parse(dest)
        end = fb.end_date
    iata = data.get("iata_city_code")
    if isinstance(iata, str) and len(iata.strip()) == 3:
        iata_clean = iata.strip().upper()
    else:
        iata_clean = _guess_iata(dest)
    budget = data.get("budget_usd")
    if budget is not None:
        try:
            budget = float(budget)
        except (TypeError, ValueError):
            budget = None
    title = data.get("title")
    if not title:
        title = f"{dest} trip"
    return TripPlanParsed(
        destination=dest,
        iata_city_code=iata_clean,
        start_date=start,
        end_date=end,
        budget_usd=budget,
        interests=(data.get("interests") or "restaurants") if data.get("interests") else "restaurants",
        event_keyword=data.get("event_keyword"),
        title=str(title)[:120],
    )


async def parse_trip_query(raw_query: str) -> TripPlanParsed:
    settings = get_settings()
    key = (settings.google_gemini_api_key or "").strip()
    if not key:
        plan = _fallback_parse(raw_query)
        if not plan.iata_city_code:
            plan = plan.model_copy(update={"iata_city_code": _guess_iata(plan.destination)})
        return plan

    try:
        import google.generativeai as genai

        genai.configure(api_key=key)
        model = genai.GenerativeModel(
            "gemini-1.5-flash",
            generation_config={
                "response_mime_type": "application/json",
                "temperature": 0.2,
            },
        )
        today = _today_str()
        prompt = f"""You are a travel assistant. Extract structured trip parameters from the user message.

Today's date is {today} (use it for relative dates like "next weekend", "in two weeks").

Return ONLY a JSON object with these keys (no markdown):
- destination: string, primary city or region name in English
- iata_city_code: string or null — 3-letter IATA city code (e.g. PAR for Paris, NYC for New York). Null only if unsure.
- start_date: string YYYY-MM-DD
- end_date: string YYYY-MM-DD (at least one night; if single-day trip, end_date = start_date)
- budget_usd: number or null if not mentioned
- interests: short string for restaurant search (e.g. "sushi jazz rooftop")
- event_keyword: string or null — optional keyword for concerts/shows
- title: short trip title

User message:
\"\"\"{raw_query}\"\"\"
"""
        response = model.generate_content(prompt)
        text = (response.text or "").strip()
        data = json.loads(text)
        plan = _coerce_plan(data)
        if not plan.iata_city_code:
            plan = plan.model_copy(update={"iata_city_code": _guess_iata(plan.destination)})
        return plan
    except Exception:
        plan = _fallback_parse(raw_query)
        if not plan.iata_city_code:
            plan = plan.model_copy(update={"iata_city_code": _guess_iata(plan.destination)})
        return plan
