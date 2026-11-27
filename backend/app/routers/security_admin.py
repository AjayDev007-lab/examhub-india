import asyncio
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.security import get_current_admin
from app.database import get_db
from app.models.models import AdminUser, AuditLog, SecurityIncident, UserSession
from app.services.connectivity_service import validate_target_url

router = APIRouter(
    prefix="/api/admin/security",
    tags=["Admin Security Centre"],
    dependencies=[Depends(get_current_admin)],
)


class SecurityAction(BaseModel):
    action: str
    incidentId: Optional[int] = None


@router.get("")
async def get_security_overview(db: AsyncSession = Depends(get_db)):
    incidents_result = await db.execute(select(SecurityIncident).order_by(desc(SecurityIncident.created_at)).limit(100))
    incidents = incidents_result.scalars().all()
    unresolved = sum(1 for incident in incidents if not incident.is_resolved)
    now = datetime.now(timezone.utc)
    active_students = await db.scalar(select(func.count(UserSession.id)).where(
        UserSession.is_revoked.is_(False), UserSession.expires_at > now
    )) or 0
    ssrf_enabled, _ = await asyncio.to_thread(validate_target_url, "https://example.com")
    return {
        "incidents": [{
            "id": incident.id,
            "incident_type": incident.incident_type,
            "severity": incident.severity,
            "source_ip": incident.source_ip,
            "user_agent": incident.user_agent,
            "target_resource": incident.target_resource,
            "details": incident.details,
            "is_resolved": incident.is_resolved,
            "created_at": incident.created_at.isoformat() if incident.created_at else None,
        } for incident in incidents],
        "securityStatus": {
            "firewall": "CLOUD_RUN_INGRESS",
            "ssrfProtection": "ENFORCING" if ssrf_enabled else "ERROR",
            "rateLimiter": "NOT_CONFIGURED",
            "mfaEnforced": False,
            "activeAdminSessions": None,
            "activeStudentSessions": int(active_students),
            "unresolvedAlerts": unresolved,
        },
    }


@router.post("")
async def apply_security_action(
    payload: SecurityAction,
    db: AsyncSession = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin),
):
    if payload.action != "RESOLVE_INCIDENT" or not payload.incidentId:
        raise HTTPException(status_code=400, detail="Unsupported security action")
    incident = await db.get(SecurityIncident, payload.incidentId)
    if not incident:
        raise HTTPException(status_code=404, detail="Security incident not found")
    incident.is_resolved = True
    incident.resolved_by_admin_id = admin.id
    db.add(AuditLog(
        actor_type="ADMIN",
        actor_id=admin.id,
        action="SECURITY_RESOLVE_INCIDENT",
        target_type="SECURITY_INCIDENT",
        target_id=incident.id,
        details_json={"incident_type": incident.incident_type},
    ))
    await db.commit()
    return {"success": True}
