from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, HttpUrl
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.security import get_current_admin
from app.database import get_db
from app.models.models import AdminUser, CountdownEvent

public_router = APIRouter(prefix="/api/countdowns", tags=["Exam Countdowns"])
admin_router = APIRouter(
    prefix="/api/admin/countdowns",
    tags=["Admin Countdown Management"],
    dependencies=[Depends(get_current_admin)],
)


class CountdownCreate(BaseModel):
    title: str
    exam_name: Optional[str] = None
    authority_code: str = "GOVT"
    event_type: str = "EXAM_DATE"
    target_date: datetime
    official_source: str = "Official Gazette"
    verification_status: str = "CONFIRMED_OFFICIAL"
    result_status: Optional[str] = None
    exam_slug: str = "general-exam"
    official_portal_url: HttpUrl = "https://india.gov.in"


def _serialize(event: CountdownEvent) -> dict:
    return {
        "id": event.id,
        "title": event.title,
        "exam_name": event.exam_name,
        "authority_code": event.authority_code,
        "event_type": event.event_type,
        "target_date": event.target_date.isoformat(),
        "official_source": event.official_source,
        "verification_status": event.verification_status,
        "result_status": event.result_status,
        "exam_slug": event.exam_slug,
        "official_portal_url": event.official_portal_url,
        "created_at": event.created_at.isoformat() if event.created_at else None,
        "updated_at": event.updated_at.isoformat() if event.updated_at else None,
    }


async def _list_events(db: AsyncSession, event_type: Optional[str] = None, event_types: Optional[list[str]] = None) -> dict:
    query = select(CountdownEvent)
    if event_type:
        query = query.where(CountdownEvent.event_type == event_type)
    elif event_types:
        query = query.where(CountdownEvent.event_type.in_(event_types))
    query = query.order_by(CountdownEvent.target_date.asc())
    result = await db.execute(query)
    events = [_serialize(event) for event in result.scalars().all()]
    return {"total": len(events), "countdowns": events}


@public_router.get("/exams")
async def list_exam_countdowns(db: AsyncSession = Depends(get_db)):
    return await _list_events(db, event_types=["EXAM_DATE", "APPLICATION_DEADLINE"])


@public_router.get("/results")
async def list_result_countdowns(db: AsyncSession = Depends(get_db)):
    return await _list_events(db, "RESULT_ANNOUNCEMENT")


@admin_router.get("")
async def list_admin_countdowns(db: AsyncSession = Depends(get_db)):
    return await _list_events(db)


@admin_router.post("", status_code=status.HTTP_201_CREATED)
async def create_countdown(
    payload: CountdownCreate,
    db: AsyncSession = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin),
):
    title = payload.title.strip()
    if not title:
        raise HTTPException(status_code=400, detail="Title is required")
    if payload.event_type not in {"EXAM_DATE", "APPLICATION_DEADLINE", "RESULT_ANNOUNCEMENT", "ADMIT_CARD_RELEASE"}:
        raise HTTPException(status_code=400, detail="Unsupported countdown event type")
    event = CountdownEvent(
        title=title,
        exam_name=(payload.exam_name or title).strip(),
        authority_code=payload.authority_code.strip().upper(),
        event_type=payload.event_type,
        target_date=payload.target_date,
        official_source=payload.official_source.strip(),
        verification_status=payload.verification_status.strip().upper(),
        result_status=(payload.result_status or ("CONFIRMED_OFFICIAL" if payload.event_type == "RESULT_ANNOUNCEMENT" else None)),
        exam_slug=payload.exam_slug.strip().lower(),
        official_portal_url=str(payload.official_portal_url),
    )
    db.add(event)
    await db.commit()
    await db.refresh(event)
    return {"message": "Countdown created successfully", "countdown": _serialize(event)}
