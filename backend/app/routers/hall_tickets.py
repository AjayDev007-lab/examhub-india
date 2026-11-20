import os
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import Optional
from app.database import get_db
from app.models.models import Examination, StudentDocument, DocumentType, User
from app.schemas.schemas import HallTicketCheckRequest, HallTicketOut
from app.auth.security import get_optional_user
from app.adapters.registry import get_adapter
from app.services.document_service import generate_hall_ticket_pdf, generate_pdf_preview, generate_signed_token
from app.services.audit_service import log_audit_event
from app.config import settings

router = APIRouter(prefix="/api/hall-tickets", tags=["Hall Ticket Download Engine"])

@router.post("/check", response_model=HallTicketOut)
async def check_and_retrieve_hall_ticket(
    req: HallTicketCheckRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
    user: Optional[User] = Depends(get_optional_user)
):
    stmt = select(Examination).options(selectinload(Examination.organization)).where(Examination.id == req.examination_id)
    exam = (await db.execute(stmt)).scalar_one_or_none()
    if not exam:
        raise HTTPException(status_code=404, detail="Examination not found")

    app_num = req.application_number.strip()
    adapter = get_adapter(exam.organization.code if exam.organization else "GENERIC")

    retrieval = adapter.retrieve_hall_ticket(
        exam_code=exam.code,
        application_number=app_num,
        date_of_birth=req.date_of_birth
    )

    if not retrieval.get("is_available"):
        raise HTTPException(
            status_code=404,
            detail=f"Hall ticket not released or details not found for {app_num}. Check portal: {exam.organization.hall_ticket_portal_url}"
        )

    # Generate the authentic e-Admit Card PDF
    pdf_filename = f"hallticket_{exam.code}_{app_num}.pdf"
    pdf_path = os.path.join(settings.STORAGE_DIR, "documents", pdf_filename)
    preview_filename = f"hallticket_{exam.code}_{app_num}.png"
    preview_path = os.path.join(settings.STORAGE_DIR, "previews", preview_filename)

    ticket_data = {
        "id": exam.id,
        "examination_id": exam.id,
        "examination_name": exam.name,
        "organization_name": exam.organization.name if exam.organization else "ExamHub Organization",
        "candidate_name": retrieval.get("candidate_name", "CANDIDATE"),
        "application_number": app_num,
        "roll_number": retrieval.get("roll_number", f"ROLL-{app_num}"),
        "exam_date": retrieval.get("exam_date", "To be announced"),
        "exam_time": retrieval.get("exam_time", "10:00 AM - 01:00 PM"),
        "reporting_time": retrieval.get("reporting_time", "08:30 AM"),
        "exam_center_name": retrieval.get("exam_center_name", "Center Allotted"),
        "exam_center_code": retrieval.get("exam_center_code", "CTR-01"),
        "exam_center_address": retrieval.get("exam_center_address", "Exam Hall Complex, State Center"),
        "instructions": retrieval.get("instructions", [
            "Carry printed e-Admit card and original photo ID.",
            "Report at the center before gate closure time."
        ]),
        "official_portal_url": retrieval.get("official_portal_url") or exam.organization.hall_ticket_portal_url,
        "is_available": True
    }

    if not os.path.exists(pdf_path):
        generate_hall_ticket_pdf(ticket_data, pdf_path)
        generate_pdf_preview(pdf_path, preview_path)

    ticket_data["pdf_download_url"] = f"/api/hall-tickets/{exam.id}/download?app_num={app_num}"

    # Optionally store in student documents if logged in
    doc_id = None
    if user:
        doc_type_res = await db.execute(select(DocumentType).where(DocumentType.code == "HALL_TICKET"))
        doc_type = doc_type_res.scalar_one_or_none()
        doc_type_id = doc_type.id if doc_type else 2

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
                title=f"{exam.name} Hall Ticket",
                original_filename=pdf_filename,
                stored_path=pdf_filename,
                preview_path=preview_filename if os.path.exists(preview_path) else None,
                mime_type="application/pdf",
                file_size=os.path.getsize(pdf_path) if os.path.exists(pdf_path) else 0,
                is_verified=True,
                source="OFFICIAL_PORTAL",
                encrypted_token=token
            )
            db.add(new_doc)
            await db.commit()
            doc_id = new_doc.id
        else:
            doc_id = existing_doc.id

    ticket_data["document_id"] = doc_id

    # Audit log
    client_ip = request.client.host if request.client else "127.0.0.1"
    await log_audit_event(
        db,
        actor_type="USER" if user else "PUBLIC",
        actor_id=user.id if user else None,
        action="DOWNLOAD_HALL_TICKET",
        target_type="EXAMINATION",
        target_id=exam.id,
        details={"app_num": app_num},
        ip_address=client_ip
    )

    return HallTicketOut(**ticket_data)

@router.get("/{exam_id}/download")
async def download_admit_card_pdf(exam_id: int, app_num: str, db: AsyncSession = Depends(get_db)):
    stmt = select(Examination).where(Examination.id == exam_id)
    exam = (await db.execute(stmt)).scalar_one_or_none()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")

    pdf_filename = f"hallticket_{exam.code}_{app_num.strip()}.pdf"
    file_path = os.path.join(settings.STORAGE_DIR, "documents", pdf_filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Admit card document not generated or missing")

    return FileResponse(file_path, media_type="application/pdf", filename=f"AdmitCard_{exam.code}_{app_num}.pdf")
