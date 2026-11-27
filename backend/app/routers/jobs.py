import os
from typing import Optional, List
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_, desc, func
from pydantic import BaseModel, HttpUrl

from app.database import get_db
from app.models.models import (
    JobNotification, JobSource, SavedJob, JobApplication, JobReport, User, AdminUser
)
from app.auth.security import get_current_user, get_optional_user, require_role

router = APIRouter(prefix="/api/jobs", tags=["Jobs & Career Notifications"])

def utc_now():
    return datetime.now(timezone.utc)


# Pydantic Schemas
class JobCreate(BaseModel):
    title: str
    slug: str
    organization_name: str
    organization_logo_url: Optional[str] = None
    sector: str = "CENTRAL_GOVT" # "CENTRAL_GOVT", "STATE_GOVT", "PRIVATE", "PSU"
    category: str = "GOVERNMENT" # "GOVERNMENT", "STATE_GOVERNMENT", "PRIVATE", "IT", "INTERNSHIP", "APPRENTICESHIP", "WALK_IN", "REMOTE", "RAILWAY", "BANKING", "DEFENCE", "TEACHING"
    job_description: Optional[str] = "Official Recruitment Notification"
    vacancies_count: Optional[int] = 0
    total_vacancies: Optional[int] = None
    qualification: str
    qualification_description: Optional[str] = None
    required_skills: Optional[str] = None
    age_limit: Optional[str] = "18 - 30 Years"
    experience_required: Optional[str] = "FRESHER"
    salary_range: Optional[str] = None
    pay_scale: Optional[str] = None
    location: Optional[str] = "All India"
    work_mode: Optional[str] = "ON_SITE"
    application_start_date: Optional[datetime] = None
    application_end_date: Optional[datetime] = None
    last_date_to_apply: Optional[datetime] = None
    application_fee: Optional[str] = None
    selection_process: Optional[str] = None
    selection_stages: Optional[List[str]] = None
    syllabus_details: Optional[str] = None
    official_notification_pdf: Optional[str] = None
    official_notification_pdf_url: Optional[str] = None
    official_application_url: Optional[str] = None
    official_apply_url: Optional[str] = None
    source_website_url: Optional[str] = None
    source_name: Optional[str] = None
    verification_source: Optional[str] = "Official Recruitment Board Portal"
    status: Optional[str] = "PUBLISHED"
    is_featured: Optional[bool] = False


class JobStatusUpdate(BaseModel):
    status: Optional[str] = None # "DRAFT", "PENDING_VERIFICATION", "VERIFIED", "PUBLISHED", "UPDATED", "EXPIRED", "CANCELLED", "REJECTED"


class JobReportCreate(BaseModel):
    issue_type: Optional[str] = None
    report_type: Optional[str] = None
    details: Optional[str] = None
    description: Optional[str] = None
    reporter_email: Optional[str] = None


class JobApplicationCreate(BaseModel):
    application_number: Optional[str] = None
    application_status: Optional[str] = "APPLIED"
    notes: Optional[str] = None


@router.get("")
async def list_jobs(
    search: Optional[str] = Query(None, description="Search keyword in title, organization, qualification, or skills"),
    category: Optional[str] = Query(None, description="Filter by recruitment category"),
    sector: Optional[str] = Query(None, description="Filter by sector (CENTRAL_GOVT, STATE_GOVT, PRIVATE, PSU)"),
    qualification: Optional[str] = Query(None, description="Filter by qualification"),
    experience: Optional[str] = Query(None, description="Filter by experience (FRESHER, 0-1, 1-3, 3-5, 5+)"),
    location: Optional[str] = Query(None, description="Filter by location/state"),
    work_mode: Optional[str] = Query(None, description="Filter by work mode (ON_SITE, REMOTE, HYBRID)"),
    status: Optional[str] = Query("PUBLISHED", description="Filter by status"),
    closing_soon_days: Optional[int] = Query(None, description="Filter jobs closing within N days"),
    is_featured: Optional[bool] = Query(None, description="Filter featured jobs"),
    sort_by: Optional[str] = Query("latest", description="Sort by: latest, deadline, popular, vacancies"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    query = select(JobNotification)

    # Status filter
    if status and status != "ALL":
        query = query.where(JobNotification.status == status)

    # Category filter
    if category and category != "ALL":
        query = query.where(JobNotification.category == category.upper())

    # Sector filter
    if sector and sector != "ALL":
        query = query.where(JobNotification.sector == sector.upper())

    # Qualification filter
    if qualification and qualification != "ALL":
        query = query.where(JobNotification.qualification.ilike(f"%{qualification}%"))

    # Experience filter
    if experience and experience != "ALL":
        query = query.where(JobNotification.experience_required == experience.upper())

    # Location filter
    if location and location != "ALL":
        query = query.where(JobNotification.location.ilike(f"%{location}%"))

    # Work mode filter
    if work_mode and work_mode != "ALL":
        query = query.where(JobNotification.work_mode == work_mode.upper())

    # Closing soon filter
    if closing_soon_days:
        now = utc_now()
        target_deadline = now + timedelta(days=closing_soon_days)
        query = query.where(
            and_(
                JobNotification.application_end_date >= now,
                JobNotification.application_end_date <= target_deadline
            )
        )

    # Featured filter
    if is_featured is not None:
        query = query.where(JobNotification.is_featured == is_featured)

    # Keyword search
    if search and search.strip():
        term = f"%{search.strip().lower()}%"
        query = query.where(
            or_(
                func.lower(JobNotification.title).like(term),
                func.lower(JobNotification.organization_name).like(term),
                func.lower(JobNotification.qualification).like(term),
                func.lower(JobNotification.required_skills).like(term)
            )
        )

    # Sorting
    if sort_by == "deadline":
        query = query.order_by(JobNotification.application_end_date.asc().nulls_last())
    elif sort_by == "popular":
        query = query.order_by(desc(JobNotification.view_count))
    elif sort_by == "vacancies":
        query = query.order_by(desc(JobNotification.vacancies_count))
    else:
        query = query.order_by(desc(JobNotification.is_featured), desc(JobNotification.published_at))

    # Total count query
    count_query = select(func.count()).select_from(query.subquery())
    total_res = await db.execute(count_query)
    total_count = total_res.scalar() or 0

    # Paginate
    query = query.offset(offset).limit(limit)
    result = await db.execute(query)
    jobs = result.scalars().all()

    # User saved IDs
    saved_job_ids = set()
    if current_user:
        s_res = await db.execute(
            select(SavedJob.job_id).where(SavedJob.user_id == current_user.id)
        )
        saved_job_ids = set(s_res.scalars().all())

    out = []
    now = utc_now()
    for j in jobs:
        is_closing_soon = False
        is_expired = False
        if j.application_end_date:
            days_left = (j.application_end_date.replace(tzinfo=timezone.utc) - now).days
            if days_left < 0:
                is_expired = True
            elif days_left <= 3:
                is_closing_soon = True

        out.append({
            "id": j.id,
            "title": j.title,
            "slug": j.slug,
            "organization_name": j.organization_name,
            "organization_logo_url": j.organization_logo_url,
            "sector": j.sector,
            "category": j.category,
            "job_description": j.job_description,
            "vacancies_count": j.vacancies_count,
            "total_vacancies": j.vacancies_count,
            "qualification": j.qualification,
            "required_skills": j.required_skills,
            "age_limit": j.age_limit,
            "experience_required": j.experience_required,
            "salary_range": j.salary_range,
            "pay_scale": j.salary_range,
            "location": j.location,
            "work_mode": j.work_mode,
            "application_start_date": j.application_start_date.isoformat() if j.application_start_date else None,
            "application_end_date": j.application_end_date.isoformat() if j.application_end_date else None,
            "last_date_to_apply": j.application_end_date.isoformat() if j.application_end_date else None,
            "application_fee": j.application_fee,
            "selection_process": j.selection_process,
            "selection_stages": [s.strip() for s in (j.selection_process or "").split(",") if s.strip()],
            "official_notification_pdf": j.official_notification_pdf,
            "official_notification_pdf_url": j.official_notification_pdf,
            "official_application_url": j.official_application_url,
            "official_apply_url": j.official_application_url,
            "source_website_url": j.source_website_url,
            "source_name": j.verification_source,
            "verification_source": j.verification_source,
            "status": j.status,
            "view_count": j.view_count,
            "apply_clicks_count": j.apply_clicks_count,
            "is_featured": j.is_featured,
            "is_closing_soon": is_closing_soon,
            "is_expired": is_expired,
            "is_saved": j.id in saved_job_ids,
            "published_at": j.published_at.isoformat() if j.published_at else None,
            "last_verified_at": j.last_verified_at.isoformat() if j.last_verified_at else None
        })

    return {"total": total_count, "jobs": out}


@router.get("/sources/directory")
async def list_recruitment_sources(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(JobSource).order_by(JobSource.name.asc()))
    sources = res.scalars().all()
    return {"total": len(sources), "sources": sources}


@router.get("/student/saved")
async def get_student_saved_jobs(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    target_user_id = current_user.id

    query = (
        select(JobNotification)
        .join(SavedJob, SavedJob.job_id == JobNotification.id)
        .where(SavedJob.user_id == target_user_id)
        .order_by(desc(SavedJob.created_at))
    )
    result = await db.execute(query)
    jobs = result.scalars().all()

    formatted_jobs = [
        {
            "id": j.id,
            "title": j.title,
            "slug": j.slug,
            "organization_name": j.organization_name,
            "sector": j.sector,
            "category": j.category,
            "qualification": j.qualification,
            "salary_range": j.salary_range,
            "pay_scale": j.salary_range,
            "location": j.location,
            "application_end_date": j.application_end_date.isoformat() if j.application_end_date else None,
            "last_date_to_apply": j.application_end_date.isoformat() if j.application_end_date else None,
            "official_application_url": j.official_application_url,
            "official_apply_url": j.official_application_url,
            "is_saved": True
        }
        for j in jobs
    ]

    return {
        "total": len(jobs),
        "jobs": formatted_jobs,
        "saved_jobs": formatted_jobs
    }


@router.get("/student/applied")
async def get_student_applied_jobs(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    target_user_id = current_user.id

    query = (
        select(JobApplication, JobNotification)
        .join(JobNotification, JobApplication.job_id == JobNotification.id)
        .where(JobApplication.user_id == target_user_id)
        .order_by(desc(JobApplication.applied_at))
    )
    result = await db.execute(query)
    rows = result.all()

    return {
        "total": len(rows),
        "applications": [
            {
                "application_id": app.id,
                "job_id": job.id,
                "title": job.title,
                "slug": job.slug,
                "organization_name": job.organization_name,
                "application_status": app.status,
                "application_number": app.application_number,
                "notes": app.notes,
                "applied_at": app.applied_at.isoformat() if app.applied_at else None,
                "official_application_url": job.official_application_url
            }
            for app, job in rows
        ]
    }


@router.get("/{identifier}")
async def get_job_detail(
    identifier: str,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    job = None
    if identifier.isdigit():
        job = await db.get(JobNotification, int(identifier))
    if not job:
        res = await db.execute(select(JobNotification).where(JobNotification.slug == identifier.lower()))
        job = res.scalars().first()

    if not job:
        raise HTTPException(status_code=404, detail="Job notification not found")

    # Increment view count
    job.view_count += 1
    await db.commit()

    is_saved = False
    if current_user:
        s_res = await db.execute(
            select(SavedJob).where(SavedJob.user_id == current_user.id, SavedJob.job_id == job.id)
        )
        is_saved = s_res.scalars().first() is not None

    now = utc_now()
    is_closing_soon = False
    is_expired = False
    if job.application_end_date:
        days_left = (job.application_end_date.replace(tzinfo=timezone.utc) - now).days
        if days_left < 0:
            is_expired = True
        elif days_left <= 3:
            is_closing_soon = True

    return {
        "id": job.id,
        "title": job.title,
        "slug": job.slug,
        "organization_name": job.organization_name,
        "organization_logo_url": job.organization_logo_url,
        "sector": job.sector,
        "category": job.category,
        "job_description": job.job_description,
        "vacancies_count": job.vacancies_count,
        "total_vacancies": job.vacancies_count,
        "qualification": job.qualification,
        "required_skills": job.required_skills,
        "age_limit": job.age_limit,
        "experience_required": job.experience_required,
        "salary_range": job.salary_range,
        "pay_scale": job.salary_range,
        "location": job.location,
        "work_mode": job.work_mode,
        "application_start_date": job.application_start_date.isoformat() if job.application_start_date else None,
        "application_end_date": job.application_end_date.isoformat() if job.application_end_date else None,
        "last_date_to_apply": job.application_end_date.isoformat() if job.application_end_date else None,
        "application_fee": job.application_fee,
        "selection_process": job.selection_process,
        "selection_stages": [s.strip() for s in (job.selection_process or "").split(",") if s.strip()],
        "syllabus_details": job.syllabus_details,
        "official_notification_pdf": job.official_notification_pdf,
        "official_notification_pdf_url": job.official_notification_pdf,
        "official_application_url": job.official_application_url,
        "official_apply_url": job.official_application_url,
        "source_website_url": job.source_website_url,
        "source_name": job.verification_source,
        "verification_source": job.verification_source,
        "status": job.status,
        "view_count": job.view_count,
        "apply_clicks_count": job.apply_clicks_count,
        "is_featured": job.is_featured,
        "is_closing_soon": is_closing_soon,
        "is_expired": is_expired,
        "is_saved": is_saved,
        "published_at": job.published_at.isoformat() if job.published_at else None,
        "last_verified_at": job.last_verified_at.isoformat() if job.last_verified_at else None
    }


@router.post("/{job_id}/save")
async def toggle_save_job(
    job_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    target_user_id = current_user.id
    job = await db.get(JobNotification, int(job_id)) if job_id.isdigit() else None
    if not job:
        result = await db.execute(select(JobNotification).where(JobNotification.slug == job_id.lower()))
        job = result.scalars().first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    job_id = job.id

    res = await db.execute(
        select(SavedJob).where(SavedJob.user_id == target_user_id, SavedJob.job_id == job_id)
    )
    existing = res.scalars().first()

    if existing:
        await db.delete(existing)
        await db.commit()
        return {"saved": False, "message": "Job removed from saved bookmarks"}
    else:
        db.add(SavedJob(user_id=target_user_id, job_id=job_id))
        await db.commit()
        return {"saved": True, "message": "Job saved to your career bookmarks"}


@router.post("/{job_id}/apply")
async def track_job_apply(
    job_id: str,
    payload: Optional[JobApplicationCreate] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    job = await db.get(JobNotification, int(job_id)) if job_id.isdigit() else None
    if not job:
        result = await db.execute(select(JobNotification).where(JobNotification.slug == job_id.lower()))
        job = result.scalars().first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    job_id = job.id
    job.apply_clicks_count += 1
    target_user_id = current_user.id

    if target_user_id:
        # Check if already tracked
        res = await db.execute(
            select(JobApplication).where(JobApplication.user_id == target_user_id, JobApplication.job_id == job_id)
        )
        app = res.scalars().first()
        if not app:
            app = JobApplication(
                user_id=target_user_id,
                job_id=job_id,
                status=payload.application_status if (payload and payload.application_status) else "APPLIED",
                application_number=payload.application_number if payload else None,
                notes=payload.notes if payload else "Applied via official redirect link."
            )
            db.add(app)

    await db.commit()
    return {
        "success": True,
        "tracked": True,
        "official_url": job.official_application_url,
        "redirect_url": job.official_application_url
    }


@router.post("/{job_id}/report")
async def report_job_issue(
    job_id: int,
    payload: JobReportCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    job = await db.get(JobNotification, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    issue_type = payload.issue_type or payload.report_type or "GENERAL"
    details = payload.details or payload.description or ""

    report = JobReport(
        job_id=job_id,
        user_id=current_user.id if current_user else None,
        reporter_email=payload.reporter_email or (current_user.email if current_user else None),
        issue_type=issue_type,
        details=details
    )
    db.add(report)
    await db.commit()

    return {"success": True, "message": "Thank you. Your report has been submitted to the verification team."}


# Admin Endpoints
@router.post("", status_code=status.HTTP_200_OK)
async def admin_create_job(
    payload: JobCreate,
    db: AsyncSession = Depends(get_db),
    admin: AdminUser = Depends(require_role(["SUPER_ADMIN", "EXAM_CONTROLLER", "JOB_MANAGER"]))
):
    existing = await db.execute(select(JobNotification).where(JobNotification.slug == payload.slug.lower()))
    if existing.scalars().first():
        raise HTTPException(status_code=400, detail="A job with this slug already exists.")

    vacancies = payload.total_vacancies if payload.total_vacancies is not None else (payload.vacancies_count or 0)
    end_date = payload.last_date_to_apply or payload.application_end_date
    apply_url = payload.official_apply_url or payload.official_application_url or "https://india.gov.in"
    pdf_url = payload.official_notification_pdf_url or payload.official_notification_pdf
    salary = payload.pay_scale or payload.salary_range
    source_name = payload.source_name or payload.verification_source or "Official Recruitment Portal"
    selection = ", ".join(payload.selection_stages) if payload.selection_stages else payload.selection_process

    new_job = JobNotification(
        title=payload.title,
        slug=payload.slug.lower(),
        organization_name=payload.organization_name,
        organization_logo_url=payload.organization_logo_url,
        sector=payload.sector,
        category=payload.category,
        job_description=payload.job_description or "Official notification",
        vacancies_count=vacancies,
        qualification=payload.qualification,
        required_skills=payload.required_skills,
        age_limit=payload.age_limit,
        experience_required=payload.experience_required or "FRESHER",
        salary_range=salary,
        location=payload.location or "All India",
        work_mode=payload.work_mode or "ON_SITE",
        application_start_date=payload.application_start_date or utc_now(),
        application_end_date=end_date,
        application_fee=payload.application_fee,
        selection_process=selection,
        syllabus_details=payload.syllabus_details,
        official_notification_pdf=pdf_url,
        official_application_url=apply_url,
        source_website_url=payload.source_website_url or apply_url,
        verification_source=source_name,
        status=payload.status or "PUBLISHED",
        is_featured=payload.is_featured or False
    )
    db.add(new_job)
    await db.commit()
    await db.refresh(new_job)
    return {
        "id": new_job.id,
        "slug": new_job.slug,
        "title": new_job.title,
        "organization_name": new_job.organization_name,
        "total_vacancies": new_job.vacancies_count,
        "status": new_job.status,
        "job": {
            "id": new_job.id,
            "slug": new_job.slug,
            "title": new_job.title,
            "total_vacancies": new_job.vacancies_count,
            "status": new_job.status
        }
    }


@router.put("/{identifier}")
async def admin_update_job(
    identifier: str,
    payload: JobStatusUpdate,
    db: AsyncSession = Depends(get_db),
    admin: AdminUser = Depends(require_role(["SUPER_ADMIN", "EXAM_CONTROLLER", "JOB_MANAGER"]))
):
    job = None
    if identifier.isdigit():
        job = await db.get(JobNotification, int(identifier))
    if not job:
        res = await db.execute(select(JobNotification).where(JobNotification.slug == identifier.lower()))
        job = res.scalars().first()

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if payload.status:
        job.status = payload.status
    job.updated_at = utc_now()
    await db.commit()
    await db.refresh(job)
    return {
        "success": True,
        "job": {
            "id": job.id,
            "slug": job.slug,
            "status": job.status
        },
        "id": job.id,
        "slug": job.slug,
        "status": job.status
    }


@router.put("/{job_id}/status")
async def admin_update_job_status(
    job_id: int,
    payload: JobStatusUpdate,
    db: AsyncSession = Depends(get_db),
    admin: AdminUser = Depends(require_role(["SUPER_ADMIN", "EXAM_CONTROLLER", "JOB_MANAGER"]))
):
    job = await db.get(JobNotification, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if payload.status:
        job.status = payload.status
    job.updated_at = utc_now()
    await db.commit()
    return {"success": True, "job_id": job.id, "status": job.status}
