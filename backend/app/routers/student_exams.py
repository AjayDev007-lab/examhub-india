from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_, desc
from sqlalchemy.orm import selectinload
from typing import Optional, List
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel

from app.database import get_db
from app.models.models import (
    StudentExamRegistration, StudentCalendarEvent, ExamReminder,
    Examination, ExamSchedule, User
)
from app.auth.security import get_current_user

router = APIRouter(prefix="/api/student", tags=["Student Examinations, Calendar & Reminders"])

def utc_now():
    return datetime.now(timezone.utc)


# Pydantic Schemas
class ExamRegisterRequest(BaseModel):
    examination_id: int
    schedule_id: Optional[int] = None
    status: Optional[str] = "ADDED_TO_MY_EXAMS" # "ADDED_TO_MY_EXAMS", "REGISTRATION_STARTED", "APPLICATION_SUBMITTED", "APPLICATION_CONFIRMED"
    application_number: Optional[str] = None
    notes: Optional[str] = None


class ExternalExamRequest(BaseModel):
    external_exam_name: str
    external_authority: str
    external_exam_date: datetime
    external_application_deadline: Optional[datetime] = None
    status: Optional[str] = "APPLICATION_SUBMITTED"
    application_number: Optional[str] = None
    notes: Optional[str] = None


class RegistrationStatusUpdate(BaseModel):
    status: str
    application_number: Optional[str] = None
    notes: Optional[str] = None


class CustomCalendarEventRequest(BaseModel):
    title: str
    event_type: str = "CUSTOM" # "APPLICATION_START", "APPLICATION_END", "ADMIT_CARD", "EXAM_DATE", "RESULT_DATE", "CUSTOM"
    event_date: datetime
    end_date: Optional[datetime] = None
    location: Optional[str] = None
    notes: Optional[str] = None


class ReminderPreferenceUpdate(BaseModel):
    exam_30d: bool = True
    exam_7d: bool = True
    exam_1d: bool = True
    app_closing: bool = True
    admit_card: bool = True


# =========================================================================
# 1. STUDENT REGISTERED EXAMINATIONS ("MY EXAMS")
# =========================================================================

@router.get("/exams")
async def get_my_registered_exams(
    status_filter: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    target_user_id = current_user.id

    stmt = (
        select(StudentExamRegistration)
        .options(
            selectinload(StudentExamRegistration.examination).selectinload(Examination.organization),
            selectinload(StudentExamRegistration.schedule)
        )
        .where(StudentExamRegistration.user_id == target_user_id)
        .order_by(desc(StudentExamRegistration.created_at))
    )
    if status_filter and status_filter != "ALL":
        stmt = stmt.where(StudentExamRegistration.status == status_filter)

    res = await db.execute(stmt)
    registrations = res.scalars().all()

    out = []
    for r in registrations:
        exam_data = None
        if r.examination:
            exam_data = {
                "id": r.examination.id,
                "name": r.examination.name,
                "code": r.examination.code,
                "exam_type": r.examination.exam_type,
                "description": r.examination.description,
                "official_website": r.examination.organization.official_website if r.examination.organization else None,
                "syllabus_url": None,
                "notification_pdf_url": None
            }

        out.append({
            "id": r.id,
            "user_id": r.user_id,
            "examination_id": r.examination_id,
            "examination": exam_data,
            "schedule_id": r.schedule_id,
            "status": r.status,
            "application_number": r.application_number,
            "registration_date": r.registration_date.isoformat() if r.registration_date else None,
            "official_portal_url": r.official_portal_url or (r.examination.official_website if r.examination else None),
            "notes": r.notes,
            "is_external": r.is_external,
            "external_exam_name": r.external_exam_name,
            "external_authority": r.external_authority,
            "external_exam_date": r.external_exam_date.isoformat() if r.external_exam_date else None,
            "external_application_deadline": r.external_application_deadline.isoformat() if r.external_application_deadline else None,
            "created_at": r.created_at.isoformat() if r.created_at else None,
            "updated_at": r.updated_at.isoformat() if r.updated_at else None
        })

    return {"total": len(out), "registered_exams": out}


@router.post("/exams/register", status_code=status.HTTP_201_CREATED)
async def register_student_exam(
    payload: ExamRegisterRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    target_user_id = current_user.id

    exam_res = await db.execute(
        select(Examination).options(selectinload(Examination.organization)).where(Examination.id == payload.examination_id)
    )
    exam = exam_res.scalars().first()
    if not exam:
        raise HTTPException(status_code=404, detail="Examination not found")

    # Check if already added
    chk = await db.execute(
        select(StudentExamRegistration).where(
            StudentExamRegistration.user_id == target_user_id,
            StudentExamRegistration.examination_id == payload.examination_id
        )
    )
    existing = chk.scalars().first()
    if existing:
        # Update status if needed
        existing.status = payload.status or existing.status
        if payload.application_number:
            existing.application_number = payload.application_number
        if payload.notes:
            existing.notes = payload.notes
        await db.commit()
        await db.refresh(existing)
        return {"success": True, "message": "Examination updated in your list", "registration_id": existing.id}

    portal_url = exam.organization.official_website if (exam.organization and exam.organization.official_website) else None
    new_reg = StudentExamRegistration(
        user_id=target_user_id,
        examination_id=payload.examination_id,
        schedule_id=payload.schedule_id,
        status=payload.status or "ADDED_TO_MY_EXAMS",
        application_number=payload.application_number,
        registration_date=utc_now(),
        official_portal_url=portal_url,
        notes=payload.notes,
        is_external=False
    )
    db.add(new_reg)
    await db.flush()

    # Automatically add to student's calendar
    # Fetch schedule or default upcoming date
    sched_res = await db.execute(
        select(ExamSchedule).where(ExamSchedule.examination_id == exam.id).order_by(ExamSchedule.start_date.asc())
    )
    schedules = sched_res.scalars().all()

    if schedules:
        for sched in schedules:
            if sched.start_date:
                db.add(StudentCalendarEvent(
                    user_id=target_user_id,
                    registration_id=new_reg.id,
                    examination_id=exam.id,
                    title=f"{exam.name} - Exam Day",
                    event_type="EXAM_DATE",
                    event_date=sched.start_date,
                    notes=f"Exam scheduled for {exam.name}"
                ))
            if sched.end_date:
                db.add(StudentCalendarEvent(
                    user_id=target_user_id,
                    registration_id=new_reg.id,
                    examination_id=exam.id,
                    title=f"{exam.name} - Application Deadline",
                    event_type="APPLICATION_END",
                    event_date=sched.end_date,
                    notes="Last day to submit online application & fees."
                ))
            if sched.hall_ticket_release_date:
                db.add(StudentCalendarEvent(
                    user_id=target_user_id,
                    registration_id=new_reg.id,
                    examination_id=exam.id,
                    title=f"{exam.name} - Admit Card Release",
                    event_type="ADMIT_CARD",
                    event_date=sched.hall_ticket_release_date,
                    notes="Download official hall ticket."
                ))

            # Automatically schedule reminders: 30d, 7d, 1d before exam
            exam_target_date = sched.start_date
            if exam_target_date and exam_target_date > utc_now():
                if exam_target_date > utc_now() + timedelta(days=30):
                    db.add(ExamReminder(
                        user_id=target_user_id,
                        registration_id=new_reg.id,
                        examination_id=exam.id,
                        reminder_type="EXAM_30D",
                        title=f"30 Days to {exam.name}",
                        message=f"30 days remaining for {exam.name}. Ensure all revision modules are complete.",
                        scheduled_for=exam_target_date - timedelta(days=30)
                    ))
                if exam_target_date > utc_now() + timedelta(days=7):
                    db.add(ExamReminder(
                        user_id=target_user_id,
                        registration_id=new_reg.id,
                        examination_id=exam.id,
                        reminder_type="EXAM_7D",
                        title=f"7-Day Notice: {exam.name}",
                        message=f"Only 7 days left before {exam.name}. Check your exam venue logistics.",
                        scheduled_for=exam_target_date - timedelta(days=7)
                    ))
                db.add(ExamReminder(
                    user_id=target_user_id,
                    registration_id=new_reg.id,
                    examination_id=exam.id,
                    reminder_type="EXAM_1D",
                    title=f"Tomorrow: {exam.name}",
                    message=f"Tomorrow is your {exam.name} exam. Bring your original Photo ID and Admit Card.",
                    scheduled_for=exam_target_date - timedelta(days=1)
                ))
    else:
        # Generic upcoming calendar event
        future_date = utc_now() + timedelta(days=60)
        db.add(StudentCalendarEvent(
            user_id=target_user_id,
            registration_id=new_reg.id,
            examination_id=exam.id,
            title=f"{exam.name} - Target Examination",
            event_type="EXAM_DATE",
            event_date=future_date,
            notes=f"Target exam period for {exam.name}. Exact schedule will update once gazette notification releases."
        ))

    await db.commit()
    await db.refresh(new_reg)
    return {
        "success": True,
        "message": "Examination added to your dashboard and personal calendar successfully!",
        "registration_id": new_reg.id
    }


@router.post("/exams/external", status_code=status.HTTP_201_CREATED)
async def add_external_student_exam(
    payload: ExternalExamRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    target_user_id = current_user.id

    new_reg = StudentExamRegistration(
        user_id=target_user_id,
        examination_id=None,
        is_external=True,
        external_exam_name=payload.external_exam_name.strip(),
        external_authority=payload.external_authority.strip(),
        external_exam_date=payload.external_exam_date,
        external_application_deadline=payload.external_application_deadline,
        status=payload.status or "APPLICATION_SUBMITTED",
        application_number=payload.application_number,
        notes=payload.notes
    )
    db.add(new_reg)
    await db.flush()

    # Add external exam to calendar
    db.add(StudentCalendarEvent(
        user_id=target_user_id,
        registration_id=new_reg.id,
        title=f"{payload.external_exam_name} - Exam Day",
        event_type="EXAM_DATE",
        event_date=payload.external_exam_date,
        location=payload.external_authority,
        notes=payload.notes,
        is_custom=True
    ))

    # Add reminders
    if payload.external_exam_date > utc_now() + timedelta(days=7):
        db.add(ExamReminder(
            user_id=target_user_id,
            registration_id=new_reg.id,
            reminder_type="EXAM_7D",
            title=f"7-Day Alert: {payload.external_exam_name}",
            message=f"Only 7 days until {payload.external_exam_name} conducted by {payload.external_authority}.",
            scheduled_for=payload.external_exam_date - timedelta(days=7)
        ))
    db.add(ExamReminder(
        user_id=target_user_id,
        registration_id=new_reg.id,
        reminder_type="EXAM_1D",
        title=f"Exam Tomorrow: {payload.external_exam_name}",
        message=f"Tomorrow is your {payload.external_exam_name} exam.",
        scheduled_for=payload.external_exam_date - timedelta(days=1)
    ))

    await db.commit()
    await db.refresh(new_reg)
    return {
        "success": True,
        "message": "External examination added to your calendar and reminder timeline!",
        "registration_id": new_reg.id
    }


@router.put("/exams/{reg_id}/status")
async def update_student_exam_status(
    reg_id: int,
    payload: RegistrationStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    target_user_id = current_user.id

    reg = await db.get(StudentExamRegistration, reg_id)
    if not reg or reg.user_id != target_user_id:
        raise HTTPException(status_code=404, detail="Exam registration not found")

    reg.status = payload.status
    if payload.application_number is not None:
        reg.application_number = payload.application_number
    if payload.notes is not None:
        reg.notes = payload.notes
    reg.updated_at = utc_now()

    await db.commit()
    return {"success": True, "message": f"Application status updated to {payload.status}"}


@router.delete("/exams/{reg_id}")
async def remove_student_exam(
    reg_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    target_user_id = current_user.id

    reg = await db.get(StudentExamRegistration, reg_id)
    if not reg or reg.user_id != target_user_id:
        raise HTTPException(status_code=404, detail="Exam registration not found")

    # Cascade delete calendar events & reminders
    await db.delete(reg)
    await db.commit()
    return {"success": True, "message": "Examination removed from your registered list and calendar"}


# =========================================================================
# 2. PERSONAL EXAMINATION CALENDAR (MONTH, WEEK, DAY & ICS EXPORT)
# =========================================================================

@router.get("/calendar/events")
async def get_student_calendar_events(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    event_type: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    target_user_id = current_user.id

    query = select(StudentCalendarEvent).where(StudentCalendarEvent.user_id == target_user_id)

    if event_type and event_type != "ALL":
        query = query.where(StudentCalendarEvent.event_type == event_type)

    if start_date:
        try:
            s_dt = datetime.fromisoformat(start_date)
            query = query.where(StudentCalendarEvent.event_date >= s_dt)
        except Exception:
            pass

    if end_date:
        try:
            e_dt = datetime.fromisoformat(end_date)
            query = query.where(StudentCalendarEvent.event_date <= e_dt)
        except Exception:
            pass

    query = query.order_by(StudentCalendarEvent.event_date.asc())
    res = await db.execute(query)
    events = res.scalars().all()

    out = []
    for ev in events:
        out.append({
            "id": ev.id,
            "registration_id": ev.registration_id,
            "examination_id": ev.examination_id,
            "title": ev.title,
            "event_type": ev.event_type,
            "event_date": ev.event_date.isoformat(),
            "end_date": ev.end_date.isoformat() if ev.end_date else None,
            "is_all_day": ev.is_all_day,
            "location": ev.location,
            "notes": ev.notes,
            "status": ev.status,
            "is_custom": ev.is_custom
        })

    return {"total": len(out), "events": out}


@router.post("/calendar/events", status_code=status.HTTP_201_CREATED)
async def create_custom_calendar_event(
    payload: CustomCalendarEventRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    target_user_id = current_user.id

    new_ev = StudentCalendarEvent(
        user_id=target_user_id,
        title=payload.title.strip(),
        event_type=payload.event_type,
        event_date=payload.event_date,
        end_date=payload.end_date,
        location=payload.location,
        notes=payload.notes,
        is_custom=True
    )
    db.add(new_ev)
    await db.commit()
    await db.refresh(new_ev)
    return {"success": True, "event_id": new_ev.id, "message": "Custom event added to your calendar"}


@router.delete("/calendar/events/{event_id}")
async def delete_calendar_event(
    event_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    target_user_id = current_user.id

    ev = await db.get(StudentCalendarEvent, event_id)
    if not ev or ev.user_id != target_user_id:
        raise HTTPException(status_code=404, detail="Event not found")

    await db.delete(ev)
    await db.commit()
    return {"success": True, "message": "Event deleted from your calendar"}


# Standard RFC 5545 iCalendar (.ics) export
@router.get("/calendar/export.ics")
async def export_calendar_ics(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    target_user_id = current_user.id

    res = await db.execute(
        select(StudentCalendarEvent)
        .where(StudentCalendarEvent.user_id == target_user_id)
        .order_by(StudentCalendarEvent.event_date.asc())
    )
    events = res.scalars().all()

    lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//ExamHub India//Student Examination Calendar//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        "X-WR-CALNAME:ExamHub India - My Examination Calendar",
        "X-WR-TIMEZONE:Asia/Kolkata"
    ]

    for ev in events:
        dt_str = ev.event_date.strftime("%Y%m%dT%H%M%SZ")
        end_dt_str = (ev.end_date or (ev.event_date + timedelta(hours=3))).strftime("%Y%m%dT%H%M%SZ")
        uid = f"examhub-{ev.id}-{target_user_id}@examhub.in"
        summary = ev.title.replace(",", "\\,").replace(";", "\\;")
        desc = (ev.notes or f"Official Event Type: {ev.event_type}").replace("\n", "\\n")
        loc = (ev.location or "Official Examination Center").replace(",", "\\,")

        lines.extend([
            "BEGIN:VEVENT",
            f"UID:{uid}",
            f"DTSTAMP:{utc_now().strftime('%Y%m%dT%H%M%SZ')}",
            f"DTSTART:{dt_str}",
            f"DTEND:{end_dt_str}",
            f"SUMMARY:{summary}",
            f"DESCRIPTION:{desc}",
            f"LOCATION:{loc}",
            f"STATUS:CONFIRMED",
            "END:VEVENT"
        ])

    lines.append("END:VCALENDAR")
    ics_content = "\r\n".join(lines)

    return Response(
        content=ics_content,
        media_type="text/calendar",
        headers={
            "Content-Disposition": f"attachment; filename=examhub_calendar_{target_user_id}.ics"
        }
    )


# =========================================================================
# 3. STUDENT EXAMINATION REMINDERS
# =========================================================================

@router.get("/reminders")
async def get_student_reminders(
    status: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    target_user_id = current_user.id

    query = select(ExamReminder).where(ExamReminder.user_id == target_user_id)
    if status and status != "ALL":
        query = query.where(ExamReminder.status == status)

    query = query.order_by(ExamReminder.scheduled_for.asc())
    res = await db.execute(query)
    reminders = res.scalars().all()

    out = []
    for rem in reminders:
        out.append({
            "id": rem.id,
            "registration_id": rem.registration_id,
            "examination_id": rem.examination_id,
            "reminder_type": rem.reminder_type,
            "title": rem.title,
            "message": rem.message,
            "scheduled_for": rem.scheduled_for.isoformat(),
            "sent_at": rem.sent_at.isoformat() if rem.sent_at else None,
            "status": rem.status,
            "delivery_channel": rem.delivery_channel
        })

    return {"total": len(out), "reminders": out}
