import os
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Request
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
from app.database import get_db
from app.models.models import Organization, StudentDocument, DocumentType, User
from app.schemas.schemas import IDCardRetrieveRequest, IDCardOut
from app.auth.security import get_optional_user, get_current_user
from app.adapters.registry import get_adapter
from app.services.document_service import (
    generate_id_card_pdf, generate_pdf_preview, generate_signed_token, validate_file_content
)
from app.services.audit_service import log_audit_event
from app.config import settings

router = APIRouter(prefix="/api/id-cards", tags=["Student ID Card Engine"])

@router.post("/check", response_model=IDCardOut)
async def check_and_retrieve_id_card(
    req: IDCardRetrieveRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
    user: Optional[User] = Depends(get_optional_user)
):
    stmt = select(Organization).where(Organization.id == req.organization_id)
    org = (await db.execute(stmt)).scalar_one_or_none()
    if not org:
        raise HTTPException(status_code=404, detail="Institution not found")

    adapter = get_adapter(org.code)
    retrieval = adapter.retrieve_id_card(
        enrollment_number=req.student_enrollment_no.strip(),
        admission_year=req.admission_year,
        date_of_birth=req.date_of_birth
    )

    if not retrieval.get("is_available"):
        raise HTTPException(
            status_code=404,
            detail=retrieval.get("error") or f"ID card not found or institution requires direct login. Visit portal: {org.id_card_portal_url or org.official_website}"
        )

    # Generate legitimate preview/document for student download
    card_data = {
        "id": org.id,
        "institution_name": org.name,
        "student_name": retrieval.get("student_name", "STUDENT"),
        "enrollment_number": req.student_enrollment_no.strip(),
        "course_branch": retrieval.get("course_branch", "General Studies / Professional Degree"),
        "academic_year": retrieval.get("academic_year", f"{req.admission_year}-{req.admission_year + 4}"),
        "valid_upto": retrieval.get("valid_upto", f"31 Dec {req.admission_year + 4}"),
        "blood_group": retrieval.get("blood_group", "O+"),
        "emergency_contact": retrieval.get("emergency_contact", "N/A"),
        "is_verified": retrieval.get("is_verified", True),
        "source": retrieval.get("source", "INSTITUTION_INTEGRATION"),
        "official_portal_url": org.id_card_portal_url or org.official_website
    }

    pdf_filename = f"idcard_{org.code}_{req.student_enrollment_no.strip()}.pdf"
    pdf_path = os.path.join(settings.STORAGE_DIR, "documents", pdf_filename)
    preview_filename = f"idcard_{org.code}_{req.student_enrollment_no.strip()}.png"
    preview_path = os.path.join(settings.STORAGE_DIR, "previews", preview_filename)

    if not os.path.exists(pdf_path):
        generate_id_card_pdf(card_data, pdf_path)
        generate_pdf_preview(pdf_path, preview_path)

    card_data["download_url"] = f"/api/id-cards/{org.id}/download?enrollment={req.student_enrollment_no.strip()}"

    # Optionally store in user library if logged in
    doc_id = None
    if user:
        doc_type_res = await db.execute(select(DocumentType).where(DocumentType.code == "STUDENT_ID_CARD"))
        doc_type = doc_type_res.scalar_one_or_none()
        doc_type_id = doc_type.id if doc_type else 3

        existing_doc_res = await db.execute(
            select(StudentDocument).where(
                StudentDocument.user_id == user.id,
                StudentDocument.original_filename == pdf_filename,
                StudentDocument.deleted_at.is_(None)
            )
        )
        existing_doc = existing_doc_res.scalar_one_or_none()
        if not existing_doc:
            token = generate_signed_token()
            new_doc = StudentDocument(
                user_id=user.id,
                document_type_id=doc_type_id,
                title=f"{org.name} Student ID Card",
                original_filename=pdf_filename,
                stored_path=pdf_filename,
                preview_path=preview_filename if os.path.exists(preview_path) else None,
                mime_type="application/pdf",
                file_size=os.path.getsize(pdf_path) if os.path.exists(pdf_path) else 0,
                is_verified=True,
                source="INSTITUTION_INTEGRATION",
                encrypted_token=token
            )
            db.add(new_doc)
            await db.commit()
            doc_id = new_doc.id
        else:
            doc_id = existing_doc.id

    card_data["document_id"] = doc_id

    # Audit
    client_ip = request.client.host if request.client else "127.0.0.1"
    await log_audit_event(
        db,
        actor_type="USER" if user else "PUBLIC",
        actor_id=user.id if user else None,
        action="RETRIEVE_ID_CARD",
        target_type="ORGANIZATION",
        target_id=org.id,
        details={"enrollment": req.student_enrollment_no.strip()},
        ip_address=client_ip
    )

    return IDCardOut(**card_data)

@router.get("/{org_id}/download")
async def download_id_card(org_id: int, enrollment: str, db: AsyncSession = Depends(get_db)):
    stmt = select(Organization).where(Organization.id == org_id)
    org = (await db.execute(stmt)).scalar_one_or_none()
    if not org:
        raise HTTPException(status_code=404, detail="Institution not found")

    pdf_filename = f"idcard_{org.code}_{enrollment.strip()}.pdf"
    file_path = os.path.join(settings.STORAGE_DIR, "documents", pdf_filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="ID card document not found")

    return FileResponse(file_path, media_type="application/pdf", filename=f"StudentID_{org.code}_{enrollment}.pdf")

@router.post("/upload")
async def upload_legitimate_id_card(
    title: str = Form(...),
    organization_id: int = Form(...),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Allows a student to upload their legitimate institution-issued physical ID card scan for safe personal storage."""
    file_bytes = await file.read()
    detected_mime = validate_file_content(file_bytes, file.filename or "id_card.pdf")

    safe_token = generate_signed_token()
    extension = os.path.splitext(file.filename or "doc")[1].lower() or ".pdf"
    stored_name = f"upload_id_{user.id}_{safe_token[:12]}{extension}"
    upload_path = os.path.join(settings.STORAGE_DIR, "uploads", stored_name)

    with open(upload_path, "wb") as f:
        f.write(file_bytes)

    preview_name = None
    if detected_mime == "application/pdf":
        preview_filename = f"prev_{stored_name}.png"
        preview_path = os.path.join(settings.STORAGE_DIR, "previews", preview_filename)
        if generate_pdf_preview(upload_path, preview_path):
            preview_name = preview_filename

    doc_type_res = await db.execute(select(DocumentType).where(DocumentType.code == "STUDENT_ID_CARD"))
    doc_type = doc_type_res.scalar_one_or_none()
    doc_type_id = doc_type.id if doc_type else 3

    new_doc = StudentDocument(
        user_id=user.id,
        document_type_id=doc_type_id,
        title=title.strip(),
        original_filename=file.filename or stored_name,
        stored_path=os.path.join("uploads", stored_name),
        preview_path=preview_name,
        mime_type=detected_mime,
        file_size=len(file_bytes),
        is_verified=False, # Student upload pending institution sync
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
        "message": "Legitimate student ID uploaded and saved securely in your document vault."
    }
