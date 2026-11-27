from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, HttpUrl
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.security import require_role
from app.database import get_db
from app.models.models import AdminUser, RRBGroupDResult

router = APIRouter(
    prefix="/api/admin/rrb-group-d",
    tags=["Admin RRB Group D Results"],
    dependencies=[Depends(require_role(["SUPER_ADMIN", "EXAM_CONTROLLER"]))],
)


class RRBResultCreate(BaseModel):
    cen_number: str
    title: str
    zone_code: str
    zone_name: str
    vacancies_count: int = 0
    official_portal_url: HttpUrl
    scorecard_url: Optional[HttpUrl] = None
    merit_list_pdf_url: Optional[HttpUrl] = None
    cutoff_marks_pdf_url: Optional[HttpUrl] = None
    pet_instructions_url: Optional[HttpUrl] = None
    document_verification_url: Optional[HttpUrl] = None
    announcement_date: Optional[datetime] = None
    status: str = "DRAFT"
    verification_source: str = "Railway Recruitment Control Board / RRB Official Portal"
    admin_notes: str = ""


class RRBResultUpdate(BaseModel):
    id: int
    status: Optional[str] = None
    admin_notes: Optional[str] = None


def _serialize(item: RRBGroupDResult) -> dict:
    return {
        "id": item.id,
        "cen_number": item.cen_number,
        "title": item.title,
        "zone_code": item.zone_code,
        "zone_name": item.zone_name,
        "vacancies_count": item.vacancies_count,
        "official_portal_url": item.official_portal_url,
        "scorecard_url": item.scorecard_url,
        "merit_list_pdf_url": item.merit_list_pdf_url,
        "cutoff_marks_pdf_url": item.cutoff_marks_pdf_url,
        "pet_instructions_url": item.pet_instructions_url,
        "document_verification_url": item.document_verification_url,
        "announcement_date": item.announcement_date.isoformat() if item.announcement_date else None,
        "status": item.status,
        "verification_source": item.verification_source,
        "admin_notes": item.admin_notes or "",
        "view_count": item.view_count,
        "created_at": item.created_at.isoformat() if item.created_at else None,
    }


@router.get("")
async def list_rrb_results(
    cen: Optional[str] = None,
    zone: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    db: AsyncSession = Depends(get_db),
):
    query = select(RRBGroupDResult)
    if cen and cen.upper() != "ALL":
        query = query.where(RRBGroupDResult.cen_number.ilike(f"%{cen.strip()}%"))
    if zone and zone.upper() != "ALL":
        query = query.where(RRBGroupDResult.zone_code == zone)
    if status_filter and status_filter.upper() != "ALL":
        query = query.where(RRBGroupDResult.status == status_filter.upper())
    result = await db.execute(query.order_by(RRBGroupDResult.created_at.desc()))
    items = [_serialize(item) for item in result.scalars().all()]
    return {"total": len(items), "results": items}


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_rrb_result(
    payload: RRBResultCreate,
    db: AsyncSession = Depends(get_db),
    admin: AdminUser = Depends(require_role(["SUPER_ADMIN", "EXAM_CONTROLLER"])),
):
    status_value = payload.status.upper()
    if status_value not in {"DRAFT", "PENDING_VERIFICATION", "APPROVED", "PUBLISHED", "ARCHIVED"}:
        raise HTTPException(status_code=400, detail="Invalid RRB result status")
    item = RRBGroupDResult(
        cen_number=payload.cen_number.strip(),
        title=payload.title.strip(),
        zone_code=payload.zone_code.strip().upper(),
        zone_name=payload.zone_name.strip(),
        vacancies_count=max(payload.vacancies_count, 0),
        official_portal_url=str(payload.official_portal_url),
        scorecard_url=str(payload.scorecard_url) if payload.scorecard_url else None,
        merit_list_pdf_url=str(payload.merit_list_pdf_url) if payload.merit_list_pdf_url else None,
        cutoff_marks_pdf_url=str(payload.cutoff_marks_pdf_url) if payload.cutoff_marks_pdf_url else None,
        pet_instructions_url=str(payload.pet_instructions_url) if payload.pet_instructions_url else None,
        document_verification_url=str(payload.document_verification_url) if payload.document_verification_url else None,
        announcement_date=payload.announcement_date,
        status=status_value,
        verification_source=payload.verification_source.strip(),
        admin_notes=payload.admin_notes,
    )
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return _serialize(item)


@router.put("")
async def update_rrb_result(
    payload: RRBResultUpdate,
    db: AsyncSession = Depends(get_db),
    admin: AdminUser = Depends(require_role(["SUPER_ADMIN", "EXAM_CONTROLLER"])),
):
    item = await db.get(RRBGroupDResult, payload.id)
    if not item:
        raise HTTPException(status_code=404, detail="RRB result record not found")
    if payload.status:
        status_value = payload.status.upper()
        if status_value not in {"DRAFT", "PENDING_VERIFICATION", "APPROVED", "PUBLISHED", "ARCHIVED"}:
            raise HTTPException(status_code=400, detail="Invalid RRB result status")
        item.status = status_value
        if status_value == "APPROVED":
            item.verified_by_admin_id = admin.id
        if status_value == "PUBLISHED":
            item.published_by_admin_id = admin.id
    if payload.admin_notes is not None:
        item.admin_notes = payload.admin_notes
    await db.commit()
    await db.refresh(item)
    return _serialize(item)
