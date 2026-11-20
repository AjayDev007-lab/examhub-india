from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_
from sqlalchemy.orm import selectinload
from typing import Optional, List
from app.database import get_db
from app.models.models import Examination, Organization, State, OrganizationCategory, ResultAnnouncement
from app.schemas.schemas import ExaminationOut, OrganizationOut, StateOut, OrganizationCategoryOut, NotificationOut

router = APIRouter(prefix="/api", tags=["Examinations & Organizations"])

@router.get("/states", response_model=List[StateOut])
async def list_states(db: AsyncSession = Depends(get_db)):
    stmt = select(State).where(State.is_active == True).order_by(State.name)
    res = await db.execute(stmt)
    return res.scalars().all()

@router.get("/categories", response_model=List[OrganizationCategoryOut])
async def list_categories(db: AsyncSession = Depends(get_db)):
    stmt = select(OrganizationCategory).order_by(OrganizationCategory.id)
    res = await db.execute(stmt)
    return res.scalars().all()

@router.get("/organizations", response_model=List[OrganizationOut])
async def list_organizations(
    category_id: Optional[int] = None,
    state_id: Optional[int] = None,
    query: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Organization).where(Organization.is_active == True)
    if category_id:
        stmt = stmt.where(Organization.category_id == category_id)
    if state_id:
        stmt = stmt.where(Organization.state_id == state_id)
    if query:
        q = f"%{query.strip()}%"
        stmt = stmt.where(or_(Organization.name.ilike(q), Organization.code.ilike(q)))
    stmt = stmt.order_by(Organization.name)
    res = await db.execute(stmt)
    return res.scalars().all()

@router.get("/exams/search", response_model=List[ExaminationOut])
@router.get("/exams", response_model=List[ExaminationOut])
async def search_examinations(
    q: Optional[str] = Query(None, description="Search keyword in exam name, org name or code"),
    org_id: Optional[int] = None,
    state_id: Optional[int] = None,
    category_id: Optional[int] = None,
    exam_type: Optional[str] = None,
    year: Optional[int] = None,
    limit: int = 50,
    offset: int = 0,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Examination).join(Organization).options(
        selectinload(Examination.organization),
        selectinload(Examination.schedules)
    ).where(Examination.is_active == True)

    if q:
        search_kw = f"%{q.strip()}%"
        stmt = stmt.where(
            or_(
                Examination.name.ilike(search_kw),
                Examination.code.ilike(search_kw),
                Organization.name.ilike(search_kw),
                Organization.code.ilike(search_kw)
            )
        )
    if org_id:
        stmt = stmt.where(Examination.organization_id == org_id)
    if exam_type:
        stmt = stmt.where(Examination.exam_type == exam_type)
    if year:
        stmt = stmt.where(Examination.year == year)
    if state_id:
        stmt = stmt.where(Organization.state_id == state_id)
    if category_id:
        stmt = stmt.where(Organization.category_id == category_id)

    stmt = stmt.order_by(Examination.year.desc(), Examination.name.asc()).limit(limit).offset(offset)
    res = await db.execute(stmt)
    exams = res.scalars().all()

    result_list = []
    for ex in exams:
        item = ExaminationOut(
            id=ex.id,
            organization_id=ex.organization_id,
            organization_name=ex.organization.name if ex.organization else None,
            organization_code=ex.organization.code if ex.organization else None,
            name=ex.name,
            code=ex.code,
            exam_type=ex.exam_type,
            description=ex.description,
            year=ex.year,
            cycle=ex.cycle,
            requires_dob=ex.requires_dob,
            requires_captcha=ex.requires_captcha,
            is_active=ex.is_active,
            schedules=ex.schedules
        )
        result_list.append(item)
    return result_list

@router.get("/exams/{exam_id}", response_model=ExaminationOut)
async def get_examination(exam_id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(Examination).options(
        selectinload(Examination.organization),
        selectinload(Examination.schedules)
    ).where(Examination.id == exam_id, Examination.is_active == True)
    res = await db.execute(stmt)
    ex = res.scalar_one_or_none()
    if not ex:
        raise HTTPException(status_code=404, detail="Examination not found")

    return ExaminationOut(
        id=ex.id,
        organization_id=ex.organization_id,
        organization_name=ex.organization.name if ex.organization else None,
        organization_code=ex.organization.code if ex.organization else None,
        name=ex.name,
        code=ex.code,
        exam_type=ex.exam_type,
        description=ex.description,
        year=ex.year,
        cycle=ex.cycle,
        requires_dob=ex.requires_dob,
        requires_captcha=ex.requires_captcha,
        is_active=ex.is_active,
        schedules=ex.schedules
    )

@router.get("/announcements")
async def list_announcements(limit: int = 10, db: AsyncSession = Depends(get_db)):
    stmt = select(ResultAnnouncement).order_by(ResultAnnouncement.circular_date.desc()).limit(limit)
    res = await db.execute(stmt)
    return res.scalars().all()
