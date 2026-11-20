from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, Dict, Any
from app.models.models import AuditLog

async def log_audit_event(
    db: AsyncSession,
    actor_type: str, # "USER", "ADMIN", "SYSTEM"
    actor_id: Optional[int],
    action: str,
    target_type: Optional[str] = None,
    target_id: Optional[int] = None,
    details: Optional[Dict[str, Any]] = None,
    ip_address: Optional[str] = None
):
    """Creates a permanent tamper-evident audit log record."""
    try:
        log_entry = AuditLog(
            actor_type=actor_type,
            actor_id=actor_id,
            action=action,
            target_type=target_type,
            target_id=target_id,
            details_json=details or {},
            ip_address=ip_address
        )
        db.add(log_entry)
        await db.commit()
    except Exception as e:
        print(f"Error logging audit event: {e}")
