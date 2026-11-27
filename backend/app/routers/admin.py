from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from sqlalchemy.orm import selectinload
from typing import Optional, List, Dict, Any
from app.database import get_db
from app.models.models import (
    AdminUser, AdminRole, User, Organization, Examination, ExamResult,
    ResultAnnouncement, PortalIntegration, AuditLog, SupportTicket, SystemSetting, Notification
)
from app.schemas.schemas import (
    AdminLogin, AdminUserOut, AdminProfileUpdate, AdminPasswordChange, Token, OrganizationCreate, OrganizationOut,
    ExaminationCreate, ExaminationOut, AuditLogOut, SupportTicketOut, DashboardStats
)
from app.auth.security import (
    verify_password, create_access_token, get_current_admin, require_role, hash_password
)
from app.adapters.registry import list_all_adapters
from app.services.audit_service import log_audit_event
from app.config import settings
from datetime import datetime, timezone

router = APIRouter(prefix="/api/admin", tags=["Separate Admin Portal"])

@router.post("/login", response_model=Token)
async def admin_login(req: AdminLogin, request: Request, db: AsyncSession = Depends(get_db)):
    stmt = select(AdminUser).options(selectinload(AdminUser.role)).where(
        AdminUser.email == req.email.lower().strip(),
        AdminUser.is_active == True
    )
    admin = (await db.execute(stmt)).scalar_one_or_none()

    if not admin or not verify_password(req.password, admin.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid administrator credentials")

    admin.last_login_at = datetime.now(timezone.utc)
    await db.commit()

    token = create_access_token({
        "sub": str(admin.id),
        "email": admin.email,
        "role": admin.role.name if admin.role else "ADMIN",
        "type": "admin"
    })

    client_ip = request.client.host if request.client else "127.0.0.1"
    await log_audit_event(
        db,
        actor_type="ADMIN",
        actor_id=admin.id,
        action="ADMIN_LOGIN",
        target_type="ADMIN_USER",
        target_id=admin.id,
        ip_address=client_ip
    )

    return Token(
        access_token=token,
        token_type="bearer",
        user_type="admin",
        user={
            "id": admin.id,
            "full_name": admin.full_name,
            "email": admin.email,
            "role": admin.role.name if admin.role else "ADMIN"
        }
    )

@router.get("/me", response_model=AdminUserOut)
async def get_admin_me(
    admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(AdminRole).where(AdminRole.id == admin.role_id)
    role = (await db.execute(stmt)).scalar_one_or_none()
    return AdminUserOut(
        id=admin.id,
        full_name=admin.full_name,
        email=admin.email,
        role_name=role.name if role else "ADMIN",
        is_active=admin.is_active,
        last_login_at=admin.last_login_at,
        created_at=admin.created_at
    )

@router.put("/profile", response_model=AdminUserOut)
async def update_admin_profile(
    req: AdminProfileUpdate,
    admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    if req.email and req.email.lower().strip() != admin.email.lower():
        stmt = select(AdminUser).where(AdminUser.email == req.email.lower().strip(), AdminUser.id != admin.id)
        existing = (await db.execute(stmt)).scalar_one_or_none()
        if existing:
            raise HTTPException(status_code=400, detail="This email is already registered to another administrator")
        admin.email = req.email.lower().strip()

    if req.full_name and req.full_name.strip():
        admin.full_name = req.full_name.strip()

    await db.commit()
    await db.refresh(admin)

    stmt = select(AdminRole).where(AdminRole.id == admin.role_id)
    role = (await db.execute(stmt)).scalar_one_or_none()
    return AdminUserOut(
        id=admin.id,
        full_name=admin.full_name,
        email=admin.email,
        role_name=role.name if role else "ADMIN",
        is_active=admin.is_active,
        last_login_at=admin.last_login_at,
        created_at=admin.created_at
    )

@router.put("/change-password")
async def change_admin_password(
    req: AdminPasswordChange,
    admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    if not verify_password(req.current_password, admin.password_hash):
        raise HTTPException(status_code=400, detail="Current password does not match records")

    if req.new_password != req.confirm_password:
        raise HTTPException(status_code=400, detail="New password and confirm password do not match")

    if len(req.new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters long")

    admin.password_hash = hash_password(req.new_password)
    await db.commit()

    return {"success": True, "message": "Administrator security key / password updated successfully!"}

@router.get("/dashboard", response_model=DashboardStats)
async def get_admin_dashboard_metrics(
    admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    total_orgs = (await db.execute(select(func.count(Organization.id)))).scalar() or 0
    total_exams = (await db.execute(select(func.count(Examination.id)))).scalar() or 0
    total_results = (await db.execute(select(func.count(ExamResult.id)))).scalar() or 0
    total_students = (await db.execute(select(func.count(User.id)))).scalar() or 0
    active_integrations = (await db.execute(select(func.count(PortalIntegration.id)).where(PortalIntegration.status == "OPERATIONAL"))).scalar() or 0
    recent_announcements = (await db.execute(select(func.count(ResultAnnouncement.id)))).scalar() or 0

    return DashboardStats(
        total_organizations=total_orgs,
        total_examinations=total_exams,
        total_results_indexed=total_results,
        total_students_registered=total_students,
        active_integrations=active_integrations,
        recent_announcements=recent_announcements
    )

# Student Management
@router.get("/users")
async def list_students(
    query: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    admin: AdminUser = Depends(require_role(["SUPER_ADMIN", "ADMIN", "SUPPORT_STAFF"])),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(User).where(User.deleted_at.is_(None))
    if query:
        q = f"%{query.strip()}%"
        stmt = stmt.where(or_(User.full_name.ilike(q), User.email.ilike(q), User.mobile.ilike(q)))
    stmt = stmt.order_by(User.created_at.desc()).limit(limit).offset(offset)
    res = await db.execute(stmt)
    users = res.scalars().all()

    # Never expose student password hash or raw private documents
    return [{
        "id": u.id,
        "full_name": u.full_name,
        "email": u.email,
        "mobile": u.mobile,
        "is_active": u.is_active,
        "is_verified": u.is_verified,
        "created_at": u.created_at
    } for u in users]

@router.put("/users/{user_id}/toggle-status")
async def toggle_student_status(
    user_id: int,
    admin: AdminUser = Depends(require_role(["SUPER_ADMIN", "ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(User).where(User.id == user_id)
    user = (await db.execute(stmt)).scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Student user not found")
    user.is_active = not user.is_active
    await db.commit()
    return {"success": True, "user_id": user.id, "is_active": user.is_active}

# Organization Management (Admins can add new organizations without modifying source code)
@router.post("/organizations", response_model=OrganizationOut)
async def create_organization(
    req: OrganizationCreate,
    admin: AdminUser = Depends(require_role(["SUPER_ADMIN", "ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    # Check duplicate code
    stmt = select(Organization).where(Organization.code == req.code.upper().strip())
    existing = (await db.execute(stmt)).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Organization code already exists")

    org = Organization(
        name=req.name.strip(),
        code=req.code.upper().strip(),
        category_id=req.category_id,
        state_id=req.state_id,
        official_website=req.official_website.strip(),
        result_portal_url=req.result_portal_url.strip() if req.result_portal_url else None,
        hall_ticket_portal_url=req.hall_ticket_portal_url.strip() if req.hall_ticket_portal_url else None,
        id_card_portal_url=req.id_card_portal_url.strip() if req.id_card_portal_url else None,
        contact_email=req.contact_email,
        contact_phone=req.contact_phone,
        integration_methods=req.integration_methods,
        verification_status=req.verification_status,
        is_active=True
    )
    db.add(org)
    await db.commit()
    await db.refresh(org)
    return org

@router.put("/organizations/{org_id}", response_model=OrganizationOut)
async def update_organization(
    org_id: int,
    req: OrganizationCreate,
    admin: AdminUser = Depends(require_role(["SUPER_ADMIN", "ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Organization).where(Organization.id == org_id)
    org = (await db.execute(stmt)).scalar_one_or_none()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    org.name = req.name.strip()
    org.official_website = req.official_website.strip()
    org.result_portal_url = req.result_portal_url.strip() if req.result_portal_url else None
    org.hall_ticket_portal_url = req.hall_ticket_portal_url.strip() if req.hall_ticket_portal_url else None
    org.id_card_portal_url = req.id_card_portal_url.strip() if req.id_card_portal_url else None
    org.contact_email = req.contact_email
    org.contact_phone = req.contact_phone
    org.integration_methods = req.integration_methods
    org.verification_status = req.verification_status
    await db.commit()
    await db.refresh(org)
    return org

# Examination Management
@router.post("/exams", response_model=ExaminationOut)
async def create_examination(
    req: ExaminationCreate,
    admin: AdminUser = Depends(require_role(["SUPER_ADMIN", "ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    exam = Examination(
        organization_id=req.organization_id,
        name=req.name.strip(),
        code=req.code.upper().strip(),
        exam_type=req.exam_type,
        description=req.description,
        year=req.year,
        cycle=req.cycle,
        requires_dob=req.requires_dob,
        requires_captcha=req.requires_captcha,
        is_active=True
    )
    db.add(exam)
    await db.commit()
    await db.refresh(exam)

    # Fetch with organization
    stmt = select(Examination).options(
        selectinload(Examination.organization),
        selectinload(Examination.schedules)
    ).where(Examination.id == exam.id)
    refreshed = (await db.execute(stmt)).scalar_one()

    return ExaminationOut(
        id=refreshed.id,
        organization_id=refreshed.organization_id,
        organization_name=refreshed.organization.name if refreshed.organization else None,
        organization_code=refreshed.organization.code if refreshed.organization else None,
        name=refreshed.name,
        code=refreshed.code,
        exam_type=refreshed.exam_type,
        description=refreshed.description,
        year=refreshed.year,
        cycle=refreshed.cycle,
        requires_dob=refreshed.requires_dob,
        requires_captcha=refreshed.requires_captcha,
        is_active=refreshed.is_active,
        schedules=[]
    )

# Portal Integration Health Monitoring
@router.get("/integrations")
async def monitor_integrations(
    admin: AdminUser = Depends(require_role(["SUPER_ADMIN", "ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    adapters = list_all_adapters()
    return adapters

# Announcements Publishing
@router.post("/announcements")
async def publish_announcement(
    data: Dict[str, Any],
    admin: AdminUser = Depends(require_role(["SUPER_ADMIN", "ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    ann = ResultAnnouncement(
        examination_id=data.get("examination_id"),
        title=data.get("title", "Official Exam Notification"),
        announcement_type=data.get("announcement_type", "RESULT_DECLARED"),
        circular_url=data.get("circular_url"),
        is_verified=True,
        announcement_text=data.get("announcement_text", ""),
        source_portal=data.get("source_portal")
    )
    db.add(ann)
    await db.commit()
    await db.refresh(ann)
    return ann

# Support Ticket Resolution
@router.get("/support-tickets", response_model=List[SupportTicketOut])
async def list_all_tickets(
    status: Optional[str] = None,
    admin: AdminUser = Depends(require_role(["SUPER_ADMIN", "ADMIN", "SUPPORT_STAFF"])),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(SupportTicket)
    if status:
        stmt = stmt.where(SupportTicket.status == status)
    stmt = stmt.order_by(SupportTicket.created_at.desc())
    res = await db.execute(stmt)
    return res.scalars().all()

@router.put("/support-tickets/{ticket_id}/reply")
async def reply_support_ticket(
    ticket_id: int,
    data: Dict[str, str],
    admin: AdminUser = Depends(require_role(["SUPER_ADMIN", "ADMIN", "SUPPORT_STAFF"])),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(SupportTicket).where(SupportTicket.id == ticket_id)
    ticket = (await db.execute(stmt)).scalar_one_or_none()
    if not ticket:
        raise HTTPException(status_code=404, detail="Support ticket not found")

    ticket.admin_response = data.get("response", "Your inquiry has been investigated.")
    ticket.status = data.get("status", "RESOLVED")
    ticket.resolved_by = admin.id
    await db.commit()

    # Dispatch notification to student
    notif = Notification(
        user_id=ticket.user_id,
        title=f"Support Ticket #{ticket.id} Update",
        message=f"Admin Response: {ticket.admin_response}",
        notification_type="SYSTEM",
        priority="NORMAL"
    )
    db.add(notif)
    await db.commit()

    return {"success": True, "ticket_id": ticket.id, "status": ticket.status}

# Audit Logs
@router.get("/audit-logs", response_model=List[AuditLogOut])
async def view_audit_logs(
    limit: int = 50,
    admin: AdminUser = Depends(require_role(["SUPER_ADMIN", "ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit)
    res = await db.execute(stmt)
    return res.scalars().all()

# System Settings
@router.get("/settings")
async def get_system_settings(
    admin: AdminUser = Depends(require_role(["SUPER_ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(SystemSetting)
    res = await db.execute(stmt)
    return res.scalars().all()

@router.put("/settings")
async def update_system_settings(
    settings_dict: Dict[str, str],
    admin: AdminUser = Depends(require_role(["SUPER_ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    for key, val in settings_dict.items():
        stmt = select(SystemSetting).where(SystemSetting.setting_key == key)
        setting = (await db.execute(stmt)).scalar_one_or_none()
        if setting:
            setting.setting_value = str(val)
        else:
            db.add(SystemSetting(setting_key=key, setting_value=str(val)))
    await db.commit()
    return {"success": True, "message": "System settings updated successfully."}
