"""Pydantic schemas for itineraries."""
from typing import Any, Optional
from pydantic import BaseModel
from datetime import datetime


class ItineraryCreate(BaseModel):
    query: str  # Natural language, e.g. "Paris art weekend €800"


class ItineraryUpdate(BaseModel):
    title: Optional[str] = None
    payload: Optional[dict] = None


class ItineraryOut(BaseModel):
    id: int
    user_id: int
    title: Optional[str]
    raw_query: Optional[str]
    destination: Optional[str]
    start_date: Optional[str]
    end_date: Optional[str]
    budget_total: Optional[float]
    estimated_cost: Optional[float]
    payload: Optional[dict]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ItineraryList(BaseModel):
    id: int
    title: Optional[str]
    destination: Optional[str]
    start_date: Optional[str]
    end_date: Optional[str]
    budget_total: Optional[float]
    estimated_cost: Optional[float]
    created_at: datetime

    class Config:
        from_attributes = True
