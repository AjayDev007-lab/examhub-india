from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.security import get_current_user
from app.database import get_db
from app.models.models import Examination, StudentApplicationTracker, User

router = APIRouter(prefix="/api/student/applications", tags=["Student Application Tracker"])


class ApplicationCreate(BaseModel):
    exam_id: Optional[int] = None
    exam_slug: Optional[str] = None
    exam_name: Optional[str] = None
    authority_code: Optional[str] = None
    conducting_authority: Optional[str] = None
    notes: Optional[str] = None
    private_notes: Optional[str] = None
    status: Optional[str] = None
    application_number: Optional[str] = None
    roll_number: Optional[str] = None


class ApplicationUpdate(BaseModel):
    status: Optional[str] = None
    application_number: Optional[str] = None
    roll_number: Optional[str] = None
    private_notes: Optional[str] = None
    reminders_active: Optional[bool] = None


def _serialize(application: StudentApplicationTracker) -> dict:
    return {
        "id": application.id,
        "user_id": application.user_id,
        "exam_id": application.exam_id,
        "exam_slug": application.exam_slug,
        "exam_name": application.exam_name,
        "authority_code": application.authority_code,
        "conducting_authority": application.conducting_authority,
        "application_number": application.application_number,
        "roll_number": application.roll_number,
        "status": application.status,
        "submission_date": application.submission_date,
        "private_notes": application.private_notes,
        "reminders_active": application.reminders_active,
        "created_at": application.created_at.isoformat() if application.created_at else None,
        "updated_at": application.updated_at.isoformat() if application.updated_at else None,
    }


@router.get("")
async def list_applications(
    status_filter: Optional[str] = Query(None, alias="status"),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    query = select(StudentApplicationTracker).where(StudentApplicationTracker.user_id == user.id)
    if status_filter and status_filter != "ALL":
        query = query.where(StudentApplicationTracker.status == status_filter)
    result = await db.execute(query.order_by(StudentApplicationTracker.updated_at.desc()))
    applications = [_serialize(row) for row in result.scalars().all()]
    return {"total": len(applications), "applications": applications}


@router.post("", status_code=status.HTTP_200_OK)
async def create_or_update_application(
    payload: ApplicationCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if not (payload.exam_id or payload.exam_slug or payload.exam_name):
        raise HTTPException(status_code=400, detail="Missing required examination details")

    supplied_slug = payload.exam_slug.strip().lower() if payload.exam_slug else None
    slug = supplied_slug or (
        f"exam-{payload.exam_id}" if payload.exam_id is not None else
        "-".join((payload.exam_name or "custom-exam").strip().lower().split())
    )
    clauses = []
    if payload.exam_id is not None:
        clauses.append(StudentApplicationTracker.exam_id == payload.exam_id)
    if supplied_slug:
        clauses.append(StudentApplicationTracker.exam_slug == supplied_slug)
    application = None
    if clauses:
        result = await db.execute(select(StudentApplicationTracker).where(
            StudentApplicationTracker.user_id == user.id, or_(*clauses)
        ))
        application = result.scalars().first()
    if application:
        if payload.status is not None:
            application.status = payload.status
            if payload.status == "SUBMITTED" and not application.submission_date:
                application.submission_date = datetime.now(timezone.utc).isoformat()
        if payload.notes is not None:
            application.private_notes = payload.notes
        if payload.private_notes is not None:
            application.private_notes = payload.private_notes
        if payload.application_number is not None:
            application.application_number = payload.application_number
        if payload.roll_number is not None:
            application.roll_number = payload.roll_number
        application.updated_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(application)
        return {"message": "Application tracker updated", "application": _serialize(application)}

    application = StudentApplicationTracker(
        user_id=user.id,
        exam_id=payload.exam_id,
        exam_slug=slug,
        exam_name=(payload.exam_name or "General Examination").strip(),
        authority_code=payload.authority_code or "EXAM",
        conducting_authority=payload.conducting_authority or "Examination Board",
        application_number=payload.application_number or "",
        roll_number=payload.roll_number or "",
        status=payload.status or "APPLICATION_STARTED",
        submission_date=datetime.now(timezone.utc).isoformat() if payload.status == "SUBMITTED" else None,
        private_notes=payload.private_notes or payload.notes or "",
    )
    db.add(application)
    await db.commit()
    await db.refresh(application)
    return {"message": "Application added to personal tracker successfully", "application": _serialize(application)}


@router.get("/{application_id}")
async def get_application(
    application_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    application = await db.get(StudentApplicationTracker, application_id)
    if not application or application.user_id != user.id:
        raise HTTPException(status_code=404, detail="Application record not found")
    exam = await db.get(Examination, application.exam_id) if application.exam_id else None
    return {
        "application": _serialize(application),
        "examination_details": ({"id": exam.id, "name": exam.name, "code": exam.code} if exam else None),
    }


@router.put("/{application_id}")
async def update_application(
    application_id: int,
    payload: ApplicationUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    application = await db.get(StudentApplicationTracker, application_id)
    if not application or application.user_id != user.id:
        raise HTTPException(status_code=404, detail="Application record not found")
    changes = payload.model_dump(exclude_unset=True)
    for field, value in changes.items():
        setattr(application, field, value)
    if changes.get("status") == "SUBMITTED" and not application.submission_date:
        application.submission_date = datetime.now(timezone.utc).isoformat()
    application.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(application)
    return {"message": "Application updated successfully", "application": _serialize(application)}


@router.delete("/{application_id}")
async def delete_application(
    application_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    application = await db.get(StudentApplicationTracker, application_id)
    if not application or application.user_id != user.id:
        raise HTTPException(status_code=404, detail="Application record not found")
    await db.delete(application)
    await db.commit()
    return {"message": "Application removed from tracker"}
