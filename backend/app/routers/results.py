import os
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from sqlalchemy.orm import selectinload
from typing import Optional, List
from app.database import get_db
from app.models.models import (
    Examination, ExamResult, StudentResultRequest, StudentDocument,
    ResultDocument, DocumentType, User
)
from app.schemas.schemas import ResultCheckRequest, ExamResultOut
from app.auth.security import get_optional_user, get_current_user
from app.adapters.registry import get_adapter
from app.services.document_service import generate_scorecard_pdf, generate_pdf_preview, generate_signed_token
from app.services.audit_service import log_audit_event
from app.config import settings
from app.services.durable_files import persist_local_file, read_stored_file
from datetime import datetime, timezone

router = APIRouter(prefix="/api/results", tags=["Result Checking Engine"])

@router.post("/check", response_model=ExamResultOut)
async def check_result(
    req: ResultCheckRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
    user: Optional[User] = Depends(get_optional_user)
):
    # 1. Fetch examination and organization
    stmt = select(Examination).options(selectinload(Examination.organization)).where(Examination.id == req.examination_id)
    res = await db.execute(stmt)
    exam = res.scalar_one_or_none()
    if not exam:
        raise HTTPException(status_code=404, detail="Selected examination not found")

    roll_clean = req.roll_number.strip()
    
    # 2. Check if result is already officially stored in the database
    res_stmt = select(ExamResult).where(
        ExamResult.examination_id == exam.id,
        ExamResult.student_identifier_roll == roll_clean
    )
    existing_result = (await db.execute(res_stmt)).scalar_one_or_none()

    result_data = None
    if existing_result:
        result_data = {
            "id": existing_result.id,
            "examination_id": exam.id,
            "examination_name": exam.name,
            "organization_name": exam.organization.name if exam.organization else None,
            "student_identifier_roll": existing_result.student_identifier_roll,
            "student_identifier_reg": existing_result.student_identifier_reg,
            "student_name": existing_result.student_name,
            "date_of_birth": existing_result.date_of_birth,
            "subject_marks": existing_result.subject_marks or {},
            "marks_obtained": existing_result.marks_obtained,
            "max_marks": existing_result.max_marks,
            "percentage": existing_result.percentage,
            "grade": existing_result.grade,
            "rank": existing_result.rank,
            "qualifying_status": existing_result.qualifying_status,
            "scorecard_path": f"/api/results/{existing_result.id}/download" if existing_result.scorecard_path else None,
            "is_official": existing_result.is_official,
            "result_status": existing_result.result_status,
            "published_date": existing_result.published_date,
            "official_source_url": exam.organization.result_portal_url if exam.organization else None,
            "has_scorecard": bool(existing_result.scorecard_path)
        }
        db_record = existing_result
    else:
        # 3. Retrieve through authorized modular adapter
        adapter = get_adapter(exam.organization.code if exam.organization else "GENERIC")
        retrieval = adapter.retrieve_result(
            exam_code=exam.code,
            roll_number=roll_clean,
            registration_number=req.registration_number,
            date_of_birth=req.date_of_birth
        )

        if not retrieval.get("is_retrieved"):
            raise HTTPException(
                status_code=404,
                detail=f"Result not found for Roll Number {roll_clean}. Please verify the credentials or visit the official portal: {exam.organization.result_portal_url}"
            )

        # Persist the verified official result
        db_record = ExamResult(
            examination_id=exam.id,
            student_identifier_roll=roll_clean,
            student_identifier_reg=retrieval.get("registration_number"),
            student_name=retrieval.get("student_name", "CANDIDATE"),
            date_of_birth=req.date_of_birth,
            subject_marks=retrieval.get("subject_marks", {}),
            marks_obtained=retrieval.get("marks_obtained"),
            max_marks=retrieval.get("max_marks"),
            percentage=retrieval.get("percentage"),
            grade=retrieval.get("grade"),
            rank=retrieval.get("rank"),
            qualifying_status=retrieval.get("qualifying_status", "QUALIFIED"),
            is_official=True,
            result_status="AVAILABLE",
            published_date=datetime.now(timezone.utc)
        )
        db.add(db_record)
        await db.flush()

        result_data = {
            "id": db_record.id,
            "examination_id": exam.id,
            "examination_name": exam.name,
            "organization_name": exam.organization.name if exam.organization else None,
            "student_identifier_roll": db_record.student_identifier_roll,
            "student_identifier_reg": db_record.student_identifier_reg,
            "student_name": db_record.student_name,
            "date_of_birth": db_record.date_of_birth,
            "subject_marks": db_record.subject_marks or {},
            "marks_obtained": db_record.marks_obtained,
            "max_marks": db_record.max_marks,
            "percentage": db_record.percentage,
            "grade": db_record.grade,
            "rank": db_record.rank,
            "qualifying_status": db_record.qualifying_status,
            "scorecard_path": None,
            "is_official": True,
            "result_status": "AVAILABLE",
            "published_date": db_record.published_date,
            "official_source_url": retrieval.get("official_source_url") or (exam.organization.result_portal_url if exam.organization else None),
            "has_scorecard": False
        }

    # 4. Generate official scorecard PDF if not present
    pdf_filename = f"scorecard_{exam.code}_{roll_clean}.pdf"
    pdf_dir = os.path.join(settings.STORAGE_DIR, "documents")
    pdf_path = os.path.join(pdf_dir, pdf_filename)
    preview_dir = os.path.join(settings.STORAGE_DIR, "previews")
    preview_path = os.path.join(preview_dir, f"scorecard_{exam.code}_{roll_clean}.png")

    if not os.path.exists(pdf_path):
        generate_scorecard_pdf(
            student_name=result_data["student_name"],
            roll_number=result_data["student_identifier_roll"],
            exam_name=exam.name,
            org_name=exam.organization.name if exam.organization else "ExamHub Board",
            subject_marks=result_data["subject_marks"],
            total_marks=result_data["marks_obtained"] or 0,
            max_marks=result_data["max_marks"] or 100,
            percentage=result_data["percentage"] or 0.0,
            rank=result_data["rank"] or "",
            qualifying_status=result_data["qualifying_status"],
            output_path=pdf_path
        )
        generate_pdf_preview(pdf_path, preview_path)

    scorecard_ref = await persist_local_file(pdf_path, f"generated-scorecards/{pdf_filename}", "application/pdf")
    preview_ref = None
    if os.path.exists(preview_path):
        preview_ref = await persist_local_file(preview_path, f"generated-scorecards/{os.path.basename(preview_path)}", "image/png")

    db_record.scorecard_path = scorecard_ref
    await db.commit()

    result_data["has_scorecard"] = True
    result_data["scorecard_path"] = pdf_filename

    # 5. If user is logged in, optionally save in their document library
    doc_id = None
    if user:
        # Check if already added to this user's personal documents
        doc_type_res = await db.execute(select(DocumentType).where(DocumentType.code == "RESULT_SCORECARD"))
        doc_type = doc_type_res.scalar_one_or_none()
        doc_type_id = doc_type.id if doc_type else 1

        existing_doc_res = await db.execute(
            select(StudentDocument).where(
                StudentDocument.user_id == user.id,
                StudentDocument.original_filename == pdf_filename,
                StudentDocument.deleted_at.is_(None)
            )
        )
        existing_doc = existing_doc_res.scalar_one_or_none()
        if not existing_doc:
            doc_token = generate_signed_token()
            new_doc = StudentDocument(
                user_id=user.id,
                document_type_id=doc_type_id,
                title=f"{exam.name} Official Scorecard",
                original_filename=pdf_filename,
                stored_path=scorecard_ref,
                preview_path=preview_ref,
                mime_type="application/pdf",
                file_size=os.path.getsize(pdf_path) if os.path.exists(pdf_path) else 0,
                is_verified=True,
                source="OFFICIAL_PORTAL",
                encrypted_token=doc_token
            )
            db.add(new_doc)
            await db.flush()
            # Link ResultDocument
            db.add(ResultDocument(exam_result_id=db_record.id, document_id=new_doc.id, is_official_scorecard=True))
            await db.commit()
            doc_id = new_doc.id
        else:
            doc_id = existing_doc.id

        # Log student result request history
        req_entry = StudentResultRequest(
            user_id=user.id,
            examination_id=exam.id,
            roll_number=roll_clean,
            registration_number=req.registration_number,
            date_of_birth=req.date_of_birth,
            status="COMPLETED",
            result_id=db_record.id
        )
        db.add(req_entry)
        await db.commit()

    result_data["document_id"] = doc_id

    # Audit log
    client_ip = request.client.host if request.client else "127.0.0.1"
    await log_audit_event(
        db,
        actor_type="USER" if user else "PUBLIC",
        actor_id=user.id if user else None,
        action="CHECK_RESULT",
        target_type="EXAM_RESULT",
        target_id=db_record.id,
        details={"exam": exam.name, "roll": roll_clean},
        ip_address=client_ip
    )

    return ExamResultOut(**result_data)

@router.get("/{result_id}", response_model=ExamResultOut)
async def get_result_by_id(result_id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(ExamResult).options(
        selectinload(ExamResult.examination).selectinload(Examination.organization)
    ).where(ExamResult.id == result_id)
    res = await db.execute(stmt)
    result = res.scalar_one_or_none()
    if not result:
        raise HTTPException(status_code=404, detail="Result not found")

    exam = result.examination
    return ExamResultOut(
        id=result.id,
        examination_id=exam.id,
        examination_name=exam.name,
        organization_name=exam.organization.name if exam.organization else None,
        student_identifier_roll=result.student_identifier_roll,
        student_identifier_reg=result.student_identifier_reg,
        student_name=result.student_name,
        date_of_birth=result.date_of_birth,
        subject_marks=result.subject_marks or {},
        marks_obtained=result.marks_obtained,
        max_marks=result.max_marks,
        percentage=result.percentage,
        grade=result.grade,
        rank=result.rank,
        qualifying_status=result.qualifying_status,
        scorecard_path=f"/api/results/{result.id}/download" if result.scorecard_path else None,
        is_official=result.is_official,
        result_status=result.result_status,
        published_date=result.published_date,
        official_source_url=exam.organization.result_portal_url if exam.organization else None,
        has_scorecard=bool(result.scorecard_path)
    )

@router.get("/{result_id}/download")
async def download_result_scorecard(result_id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(ExamResult).where(ExamResult.id == result_id)
    result = (await db.execute(stmt)).scalar_one_or_none()
    if not result or not result.scorecard_path:
        raise HTTPException(status_code=404, detail="Scorecard file not found")

    try:
        file_bytes = await read_stored_file(result.scorecard_path, legacy_path=os.path.join("documents", result.scorecard_path))
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Scorecard file missing from storage")

    return Response(
        content=file_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="Scorecard_{result.student_identifier_roll}.pdf"', "X-Content-Type-Options": "nosniff"}
    )
