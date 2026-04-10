from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models import User, Itinerary
from app.schemas.itinerary import ItineraryCreate, ItineraryOut, ItineraryList
from app.auth.deps import get_current_user
from app.services.orchestrator import build_itinerary_from_query

router = APIRouter()


@router.post("", response_model=ItineraryOut)
async def create_itinerary(
    data: ItineraryCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    built = await build_itinerary_from_query((data.query or "").strip())
    title = built["title"]
    destination = built["destination"]
    start_date = built["start_date"]
    end_date = built["end_date"]
    budget_total = built["budget_total"]
    estimated_cost = built["estimated_cost"]
    payload = built["payload"]

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


@router.get("", response_model=List[ItineraryList])
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
    itinerary = result.scalars().first()
    if not itinerary:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Itinerary not found")
    return itinerary
