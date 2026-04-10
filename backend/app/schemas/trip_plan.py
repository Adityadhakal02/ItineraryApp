"""Structured trip parameters from NL parsing (Gemini or fallback)."""
from typing import Optional

from pydantic import BaseModel, Field


class TripPlanParsed(BaseModel):
    destination: str = Field(..., description="Primary city or place name")
    iata_city_code: Optional[str] = Field(None, description="3-letter IATA city code if known")
    start_date: str = Field(..., description="YYYY-MM-DD")
    end_date: str = Field(..., description="YYYY-MM-DD")
    budget_usd: Optional[float] = None
    interests: Optional[str] = Field(None, description="Yelp search terms, e.g. italian dinner")
    event_keyword: Optional[str] = Field(None, description="Ticketmaster keyword")
    title: Optional[str] = None
