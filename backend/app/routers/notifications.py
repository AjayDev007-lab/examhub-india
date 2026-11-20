from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from typing import List
from app.database import get_db
from app.models.models import Notification, SupportTicket, User
from app.schemas.schemas import NotificationOut, SupportTicketCreate, SupportTicketOut
from app.auth.security import get_current_user

router = APIRouter(prefix="/api", tags=["Notifications & Support"])

@router.get("/notifications", response_model=List[NotificationOut])
async def get_my_notifications(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    stmt = select(Notification).where(Notification.user_id == user.id).order_by(Notification.created_at.desc()).limit(50)
    res = await db.execute(stmt)
    return res.scalars().all()

@router.put("/notifications/{notif_id}/read")
async def mark_notification_read(
    notif_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    stmt = select(Notification).where(Notification.id == notif_id, Notification.user_id == user.id)
    notif = (await db.execute(stmt)).scalar_one_or_none()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    notif.is_read = True
    await db.commit()
    return {"success": True, "message": "Marked as read"}

@router.post("/support", response_model=SupportTicketOut)
async def create_support_ticket(
    req: SupportTicketCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    ticket = SupportTicket(
        user_id=user.id,
        subject=req.subject.strip(),
        category=req.category,
        message=req.message.strip(),
        priority=req.priority,
        status="OPEN"
    )
    db.add(ticket)
    await db.commit()
    await db.refresh(ticket)
    return ticket

@router.get("/support", response_model=List[SupportTicketOut])
async def list_my_support_tickets(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    stmt = select(SupportTicket).where(SupportTicket.user_id == user.id).order_by(SupportTicket.created_at.desc())
    res = await db.execute(stmt)
    return res.scalars().all()
