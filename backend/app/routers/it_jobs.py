import re
from datetime import datetime, timedelta, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field, HttpUrl
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.security import get_current_admin
from app.database import get_db
from app.models.models import AdminUser, ITJobPosting

router = APIRouter(prefix="/api/it-jobs", tags=["IT & Private Jobs"])


class ITJobCreate(BaseModel):
    title: str
    slug: Optional[str] = None
    company_name: str
    company_logo_url: Optional[str] = None
    company_website: Optional[HttpUrl] = None
    category: str = "SOFTWARE_DEV"
    category_display: Optional[str] = None
    job_type: str = "FULL_TIME"
    experience_level: str = "FRESHER"
    work_mode: str = "HYBRID"
    location: str = "All India"
    salary_range: str = "Not specified"
    qualification: str = "Any Graduate"
    required_skills: List[str] = Field(default_factory=list)
    skills_required: Optional[List[str]] = None
    job_description: str = "Job description is available at the official application portal."
    responsibilities: List[str] = Field(default_factory=list)
    official_apply_url: Optional[HttpUrl] = None
    apply_url: Optional[HttpUrl] = None
    application_deadline: Optional[datetime] = None
    is_featured: bool = False


def _serialize(job: ITJobPosting) -> dict:
    return {
        "id": job.id,
        "title": job.title,
        "slug": job.slug,
        "company_name": job.company_name,
        "company_logo_url": job.company_logo_url,
        "company_website": job.company_website,
        "category": job.category,
        "category_display": job.category_display,
        "job_type": job.job_type,
        "experience_level": job.experience_level,
        "work_mode": job.work_mode,
        "location": job.location,
        "salary_range": job.salary_range,
        "qualification": job.qualification,
        "required_skills": job.required_skills or [],
        "job_description": job.job_description,
        "responsibilities": job.responsibilities or [],
        "official_apply_url": job.official_apply_url,
        "application_deadline": job.application_deadline.isoformat() if job.application_deadline else None,
        "is_featured": job.is_featured,
        "view_count": job.view_count,
        "apply_clicks_count": job.apply_clicks_count,
        "status": job.status,
        "published_at": job.published_at.isoformat() if job.published_at else None,
    }


@router.get("")
async def list_it_jobs(
    search: Optional[str] = None,
    category: Optional[str] = None,
    experience: Optional[str] = None,
    work_mode: Optional[str] = None,
    location: Optional[str] = None,
    limit: int = Query(100, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
):
    query = select(ITJobPosting).where(ITJobPosting.status == "PUBLISHED")
    if category and category.upper() != "ALL":
        query = query.where(ITJobPosting.category == category.upper())
    if experience and experience.upper() != "ALL":
        query = query.where(ITJobPosting.experience_level == experience.upper())
    if work_mode and work_mode.upper() != "ALL":
        query = query.where(ITJobPosting.work_mode == work_mode.upper())
    if location and location.upper() != "ALL":
        query = query.where(ITJobPosting.location.ilike(f"%{location.strip()}%"))
    result = await db.execute(query.order_by(ITJobPosting.is_featured.desc(), ITJobPosting.published_at.desc()).limit(limit))
    jobs = [_serialize(job) for job in result.scalars().all()]
    if search and search.strip():
        term = search.strip().casefold()
        jobs = [job for job in jobs if any(
            term in str(job.get(field) or "").casefold()
            for field in ("title", "company_name", "location", "qualification")
        ) or any(term in str(skill).casefold() for skill in job["required_skills"])]
    return {"success": True, "total": len(jobs), "jobs": jobs}


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_it_job(
    payload: ITJobCreate,
    db: AsyncSession = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin),
):
    title = payload.title.strip()
    company = payload.company_name.strip()
    slug = payload.slug or re.sub(r"[^a-z0-9]+", "-", title.casefold()).strip("-")
    slug = slug.strip().lower()
    apply_url = payload.official_apply_url or payload.apply_url
    company_website = payload.company_website or apply_url
    if not title or not company or not slug:
        raise HTTPException(status_code=400, detail="Title, company, and slug are required")
    if not apply_url:
        raise HTTPException(status_code=400, detail="An official application URL is required")
    existing = await db.execute(select(ITJobPosting.id).where(ITJobPosting.slug == slug))
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(status_code=409, detail="An IT job with this slug already exists")
    job = ITJobPosting(
        title=title,
        slug=slug,
        company_name=company,
        company_logo_url=payload.company_logo_url or "",
        company_website=str(company_website or apply_url),
        category=payload.category.upper(),
        category_display=payload.category_display or payload.category.replace("_", " ").title(),
        job_type=payload.job_type.upper(),
        experience_level=payload.experience_level.upper(),
        work_mode=payload.work_mode.upper(),
        location=payload.location,
        salary_range=payload.salary_range,
        qualification=payload.qualification,
        required_skills=payload.required_skills or payload.skills_required or [],
        job_description=payload.job_description,
        responsibilities=payload.responsibilities,
        official_apply_url=str(apply_url),
        application_deadline=payload.application_deadline or (datetime.now(timezone.utc) + timedelta(days=30)),
        is_featured=payload.is_featured,
        status="PUBLISHED",
    )
    db.add(job)
    await db.commit()
    await db.refresh(job)
    return {"success": True, "job": _serialize(job)}
