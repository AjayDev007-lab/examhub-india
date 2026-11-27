from typing import Any, Optional
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.security import get_current_admin
from app.database import get_db
from app.models.models import AdminUser, SchoolChapterContent

router = APIRouter(prefix="/api/school/chapters", tags=["School Learning Content"])


class ChapterCreate(BaseModel):
    id: Optional[str] = None
    board_code: str = "CBSE"
    board_name: str = "Central Board of Secondary Education"
    class_level: str = "10"
    subject: str = "Science"
    subject_code: Optional[str] = None
    chapter_number: int = 1
    chapter_title: str
    summary_notes: str = ""
    pdf_notes_url: str = ""
    video_lessons: list[Any] = Field(default_factory=list)
    previous_exam_questions: list[Any] = Field(default_factory=list)
    important_questions: list[Any] = Field(default_factory=list)
    practice_quiz: list[Any] = Field(default_factory=list)


def _serialize(chapter: SchoolChapterContent) -> dict:
    return {
        "id": chapter.id,
        "board_code": chapter.board_code,
        "board_name": chapter.board_name,
        "class_level": chapter.class_level,
        "subject": chapter.subject,
        "subject_code": chapter.subject_code,
        "chapter_number": chapter.chapter_number,
        "chapter_title": chapter.chapter_title,
        "summary_notes": chapter.summary_notes,
        "pdf_notes_url": chapter.pdf_notes_url,
        "video_lessons": chapter.video_lessons or [],
        "previous_exam_questions": chapter.previous_exam_questions or [],
        "important_questions": chapter.important_questions or [],
        "practice_quiz": chapter.practice_quiz or [],
    }


@router.get("")
async def list_chapters(
    board: Optional[str] = None,
    class_level: Optional[str] = None,
    subject: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    query = select(SchoolChapterContent)
    if board and board.upper() != "ALL":
        query = query.where(SchoolChapterContent.board_code.ilike(board.strip()))
    if class_level and class_level.upper() != "ALL":
        query = query.where(SchoolChapterContent.class_level == class_level)
    if subject and subject.upper() != "ALL":
        query = query.where(SchoolChapterContent.subject.ilike(f"%{subject.strip()}%"))
    result = await db.execute(query.order_by(SchoolChapterContent.board_code, SchoolChapterContent.class_level, SchoolChapterContent.subject, SchoolChapterContent.chapter_number))
    chapters = [_serialize(chapter) for chapter in result.scalars().all()]
    return {"success": True, "total": len(chapters), "chapters": chapters}


@router.get("/{chapter_id}")
async def get_chapter(chapter_id: str, db: AsyncSession = Depends(get_db)):
    chapter = await db.get(SchoolChapterContent, chapter_id)
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter resource not found")
    return {"success": True, "chapter": _serialize(chapter)}


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_chapter(
    payload: ChapterCreate,
    db: AsyncSession = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin),
):
    title = payload.chapter_title.strip()
    if not title:
        raise HTTPException(status_code=400, detail="Chapter title is required")
    chapter = SchoolChapterContent(
        id=payload.id or f"chapter-{uuid4().hex}",
        board_code=payload.board_code.strip().upper(),
        board_name=payload.board_name.strip(),
        class_level=payload.class_level.strip(),
        subject=payload.subject.strip(),
        subject_code=payload.subject_code,
        chapter_number=max(payload.chapter_number, 1),
        chapter_title=title,
        summary_notes=payload.summary_notes,
        pdf_notes_url=payload.pdf_notes_url,
        video_lessons=payload.video_lessons,
        previous_exam_questions=payload.previous_exam_questions,
        important_questions=payload.important_questions,
        practice_quiz=payload.practice_quiz,
    )
    if await db.get(SchoolChapterContent, chapter.id):
        raise HTTPException(status_code=409, detail="A chapter with this ID already exists")
    db.add(chapter)
    await db.commit()
    await db.refresh(chapter)
    return {"success": True, "chapter": _serialize(chapter)}
