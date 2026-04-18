from typing import Optional

from pydantic import BaseModel


class TripPlanParsed(BaseModel):
    destination: str
    iata_city_code: Optional[str] = None
    start_date: str
    end_date: str
    budget_usd: Optional[float] = None
    interests: Optional[str] = None
    event_keyword: Optional[str] = None
    title: Optional[str] = None
