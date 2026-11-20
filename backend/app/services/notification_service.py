from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from app.models.models import Notification

async def send_user_notification(
    db: AsyncSession,
    user_id: int,
    title: str,
    message: str,
    notification_type: str = "RESULT_ANNOUNCEMENT",
    priority: str = "NORMAL",
    source_url: Optional[str] = None
) -> Notification:
    """Dispatches an in-app student notification."""
    notif = Notification(
        user_id=user_id,
        title=title,
        message=message,
        notification_type=notification_type,
        priority=priority,
        source_url=source_url,
        is_read=False
    )
    db.add(notif)
    await db.commit()
    await db.refresh(notif)
    return notif
