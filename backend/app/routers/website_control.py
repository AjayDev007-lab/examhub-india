from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from pydantic import BaseModel

from app.database import get_db
from app.models.models import WebsiteOperatingControl, WebsiteStatusHistory, AdminUser, AdminRole
from app.auth.security import get_current_admin
from app.services.audit_service import log_audit_event

router = APIRouter(tags=["Super Admin Website Availability & Operating Mode Control"])

def utc_now():
    return datetime.now(timezone.utc)

class ModeChangeRequest(BaseModel):
    mode: str # "ONLINE", "MAINTENANCE", "OFFLINE"
    reason: str
    maintenance_message: Optional[str] = None
    estimated_return_time: Optional[str] = None
    scheduled_end_time: Optional[str] = None
    admin_confirmation_code: Optional[str] = None # Required "CONFIRM-OFFLINE" for OFFLINE mode

class SettingsUpdateRequest(BaseModel):
    maintenance_message: Optional[str] = None
    estimated_return_time: Optional[str] = None
    auto_online_enabled: Optional[bool] = None
    allowed_admin_ips: Optional[str] = None
    scheduled_start_time: Optional[str] = None
    scheduled_end_time: Optional[str] = None

class EmergencyRecoveryRequest(BaseModel):
    reason: Optional[str] = None
    reason: Optional[str] = "Emergency recovery invoked by Super Admin"

# =========================================================================
# 1. PUBLIC STATUS ENDPOINT (Used by frontend middleware & mobile app)
# =========================================================================
@router.get("/api/status")
async def get_public_website_status(db: AsyncSession = Depends(get_db)):
    stmt = select(WebsiteOperatingControl).order_by(WebsiteOperatingControl.id.asc()).limit(1)
    res = await db.execute(stmt)
    control = res.scalar_one_or_none()

    if not control:
        return {
            "mode": "ONLINE",
            "is_public_accessible": True,
            "maintenance_message": "ExamHub India is online.",
            "estimated_return_time": None
        }

    return {
        "mode": control.mode,
        "is_public_accessible": control.mode == "ONLINE",
        "maintenance_message": control.maintenance_message,
        "estimated_return_time": control.estimated_return_time,
        "scheduled_end_time": control.scheduled_end_time.isoformat() if control.scheduled_end_time else None
    }

# =========================================================================
# 2. ADMIN STATUS OVERVIEW
# =========================================================================
@router.get("/api/admin/website-control/status")
async def get_admin_website_status(
    admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(WebsiteOperatingControl).order_by(WebsiteOperatingControl.id.asc()).limit(1)
    res = await db.execute(stmt)
    control = res.scalar_one_or_none()

    if not control:
        control = WebsiteOperatingControl(mode="ONLINE")
        db.add(control)
        await db.commit()
        await db.refresh(control)

    # Last status history
    hist_stmt = select(WebsiteStatusHistory).order_by(desc(WebsiteStatusHistory.timestamp)).limit(1)
    last_hist = (await db.execute(hist_stmt)).scalar_one_or_none()

    return {
        "mode": control.mode,
        "maintenance_message": control.maintenance_message,
        "estimated_return_time": control.estimated_return_time,
        "scheduled_start_time": control.scheduled_start_time.isoformat() if control.scheduled_start_time else None,
        "scheduled_end_time": control.scheduled_end_time.isoformat() if control.scheduled_end_time else None,
        "auto_online_enabled": control.auto_online_enabled,
        "allowed_admin_ips": control.allowed_admin_ips,
        "updated_at": control.updated_at.isoformat(),
        "last_transition": {
            "previous_mode": last_hist.previous_mode if last_hist else "ONLINE",
            "new_mode": last_hist.new_mode if last_hist else "ONLINE",
            "reason": last_hist.reason if last_hist else "Initial system setup",
            "admin_email": last_hist.admin_email if last_hist else "system",
            "timestamp": last_hist.timestamp.isoformat() if last_hist else control.updated_at.isoformat()
        }
    }

# =========================================================================
# 3. CHANGE OPERATING MODE (ONLINE / MAINTENANCE / OFFLINE)
# =========================================================================
@router.post("/api/admin/website-control/mode")
async def change_website_mode(
    payload: ModeChangeRequest,
    request: Request,
    admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    target_mode = payload.mode.upper()
    if target_mode not in ["ONLINE", "MAINTENANCE", "OFFLINE"]:
        raise HTTPException(status_code=400, detail="Invalid mode. Must be ONLINE, MAINTENANCE, or OFFLINE.")

    # Only Super Admin can take site OFFLINE or change system mode
    role_stmt = select(AdminRole).where(AdminRole.id == admin.role_id)
    admin_role = (await db.execute(role_stmt)).scalar_one_or_none()
    if not admin_role or admin_role.name != "SUPER_ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Only Super Administrator can modify the platform operating availability."
        )

    # Offline mode requires strict explicit confirmation code
    if target_mode == "OFFLINE" and payload.admin_confirmation_code != "CONFIRM-OFFLINE":
        raise HTTPException(
            status_code=400,
            detail="Taking website OFFLINE requires strict confirmation code: 'CONFIRM-OFFLINE'."
        )

    stmt = select(WebsiteOperatingControl).order_by(WebsiteOperatingControl.id.asc()).limit(1)
    res = await db.execute(stmt)
    control = res.scalar_one_or_none()

    if not control:
        control = WebsiteOperatingControl(mode="ONLINE")
        db.add(control)
        await db.flush()

    previous_mode = control.mode
    control.mode = target_mode
    if payload.maintenance_message:
        control.maintenance_message = payload.maintenance_message
    if payload.estimated_return_time:
        control.estimated_return_time = payload.estimated_return_time
    if payload.scheduled_end_time:
        try:
            control.scheduled_end_time = datetime.fromisoformat(payload.scheduled_end_time)
        except Exception:
            pass

    control.updated_by_admin_id = admin.id
    control.updated_at = utc_now()

    # Record Audit History
    client_ip = request.client.host if request.client else "127.0.0.1"
    history_entry = WebsiteStatusHistory(
        previous_mode=previous_mode,
        new_mode=target_mode,
        reason=payload.reason or f"Mode transition requested by {admin.email}",
        changed_by_admin_id=admin.id,
        admin_email=admin.email,
        ip_address=client_ip,
        timestamp=utc_now()
    )
    db.add(history_entry)
    await db.commit()

    return {
        "success": True,
        "previous_mode": previous_mode,
        "current_mode": control.mode,
        "message": f"Website operating mode successfully changed to {target_mode}."
    }

# =========================================================================
# 4. AUDIT HISTORY OF STATUS TRANSITIONS
# =========================================================================
@router.get("/api/admin/website-control/history")
async def get_website_status_history(
    limit: int = Query(50, ge=1, le=100),
    admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(WebsiteStatusHistory).order_by(desc(WebsiteStatusHistory.timestamp)).limit(limit)
    res = await db.execute(stmt)
    records = res.scalars().all()

    return {
        "total": len(records),
        "history": [
            {
                "id": r.id,
                "previous_mode": r.previous_mode,
                "new_mode": r.new_mode,
                "reason": r.reason,
                "admin_email": r.admin_email,
                "ip_address": r.ip_address,
                "timestamp": r.timestamp.isoformat()
            }
            for r in records
        ]
    }

# =========================================================================
# 5. UPDATE SETTINGS
# =========================================================================
@router.put("/api/admin/website-control/settings")
async def update_website_control_settings(
    payload: SettingsUpdateRequest,
    admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    role_stmt = select(AdminRole).where(AdminRole.id == admin.role_id)
    admin_role = (await db.execute(role_stmt)).scalar_one_or_none()
    if not admin_role or admin_role.name != "SUPER_ADMIN":
        raise HTTPException(status_code=403, detail="Forbidden: Super Admin access required.")

    stmt = select(WebsiteOperatingControl).order_by(WebsiteOperatingControl.id.asc()).limit(1)
    control = (await db.execute(stmt)).scalar_one_or_none()

    if not control:
        control = WebsiteOperatingControl()
        db.add(control)

    if payload.maintenance_message is not None:
        control.maintenance_message = payload.maintenance_message
    if payload.estimated_return_time is not None:
        control.estimated_return_time = payload.estimated_return_time
    if payload.auto_online_enabled is not None:
        control.auto_online_enabled = payload.auto_online_enabled
    if payload.allowed_admin_ips is not None:
        control.allowed_admin_ips = payload.allowed_admin_ips
    if payload.scheduled_start_time:
        try:
            control.scheduled_start_time = datetime.fromisoformat(payload.scheduled_start_time)
        except Exception:
            pass
    if payload.scheduled_end_time:
        try:
            control.scheduled_end_time = datetime.fromisoformat(payload.scheduled_end_time)
        except Exception:
            pass

    control.updated_by_admin_id = admin.id
    control.updated_at = utc_now()
    await db.commit()

    return {"success": True, "message": "Website operating settings updated successfully."}

# =========================================================================
# 6. EMERGENCY RECOVERY ENDPOINT (Super Admin Failsafe)
# =========================================================================
@router.post("/api/admin/website-control/emergency-recovery")
async def emergency_website_recovery(
    payload: EmergencyRecoveryRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    stmt = select(WebsiteOperatingControl).order_by(WebsiteOperatingControl.id.asc()).limit(1)
    control = (await db.execute(stmt)).scalar_one_or_none()

    if not control:
        control = WebsiteOperatingControl()
        db.add(control)

    prev_mode = control.mode
    control.mode = "ONLINE"
    control.updated_at = utc_now()

    client_ip = request.client.host if request.client else "127.0.0.1"
    db.add(WebsiteStatusHistory(
        previous_mode=prev_mode,
        new_mode="ONLINE",
        reason=payload.reason or "Master emergency recovery key used to force website ONLINE.",
        admin_email=admin.email,
        ip_address=client_ip,
        timestamp=utc_now()
    ))
    await db.commit()

    return {
        "success": True,
        "previous_mode": prev_mode,
        "new_mode": "ONLINE",
        "message": "EMERGENCY RECOVERY ACTIVATED: Website immediately brought back ONLINE."
    }
