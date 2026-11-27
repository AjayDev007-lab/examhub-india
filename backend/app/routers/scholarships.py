from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, HttpUrl
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.security import get_current_admin
from app.database import get_db
from app.models.models import AdminUser, Scholarship

router = APIRouter(
    prefix="/api/admin/scholarships",
    tags=["Admin Scholarships"],
    dependencies=[Depends(get_current_admin)],
)


class ScholarshipCreate(BaseModel):
    title: str
    provider_name: str
    category: str = "CENTRAL"
    eligibility_criteria: str = ""
    award_amount: Optional[str] = None
    application_portal_url: HttpUrl
    notification_pdf_url: Optional[HttpUrl] = None
    opening_date: Optional[datetime] = None
    deadline_date: Optional[datetime] = None
    status: str = "PUBLISHED"


def _serialize(item: Scholarship) -> dict:
    return {
        "id": item.id,
        "title": item.title,
        "provider_name": item.provider_name,
        "category": item.category,
        "eligibility_criteria": item.eligibility_criteria,
        "award_amount": item.award_amount,
        "application_portal_url": item.application_portal_url,
        "notification_pdf_url": item.notification_pdf_url,
        "opening_date": item.opening_date.isoformat() if item.opening_date else None,
        "deadline_date": item.deadline_date.isoformat() if item.deadline_date else None,
        "status": item.status,
        "created_at": item.created_at.isoformat() if item.created_at else None,
        "updated_at": item.updated_at.isoformat() if item.updated_at else None,
    }


@router.get("")
async def list_scholarships(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Scholarship).order_by(Scholarship.deadline_date.asc().nulls_last()))
    items = [_serialize(item) for item in result.scalars().all()]
    return {"total": len(items), "scholarships": items}


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_scholarship(
    payload: ScholarshipCreate,
    db: AsyncSession = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin),
):
    title = payload.title.strip()
    provider = payload.provider_name.strip()
    if not title or not provider:
        raise HTTPException(status_code=400, detail="Title and provider are required")
    item = Scholarship(
        title=title,
        provider_name=provider,
        category=payload.category.upper(),
        eligibility_criteria=payload.eligibility_criteria.strip(),
        award_amount=payload.award_amount,
        application_portal_url=str(payload.application_portal_url),
        notification_pdf_url=str(payload.notification_pdf_url) if payload.notification_pdf_url else None,
        opening_date=payload.opening_date,
        deadline_date=payload.deadline_date,
        status=payload.status.upper(),
    )
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return _serialize(item)
