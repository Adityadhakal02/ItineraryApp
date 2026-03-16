from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models import User, Itinerary
from app.schemas.itinerary import ItineraryCreate, ItineraryOut, ItineraryList
from app.auth.deps import get_current_user
from app.clients import ticketmaster

router = APIRouter()


@router.post("/", response_model=ItineraryOut)
async def create_itinerary(
    data: ItineraryCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # stub: no LLM yet, just use first word as destination and try to get a number for budget
    query = (data.query or "").strip()
    parts = query.split()
    destination = parts[0].title() if parts else "Trip"
    start_date = "2026-04-01"
    end_date = "2026-04-03"
    budget_total = None
    for word in parts:
        s = "".join(c for c in word if c.isdigit())
        if s:
            budget_total = float(s)
            break

    events = await ticketmaster.search_events(destination, start_date, end_date, keyword=None)
    if not events:
        events = [{"name": "Explore " + destination, "venue": destination, "date": start_date, "time": "10:00", "lat": 48.8566, "lon": 2.3522, "price_min": 0, "price_max": 0}]

    restaurants = [
        {"name": "Local Bistro", "rating": 4.2, "price": "$$", "address": "123 Main St", "lat": 48.8566, "lon": 2.3522},
        {"name": "Cafe Central", "rating": 4.0, "price": "$", "address": "45 Center Ave", "lat": 48.8584, "lon": 2.2945},
    ]
    hotels = [
        {"name": "Central Hotel", "lat": 48.8566, "lon": 2.3522},
        {"name": "Downtown Stay", "lat": 48.8584, "lon": 2.2945},
    ]

    total = 0
    for e in events:
        total += (e.get("price_min") or 0) + (e.get("price_max") or 0)
    event_avg = total / len(events) if events else 0
    estimated_cost = round(event_avg + 80 + 120, 2)

    payload: dict[str, Any] = {
        "destination": destination,
        "start_date": start_date,
        "end_date": end_date,
        "budget": budget_total,
        "estimated_cost": estimated_cost,
        "events": events,
        "restaurants": restaurants,
        "hotels": hotels,
        "days": [
            {"day": 1, "date": start_date, "events": events[:1], "dining": restaurants[:1], "notes": ""},
            {"day": 2, "date": end_date, "events": events[1:] if len(events) > 1 else events[:1], "dining": restaurants[1:], "notes": ""},
        ],
    }

    title = destination + " trip"
    itinerary = Itinerary(
        user_id=user.id,
        title=title,
        raw_query=data.query,
        destination=destination,
        start_date=start_date,
        end_date=end_date,
        budget_total=budget_total,
        estimated_cost=estimated_cost,
        payload=payload,
    )
    db.add(itinerary)
    await db.commit()
    await db.refresh(itinerary)
    return itinerary


@router.get("/", response_model=List[ItineraryList])
async def list_itineraries(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Itinerary).where(Itinerary.user_id == user.id).order_by(Itinerary.created_at.desc())
    )
    return result.scalars().all()


@router.get("/{itinerary_id}", response_model=ItineraryOut)
async def get_itinerary(
    itinerary_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Itinerary).where(Itinerary.id == itinerary_id, Itinerary.user_id == user.id)
    )
    itinerary = result.scalar_one_or_none()
    if not itinerary:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Itinerary not found")
    return itinerary
