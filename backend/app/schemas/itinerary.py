from typing import Optional
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ItineraryCreate(BaseModel):
    query: str = Field(min_length=1, max_length=4000)


class ItineraryUpdate(BaseModel):
    title: Optional[str] = None
    payload: Optional[dict] = None


class ItineraryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

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


class ItineraryList(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: Optional[str]
    destination: Optional[str]
    start_date: Optional[str]
    end_date: Optional[str]
    budget_total: Optional[float]
    estimated_cost: Optional[float]
    created_at: datetime
