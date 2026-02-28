"""Pydantic schemas for itineraries."""
from pydantic import BaseModel
from datetime import datetime
from typing import Any


class ItineraryCreate(BaseModel):
    query: str  # Natural language, e.g. "Paris art weekend €800"


class ItineraryUpdate(BaseModel):
    title: str | None = None
    payload: dict | None = None


class ItineraryOut(BaseModel):
    id: int
    user_id: int
    title: str | None
    raw_query: str | None
    destination: str | None
    start_date: str | None
    end_date: str | None
    budget_total: float | None
    estimated_cost: float | None
    payload: dict | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ItineraryList(BaseModel):
    id: int
    title: str | None
    destination: str | None
    start_date: str | None
    end_date: str | None
    budget_total: float | None
    estimated_cost: float | None
    created_at: datetime

    class Config:
        from_attributes = True
