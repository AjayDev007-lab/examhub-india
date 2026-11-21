from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_, desc
from typing import Optional, List
from datetime import datetime, timezone
from pydantic import BaseModel

from app.database import get_db
from app.models.models import (
    StudentJobPreference, JobAlertSubscription, JobNotification, User
)
from app.auth.security import get_current_user, get_optional_user

router = APIRouter(prefix="/api/student", tags=["Student Job Preferences & Smart Alerts"])

def utc_now():
    return datetime.now(timezone.utc)


class JobPreferenceUpdate(BaseModel):
    qualification: Optional[str] = "GRADUATION"
    degree_department: Optional[str] = None
    graduation_year: Optional[int] = None
    skills: Optional[str] = None # comma separated
    experience_level: Optional[str] = "FRESHER"
    preferred_roles: Optional[str] = None
    preferred_locations: Optional[str] = None
    expected_salary_min: Optional[str] = None
    sector_preference: Optional[str] = "ALL"
    employment_type_preference: Optional[str] = "FULL_TIME"
    job_alerts_enabled: Optional[bool] = True
    email_alerts_enabled: Optional[bool] = True
    push_alerts_enabled: Optional[bool] = False


class JobAlertSubscriptionRequest(BaseModel):
    keyword: Optional[str] = None
    sector: Optional[str] = None
    category: Optional[str] = None
    qualification: Optional[str] = None
    frequency: Optional[str] = "INSTANT" # "INSTANT", "DAILY", "WEEKLY"


# =========================================================================
# 1. STUDENT JOB PREFERENCES
# =========================================================================

@router.get("/job-preferences")
async def get_student_job_preferences(
    user_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    target_user_id = current_user.id if current_user else user_id
    if not target_user_id:
        raise HTTPException(status_code=401, detail="Authentication required")

    stmt = select(StudentJobPreference).where(StudentJobPreference.user_id == target_user_id)
    res = await db.execute(stmt)
    pref = res.scalar_one_or_none()

    if not pref:
        # Default empty profile
        return {
            "user_id": target_user_id,
            "qualification": "GRADUATION",
            "degree_department": "",
            "graduation_year": None,
            "skills": "",
            "experience_level": "FRESHER",
            "preferred_roles": "",
            "preferred_locations": "All India",
            "expected_salary_min": "",
            "sector_preference": "ALL",
            "employment_type_preference": "FULL_TIME",
            "job_alerts_enabled": True,
            "email_alerts_enabled": True,
            "push_alerts_enabled": False
        }

    return {
        "id": pref.id,
        "user_id": pref.user_id,
        "qualification": pref.qualification,
        "degree_department": pref.degree_department,
        "graduation_year": pref.graduation_year,
        "skills": pref.skills,
        "experience_level": pref.experience_level,
        "preferred_roles": pref.preferred_roles,
        "preferred_locations": pref.preferred_locations,
        "expected_salary_min": pref.expected_salary_min,
        "sector_preference": pref.sector_preference,
        "employment_type_preference": pref.employment_type_preference,
        "job_alerts_enabled": pref.job_alerts_enabled,
        "email_alerts_enabled": pref.email_alerts_enabled,
        "push_alerts_enabled": pref.push_alerts_enabled,
        "updated_at": pref.updated_at.isoformat() if pref.updated_at else None
    }


@router.put("/job-preferences")
async def update_student_job_preferences(
    payload: JobPreferenceUpdate,
    user_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    target_user_id = current_user.id if current_user else user_id
    if not target_user_id:
        raise HTTPException(status_code=401, detail="Authentication required")

    stmt = select(StudentJobPreference).where(StudentJobPreference.user_id == target_user_id)
    res = await db.execute(stmt)
    pref = res.scalar_one_or_none()

    if not pref:
        pref = StudentJobPreference(user_id=target_user_id)
        db.add(pref)

    dump_data = payload.model_dump(exclude_unset=True) if hasattr(payload, "model_dump") else payload.dict(exclude_unset=True)
    for field, val in dump_data.items():
        setattr(pref, field, val)

    pref.updated_at = utc_now()
    await db.commit()
    await db.refresh(pref)

    return {"success": True, "message": "Career preferences & alert settings updated successfully!"}


# =========================================================================
# 2. PERSONALIZED JOB RECOMMENDATIONS ENGINE
# =========================================================================

@router.get("/job-recommendations")
async def get_personalized_job_recommendations(
    user_id: Optional[int] = Query(None),
    limit: int = Query(20, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    target_user_id = current_user.id if current_user else user_id
    if not target_user_id:
        raise HTTPException(status_code=401, detail="Authentication required")

    # Load preferences
    stmt = select(StudentJobPreference).where(StudentJobPreference.user_id == target_user_id)
    res = await db.execute(stmt)
    pref = res.scalar_one_or_none()

    # Load published jobs
    jobs_res = await db.execute(
        select(JobNotification)
        .where(JobNotification.status == "PUBLISHED")
        .order_by(desc(JobNotification.is_featured), desc(JobNotification.published_at))
        .limit(100)
    )
    all_jobs = jobs_res.scalars().all()

    student_skills = [s.strip().lower() for s in (pref.skills or "").split(",") if s.strip()] if pref else []
    student_roles = [r.strip().lower() for r in (pref.preferred_roles or "").split(",") if r.strip()] if pref else []
    student_qual = (pref.qualification or "GRADUATION").upper() if pref else "GRADUATION"
    student_sector = (pref.sector_preference or "ALL").upper() if pref else "ALL"

    scored_jobs = []
    for j in all_jobs:
        score = 50 # baseline
        match_reasons = []

        # Sector alignment
        if student_sector == "ALL" or j.sector == student_sector:
            score += 15
            match_reasons.append(f"Matches sector preference ({j.sector})")

        # Qualification match
        if student_qual in (j.qualification or "").upper():
            score += 20
            match_reasons.append(f"Matches educational criteria ({j.qualification})")

        # Skill match
        matched_skills = []
        j_skills = (j.required_skills or "").lower()
        for sk in student_skills:
            if sk in j_skills or sk in j.title.lower():
                matched_skills.append(sk)
        if matched_skills:
            score += min(20, len(matched_skills) * 8)
            match_reasons.append(f"Matched skills: {', '.join(matched_skills[:3])}")

        # Role match
        matched_roles = []
        for rl in student_roles:
            if rl in j.title.lower() or rl in j.job_description.lower():
                matched_roles.append(rl)
        if matched_roles:
            score += 15
            match_reasons.append(f"Target role match: {matched_roles[0]}")

        match_pct = min(98, score)

        scored_jobs.append({
            "id": j.id,
            "title": j.title,
            "slug": j.slug,
            "organization_name": j.organization_name,
            "organization_logo_url": j.organization_logo_url,
            "sector": j.sector,
            "category": j.category,
            "qualification": j.qualification,
            "required_skills": j.required_skills,
            "pay_scale": j.salary_range,
            "location": j.location,
            "total_vacancies": j.vacancies_count,
            "last_date_to_apply": j.application_end_date.isoformat() if j.application_end_date else None,
            "official_apply_url": j.official_application_url,
            "official_notification_pdf_url": j.official_notification_pdf,
            "match_percentage": match_pct,
            "match_reasons": match_reasons
        })

    # Sort by match percentage desc
    scored_jobs.sort(key=lambda x: x["match_percentage"], reverse=True)
    top_recommendations = scored_jobs[:limit]

    return {
        "total": len(top_recommendations),
        "recommendations": top_recommendations
    }


# =========================================================================
# 3. JOB ALERTS FEED & SUBSCRIPTIONS
# =========================================================================

@router.get("/job-alerts")
async def get_student_job_alerts(
    user_id: Optional[int] = Query(None),
    limit: int = Query(20, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    target_user_id = current_user.id if current_user else user_id
    if not target_user_id:
        raise HTTPException(status_code=401, detail="Authentication required")

    # Fetch user's subscriptions
    sub_res = await db.execute(
        select(JobAlertSubscription)
        .where(JobAlertSubscription.user_id == target_user_id, JobAlertSubscription.is_active == True)
    )
    subs = sub_res.scalars().all()

    # Fetch recently published vacancies (last 30 days)
    jobs_res = await db.execute(
        select(JobNotification)
        .where(JobNotification.status == "PUBLISHED")
        .order_by(desc(JobNotification.published_at))
        .limit(30)
    )
    jobs = jobs_res.scalars().all()

    alerts = []
    for j in jobs:
        is_closing_soon = False
        if j.application_end_date:
            days_left = (j.application_end_date.replace(tzinfo=timezone.utc) - utc_now()).days
            if 0 <= days_left <= 4:
                is_closing_soon = True

        alert_type = "DEADLINE_CLOSING" if is_closing_soon else "NEW_VACANCY"
        alert_title = (
            f"Closing Soon: {j.title}" if is_closing_soon
            else f"New Opening: {j.title}"
        )
        
        alerts.append({
            "id": f"alert-{j.id}",
            "job_id": j.id,
            "title": alert_title,
            "organization_name": j.organization_name,
            "slug": j.slug,
            "alert_type": alert_type,
            "sector": j.sector,
            "category": j.category,
            "vacancies_count": j.vacancies_count,
            "last_date_to_apply": j.application_end_date.isoformat() if j.application_end_date else None,
            "official_apply_url": j.official_application_url,
            "published_at": j.published_at.isoformat() if j.published_at else None,
            "is_closing_soon": is_closing_soon
        })

    subscriptions_data = [
        {
            "id": s.id,
            "keyword": s.keyword,
            "sector": s.sector,
            "category": s.category,
            "frequency": s.frequency,
            "is_active": s.is_active
        }
        for s in subs
    ]

    return {
        "total_alerts": len(alerts),
        "alerts": alerts[:limit],
        "subscriptions": subscriptions_data
    }


@router.post("/job-alerts/subscribe", status_code=status.HTTP_201_CREATED)
async def create_job_alert_subscription(
    payload: JobAlertSubscriptionRequest,
    user_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    target_user_id = current_user.id if current_user else user_id
    if not target_user_id:
        raise HTTPException(status_code=401, detail="Authentication required")

    sub = JobAlertSubscription(
        user_id=target_user_id,
        keyword=payload.keyword.strip() if payload.keyword else None,
        sector=payload.sector,
        category=payload.category,
        qualification=payload.qualification,
        frequency=payload.frequency or "INSTANT",
        is_active=True
    )
    db.add(sub)
    await db.commit()
    await db.refresh(sub)

    return {"success": True, "subscription_id": sub.id, "message": "Job alert subscription created successfully!"}


@router.delete("/job-alerts/subscriptions/{sub_id}")
async def delete_job_alert_subscription(
    sub_id: int,
    user_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    target_user_id = current_user.id if current_user else user_id
    if not target_user_id:
        raise HTTPException(status_code=401, detail="Authentication required")

    sub = await db.get(JobAlertSubscription, sub_id)
    if not sub or sub.user_id != target_user_id:
        raise HTTPException(status_code=404, detail="Subscription not found")

    await db.delete(sub)
    await db.commit()
    return {"success": True, "message": "Job alert subscription removed"}
