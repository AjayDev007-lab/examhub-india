from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.security import require_role
from app.database import get_db
from app.models.models import AdminUser, AuditLog, FacultyMember

router = APIRouter(
    prefix="/api/admin/faculty",
    tags=["Admin Faculty"],
    dependencies=[Depends(require_role(["SUPER_ADMIN", "ADMIN"]))],
)


class FacultyCreate(BaseModel):
    name: str
    email: EmailStr
    institution_id: Optional[int] = 1
    institution_name: str = "Assigned Institution"
    department: str = "General"
    role: str = "FACULTY"


def _serialize(faculty: FacultyMember) -> dict:
    return {
        "id": faculty.id,
        "name": faculty.name,
        "email": faculty.email,
        "institution_id": faculty.institution_id,
        "institution_name": faculty.institution_name,
        "department": faculty.department,
        "role": faculty.role,
        "status": faculty.status,
    }


@router.get("")
async def list_faculty(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(FacultyMember).order_by(FacultyMember.name.asc()))
    faculty = [_serialize(item) for item in result.scalars().all()]
    return {"total": len(faculty), "faculty": faculty}


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_faculty(
    payload: FacultyCreate,
    db: AsyncSession = Depends(get_db),
    admin: AdminUser = Depends(require_role(["SUPER_ADMIN", "ADMIN"])),
):
    name = payload.name.strip()
    email = str(payload.email).strip().lower()
    if not name:
        raise HTTPException(status_code=400, detail="Faculty name is required")
    existing = await db.execute(select(FacultyMember.id).where(FacultyMember.email == email))
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(status_code=409, detail="Faculty member with this email already exists")
    max_id = await db.scalar(select(func.max(FacultyMember.id)))
    faculty = FacultyMember(
        id=max((max_id or 0), 999_999) + 1,
        name=name,
        email=email,
        institution_id=payload.institution_id,
        institution_name=payload.institution_name.strip(),
        department=payload.department.strip(),
        role=payload.role.upper(),
        status="ACTIVE",
    )
    db.add(faculty)
    db.add(AuditLog(
        actor_type="ADMIN",
        actor_id=admin.id,
        action="FACULTY_ASSIGNED",
        target_type="FACULTY",
        details_json={"name": name, "email": email, "institution_id": payload.institution_id},
    ))
    await db.commit()
    await db.refresh(faculty)
    return _serialize(faculty)
