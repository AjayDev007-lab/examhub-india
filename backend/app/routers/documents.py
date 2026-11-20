import os
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Request, Query
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload
from typing import Optional, List
from app.database import get_db
from app.models.models import StudentDocument, DocumentType, DocumentDownload, User
from app.schemas.schemas import DocumentOut
from app.auth.security import get_current_user
from app.services.document_service import (
    validate_file_content, generate_pdf_preview, generate_signed_token
)
from app.services.audit_service import log_audit_event
from app.config import settings
from datetime import datetime, timezone

router = APIRouter(prefix="/api/documents", tags=["Personal Document Management"])

@router.get("", response_model=List[DocumentOut])
async def list_student_documents(
    doc_type: Optional[str] = None,
    query: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    stmt = select(StudentDocument).options(selectinload(StudentDocument.document_type)).where(
        StudentDocument.user_id == user.id,
        StudentDocument.deleted_at.is_(None)
    )

    if doc_type:
        stmt = stmt.join(DocumentType).where(DocumentType.code == doc_type.upper().strip())
    if query:
        stmt = stmt.where(StudentDocument.title.ilike(f"%{query.strip()}%"))

    stmt = stmt.order_by(StudentDocument.created_at.desc())
    res = await db.execute(stmt)
    docs = res.scalars().all()

    items = []
    for d in docs:
        items.append(DocumentOut(
            id=d.id,
            user_id=d.user_id,
            document_type_code=d.document_type.code if d.document_type else "OTHER",
            document_type_name=d.document_type.name if d.document_type else "General Document",
            title=d.title,
            original_filename=d.original_filename,
            mime_type=d.mime_type,
            file_size=d.file_size,
            is_verified=d.is_verified,
            source=d.source,
            download_url=f"/api/documents/{d.id}/download",
            preview_url=f"/api/documents/{d.id}/preview" if d.preview_path else None,
            created_at=d.created_at
        ))
    return items

@router.post("/upload")
async def upload_document(
    title: str = Form(...),
    document_type_code: str = Form("OTHER"),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    file_bytes = await file.read()
    detected_mime = validate_file_content(file_bytes, file.filename or "upload.pdf")

    safe_token = generate_signed_token()
    extension = os.path.splitext(file.filename or "doc")[1].lower() or ".pdf"
    stored_name = f"doc_{user.id}_{safe_token[:12]}{extension}"
    upload_path = os.path.join(settings.STORAGE_DIR, "uploads", stored_name)

    with open(upload_path, "wb") as f:
        f.write(file_bytes)

    preview_name = None
    if detected_mime == "application/pdf":
        preview_filename = f"prev_{stored_name}.png"
        preview_path = os.path.join(settings.STORAGE_DIR, "previews", preview_filename)
        if generate_pdf_preview(upload_path, preview_path):
            preview_name = preview_filename

    # Resolve document type
    dt_res = await db.execute(select(DocumentType).where(DocumentType.code == document_type_code.upper().strip()))
    doc_type = dt_res.scalar_one_or_none()
    if not doc_type:
        dt_res = await db.execute(select(DocumentType).limit(1))
        doc_type = dt_res.scalar_one()

    new_doc = StudentDocument(
        user_id=user.id,
        document_type_id=doc_type.id,
        title=title.strip(),
        original_filename=file.filename or stored_name,
        stored_path=os.path.join("uploads", stored_name),
        preview_path=preview_name,
        mime_type=detected_mime,
        file_size=len(file_bytes),
        is_verified=False,
        source="STUDENT_UPLOAD",
        encrypted_token=safe_token
    )
    db.add(new_doc)
    await db.commit()
    await db.refresh(new_doc)

    return {
        "success": True,
        "document_id": new_doc.id,
        "title": new_doc.title,
        "download_url": f"/api/documents/{new_doc.id}/download",
        "message": "Document uploaded and secured successfully."
    }

@router.get("/{document_id}/download")
async def download_student_document(
    document_id: int,
    request: Request,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    # Strict student ownership isolation: user can only download their own document
    stmt = select(StudentDocument).where(
        StudentDocument.id == document_id,
        StudentDocument.user_id == user.id,
        StudentDocument.deleted_at.is_(None)
    )
    doc = (await db.execute(stmt)).scalar_one_or_none()
    if not doc:
        raise HTTPException(
            status_code=404,
            detail="Document not found or access unauthorized"
        )

    # Determine full disk path
    if doc.stored_path.startswith("uploads"):
        full_path = os.path.join(settings.STORAGE_DIR, doc.stored_path)
    else:
        full_path = os.path.join(settings.STORAGE_DIR, "documents", doc.stored_path)

    if not os.path.exists(full_path):
        raise HTTPException(status_code=404, detail="File content missing from encrypted storage")

    # Record download audit
    client_ip = request.client.host if request.client else "127.0.0.1"
    download_record = DocumentDownload(
        user_id=user.id,
        document_id=doc.id,
        ip_address=client_ip,
        user_agent=request.headers.get("user-agent", "Unknown")
    )
    db.add(download_record)
    await db.commit()

    return FileResponse(
        full_path,
        media_type=doc.mime_type,
        filename=doc.original_filename
    )

@router.get("/{document_id}/preview")
async def preview_student_document(
    document_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    stmt = select(StudentDocument).where(
        StudentDocument.id == document_id,
        StudentDocument.user_id == user.id,
        StudentDocument.deleted_at.is_(None)
    )
    doc = (await db.execute(stmt)).scalar_one_or_none()
    if not doc or not doc.preview_path:
        raise HTTPException(status_code=404, detail="Preview not available for this document")

    preview_path = os.path.join(settings.STORAGE_DIR, "previews", doc.preview_path)
    if not os.path.exists(preview_path):
        raise HTTPException(status_code=404, detail="Preview file missing")

    return FileResponse(preview_path, media_type="image/png")

@router.delete("/{document_id}")
async def delete_student_document(
    document_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    stmt = select(StudentDocument).where(
        StudentDocument.id == document_id,
        StudentDocument.user_id == user.id,
        StudentDocument.deleted_at.is_(None)
    )
    doc = (await db.execute(stmt)).scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # Soft delete for audit compliance
    doc.deleted_at = datetime.now(timezone.utc)
    await db.commit()

    return {"success": True, "message": "Document removed from your library"}
