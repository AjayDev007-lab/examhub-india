from typing import List, Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.security import get_current_user
from app.database import get_db
from app.models.models import StudentSchoolProfile, User

router = APIRouter(prefix="/api/student/school-profile", tags=["Student School Profile"])


class SchoolProfileUpdate(BaseModel):
    board_code: str = Field(default="", max_length=32)
    class_level: str = Field(default="12", pattern="^(10|11|12)$")
    stream: Optional[str] = Field(default=None, max_length=32)
    subjects: List[str] = Field(default_factory=list, max_length=30)
    saved_book_ids: List[int] = Field(default_factory=list, max_length=500)
    reading_progress: dict[int, int] = Field(default_factory=dict)


def profile_response(profile: StudentSchoolProfile, user_id: int):
    return {
        "user_id": user_id,
        "board_code": profile.board_code,
        "class_level": profile.class_level,
        "stream": profile.stream,
        "subjects": profile.subjects or [],
        "saved_book_ids": profile.saved_book_ids or [],
        "reading_progress": profile.reading_progress or {},
    }


@router.get("")
async def get_school_profile(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    profile = await db.scalar(select(StudentSchoolProfile).where(StudentSchoolProfile.user_id == user.id))
    if not profile:
        profile = StudentSchoolProfile(user_id=user.id, board_code="", class_level="12")
        db.add(profile)
        await db.commit()
        await db.refresh(profile)
    return {"success": True, "profile": profile_response(profile, user.id)}


@router.put("")
async def update_school_profile(
    payload: SchoolProfileUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    profile = await db.scalar(select(StudentSchoolProfile).where(StudentSchoolProfile.user_id == user.id))
    if not profile:
        profile = StudentSchoolProfile(user_id=user.id)
        db.add(profile)
    for field, value in payload.model_dump().items():
        setattr(profile, field, value)
    await db.commit()
    await db.refresh(profile)
    return {
        "success": True,
        "message": "School academic profile updated successfully",
        "profile": profile_response(profile, user.id),
    }
