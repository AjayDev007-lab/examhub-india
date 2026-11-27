from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field, HttpUrl
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.security import get_current_admin
from app.database import get_db
from app.models.models import AdminUser, UniversityCatalogEntry, UniversityQuestionPaper

universities_router = APIRouter(prefix="/api/universities", tags=["University Directory"])
papers_router = APIRouter(prefix="/api/university-papers", tags=["University Question Papers"])


class UniversityCreate(BaseModel):
    name: str
    short_code: Optional[str] = None
    state: str = "Tamil Nadu"
    city: str = "Chennai"
    type: str = "STATE_GOVT"
    official_website: HttpUrl
    portal_url: HttpUrl
    logo_url: Optional[HttpUrl] = None
    degrees_offered: List[str] = Field(default_factory=list)
    departments_count: int = 0


class PaperCreate(BaseModel):
    university_id: int = 1
    university_name: str = "Anna University"
    university_code: str = "ANNA_UNIV"
    degree: str = "B.E."
    department: str = "General"
    semester: int = 1
    subject_name: str
    subject_code: str
    exam_year: int
    exam_session: str = "NOV_DEC"
    exam_type: str = "REGULAR"
    regulation: Optional[str] = None
    pdf_url: HttpUrl
    file_size_mb: float = 0
    description: str = ""


def _university_out(item: UniversityCatalogEntry) -> dict:
    return {
        "id": item.id, "name": item.name, "short_code": item.short_code,
        "state": item.state, "city": item.city, "type": item.type,
        "official_website": item.official_website, "portal_url": item.portal_url,
        "logo_url": item.logo_url, "degrees_offered": item.degrees_offered or [],
        "departments_count": item.departments_count, "papers_count": item.papers_count,
    }


def _paper_out(item: UniversityQuestionPaper) -> dict:
    return {
        "id": item.id, "university_id": item.university_id,
        "university_name": item.university_name, "university_code": item.university_code,
        "degree": item.degree, "department": item.department, "semester": item.semester,
        "subject_name": item.subject_name, "subject_code": item.subject_code,
        "exam_year": item.exam_year, "exam_session": item.exam_session,
        "exam_type": item.exam_type, "regulation": item.regulation,
        "pdf_url": item.pdf_url, "file_size_mb": item.file_size_mb,
        "download_count": item.download_count, "description": item.description,
        "uploaded_at": item.uploaded_at.isoformat() if item.uploaded_at else None,
    }


@universities_router.get("")
async def list_universities(
    search: Optional[str] = None,
    state: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    query = select(UniversityCatalogEntry)
    if state and state.upper() != "ALL":
        query = query.where(UniversityCatalogEntry.state.ilike(state.strip()))
    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.where(or_(UniversityCatalogEntry.name.ilike(term), UniversityCatalogEntry.city.ilike(term), UniversityCatalogEntry.short_code.ilike(term)))
    result = await db.execute(query.order_by(UniversityCatalogEntry.name.asc()))
    items = [_university_out(item) for item in result.scalars().all()]
    return {"success": True, "total": len(items), "universities": items}


@universities_router.post("", status_code=status.HTTP_201_CREATED)
async def create_university(
    payload: UniversityCreate,
    db: AsyncSession = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin),
):
    name = payload.name.strip()
    code = (payload.short_code or "".join(part[0] for part in name.split())).upper()[:40]
    if not name or not code:
        raise HTTPException(status_code=400, detail="University name is required")
    existing = await db.execute(select(UniversityCatalogEntry.id).where(UniversityCatalogEntry.short_code == code))
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(status_code=409, detail="A university with this short code already exists")
    max_id = await db.scalar(select(func.max(UniversityCatalogEntry.id)))
    item = UniversityCatalogEntry(
        id=max((max_id or 0), 999_999) + 1,
        name=name, short_code=code, state=payload.state, city=payload.city,
        type=payload.type, official_website=str(payload.official_website),
        portal_url=str(payload.portal_url), logo_url=str(payload.logo_url) if payload.logo_url else "",
        degrees_offered=payload.degrees_offered, departments_count=max(payload.departments_count, 0),
    )
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return _university_out(item)


@papers_router.get("")
async def list_question_papers(
    university_id: Optional[int] = None,
    degree: Optional[str] = None,
    semester: Optional[int] = None,
    year: Optional[int] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    query = select(UniversityQuestionPaper)
    if university_id is not None:
        query = query.where(UniversityQuestionPaper.university_id == university_id)
    if degree and degree.upper() != "ALL":
        query = query.where(UniversityQuestionPaper.degree.ilike(degree.strip()))
    if semester is not None:
        query = query.where(UniversityQuestionPaper.semester == semester)
    if year is not None:
        query = query.where(UniversityQuestionPaper.exam_year == year)
    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.where(or_(UniversityQuestionPaper.subject_name.ilike(term), UniversityQuestionPaper.subject_code.ilike(term), UniversityQuestionPaper.department.ilike(term)))
    result = await db.execute(query.order_by(UniversityQuestionPaper.exam_year.desc(), UniversityQuestionPaper.uploaded_at.desc()))
    items = [_paper_out(item) for item in result.scalars().all()]
    return {"success": True, "total": len(items), "papers": items}


@papers_router.post("", status_code=status.HTTP_201_CREATED)
async def create_question_paper(
    payload: PaperCreate,
    db: AsyncSession = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin),
):
    if not payload.subject_name.strip() or not payload.subject_code.strip():
        raise HTTPException(status_code=400, detail="Subject name and code are required")
    max_id = await db.scalar(select(func.max(UniversityQuestionPaper.id)))
    item = UniversityQuestionPaper(
        id=max((max_id or 0), 999_999) + 1,
        university_id=payload.university_id,
        university_name=payload.university_name,
        university_code=payload.university_code.upper(),
        degree=payload.degree,
        department=payload.department,
        semester=max(payload.semester, 1),
        subject_name=payload.subject_name.strip(),
        subject_code=payload.subject_code.strip().upper(),
        exam_year=payload.exam_year,
        exam_session=payload.exam_session.upper(),
        exam_type=payload.exam_type.upper(),
        regulation=payload.regulation,
        pdf_url=str(payload.pdf_url),
        file_size_mb=max(payload.file_size_mb, 0),
        description=payload.description,
        uploaded_at=datetime.now(timezone.utc),
    )
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return {"success": True, "paper": _paper_out(item)}
