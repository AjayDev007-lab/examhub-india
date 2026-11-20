import os
import secrets
import datetime
import pymupdf as fitz
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.config import settings
from app.models.models import StudentDocument, DocumentDownload, User

def generate_signed_token() -> str:
    """Generates an unguessable 64-hex token for short-lived document access."""
    return secrets.token_hex(32)

def validate_file_content(content: bytes, filename: str) -> str:
    """Validates file signature, magic numbers, and size limit."""
    if len(content) > settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_MB} MB"
        )
    
    # Check Magic numbers
    if content.startswith(b"%PDF-"):
        return "application/pdf"
    elif content.startswith(b"\xff\xd8\xff"):
        return "image/jpeg"
    elif content.startswith(b"\x89PNG\r\n\x1a\n"):
        return "image/png"
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported or tampered file format. Only legitimate PDF, JPEG, and PNG files are allowed."
        )

def generate_pdf_preview(pdf_path: str, preview_path: str) -> bool:
    """Uses PyMuPDF to render the first page of a PDF as a high-resolution PNG preview image."""
    try:
        doc = fitz.open(pdf_path)
        if len(doc) > 0:
            page = doc[0]
            pix = page.get_pixmap(dpi=150)
            pix.save(preview_path)
            doc.close()
            return True
        doc.close()
    except Exception as e:
        print(f"Failed to generate preview with PyMuPDF: {e}")
    return False

def generate_scorecard_pdf(
    student_name: str,
    roll_number: str,
    exam_name: str,
    org_name: str,
    subject_marks: dict,
    total_marks: float,
    max_marks: float,
    percentage: float,
    rank: str,
    qualifying_status: str,
    output_path: str
) -> str:
    """Generates an official-format PDF scorecard using PyMuPDF."""
    doc = fitz.open()
    page = doc.new_page(width=595, height=842) # A4 format
    
    # Draw Navy Blue Header Band
    header_rect = fitz.Rect(0, 0, 595, 90)
    page.draw_rect(header_rect, color=(0.03, 0.09, 0.16), fill=(0.03, 0.09, 0.16))
    
    # Header Text
    page.insert_text(fitz.Point(40, 40), "EXAMHUB INDIA - OFFICIAL SCORECARD", fontsize=16, color=(1, 1, 1), fontname="helv")
    page.insert_text(fitz.Point(40, 62), f"{org_name.upper()} | {exam_name}", fontsize=11, color=(0.8, 0.9, 1), fontname="helv")
    page.insert_text(fitz.Point(40, 78), f"Issued on: {datetime.datetime.now().strftime('%d %B %Y')} | Verified Digital Record", fontsize=8, color=(0.7, 0.8, 0.9), fontname="helv")
    
    # Watermark (rotate must be multiple of 90: 0, 90, 180, 270)
    page.insert_text(fitz.Point(60, 480), "OFFICIAL VERIFIED SCORECARD", fontsize=30, color=(0.93, 0.95, 0.98), rotate=0)
    
    # Candidate Details Box
    box_rect = fitz.Rect(40, 110, 555, 200)
    page.draw_rect(box_rect, color=(0.8, 0.85, 0.9), width=1)
    
    page.insert_text(fitz.Point(55, 135), f"Candidate Name:  {student_name}", fontsize=12, color=(0.05, 0.1, 0.2), fontname="helv")
    page.insert_text(fitz.Point(55, 155), f"Roll Number:     {roll_number}", fontsize=11, color=(0.1, 0.1, 0.1), fontname="helv")
    page.insert_text(fitz.Point(55, 175), f"Qualifying Status: {qualifying_status}", fontsize=12, color=(0.05, 0.5, 0.2) if qualifying_status in ['QUALIFIED', 'PASS'] else (0.8, 0.1, 0.1), fontname="helv")
    
    page.insert_text(fitz.Point(340, 135), f"Total Marks: {total_marks} / {max_marks}", fontsize=11, fontname="helv")
    page.insert_text(fitz.Point(340, 155), f"Percentage:  {percentage:.2f}%", fontsize=11, fontname="helv")
    if rank:
        page.insert_text(fitz.Point(340, 175), f"All India / Merit Rank: {rank}", fontsize=11, color=(0.1, 0.3, 0.7), fontname="helv")

    # Table of Marks
    y = 235
    page.insert_text(fitz.Point(40, y), "SUBJECT-WISE SCORE BREAKDOWN", fontsize=12, color=(0.03, 0.09, 0.16), fontname="helv")
    y += 15
    table_hdr = fitz.Rect(40, y, 555, y + 25)
    page.draw_rect(table_hdr, color=(0.1, 0.3, 0.6), fill=(0.1, 0.3, 0.6))
    page.insert_text(fitz.Point(55, y + 17), "Subject / Paper", fontsize=10, color=(1, 1, 1), fontname="helv")
    page.insert_text(fitz.Point(440, y + 17), "Marks / Percentile", fontsize=10, color=(1, 1, 1), fontname="helv")
    y += 25

    row_count = 0
    for subj, val in subject_marks.items():
        bg = (0.96, 0.97, 0.99) if row_count % 2 == 0 else (1, 1, 1)
        row_rect = fitz.Rect(40, y, 555, y + 24)
        page.draw_rect(row_rect, color=(0.85, 0.9, 0.95), fill=bg)
        page.insert_text(fitz.Point(55, y + 16), str(subj), fontsize=10, color=(0.1, 0.1, 0.1), fontname="helv")
        page.insert_text(fitz.Point(450, y + 16), str(val), fontsize=10, color=(0.05, 0.2, 0.5), fontname="helv")
        y += 24
        row_count += 1

    # Security verification stamp / Footer
    footer_rect = fitz.Rect(40, 750, 555, 800)
    page.draw_rect(footer_rect, color=(0.9, 0.9, 0.9), fill=(0.98, 0.98, 0.98))
    page.insert_text(fitz.Point(55, 770), "DIGITALLY VERIFIED DOCUMENT - EXAMHUB INDIA ARCHIVE", fontsize=8, color=(0.4, 0.4, 0.4), fontname="helv")
    page.insert_text(fitz.Point(55, 785), "This official verification document was compiled in accordance with published institutional records.", fontsize=7, color=(0.5, 0.5, 0.5), fontname="helv")
    
    doc.save(output_path)
    doc.close()
    return output_path

def generate_hall_ticket_pdf(data: dict, output_path: str) -> str:
    """Generates an official Admit Card / Hall Ticket PDF with exam center details, timing, and instructions."""
    doc = fitz.open()
    page = doc.new_page(width=595, height=842)
    
    # Header
    page.draw_rect(fitz.Rect(0, 0, 595, 85), color=(0.05, 0.15, 0.3), fill=(0.05, 0.15, 0.3))
    page.insert_text(fitz.Point(40, 35), "EXAMHUB INDIA - OFFICIAL E-ADMIT CARD", fontsize=15, color=(1, 1, 1), fontname="helv")
    page.insert_text(fitz.Point(40, 55), f"{data.get('organization_name', '')} | {data.get('examination_name', '')}", fontsize=10, color=(0.85, 0.92, 1), fontname="helv")
    page.insert_text(fitz.Point(40, 70), "PROVISIONAL ADMIT CARD FOR WRITTEN / COMPUTER BASED EXAMINATION", fontsize=8, color=(0.7, 0.8, 0.9), fontname="helv")
    
    # Candidate Details
    y = 105
    box = fitz.Rect(40, y, 555, y + 140)
    page.draw_rect(box, color=(0.8, 0.85, 0.9), width=1)
    
    page.insert_text(fitz.Point(55, y + 25), f"Candidate Name:  {data.get('candidate_name')}", fontsize=11, fontname="helv")
    page.insert_text(fitz.Point(55, y + 50), f"Application No:  {data.get('application_number')}", fontsize=11, fontname="helv")
    page.insert_text(fitz.Point(55, y + 75), f"Roll Number:     {data.get('roll_number')}", fontsize=11, fontname="helv")
    page.insert_text(fitz.Point(55, y + 100), f"Date of Exam:    {data.get('exam_date')}", fontsize=11, color=(0.1, 0.4, 0.1), fontname="helv")
    page.insert_text(fitz.Point(55, y + 125), f"Timing:          {data.get('exam_time')}", fontsize=11, fontname="helv")
    
    page.insert_text(fitz.Point(340, y + 25), f"Reporting Time:  {data.get('reporting_time')}", fontsize=11, color=(0.7, 0.1, 0.1), fontname="helv")
    page.insert_text(fitz.Point(340, y + 50), f"Center Code:     {data.get('exam_center_code')}", fontsize=11, fontname="helv")
    page.insert_text(fitz.Point(340, y + 75), "Center Details:", fontsize=11, fontname="helv")
    page.insert_textbox(fitz.Rect(340, y + 80, 545, y + 135), f"{data.get('exam_center_name')}\n{data.get('exam_center_address')}", fontsize=9, fontname="helv")

    # Important Instructions
    y = 265
    page.insert_text(fitz.Point(40, y), "IMPORTANT INSTRUCTIONS FOR THE CANDIDATE", fontsize=11, color=(0.05, 0.15, 0.3), fontname="helv")
    y += 15
    for inst in data.get("instructions", []):
        page.insert_text(fitz.Point(50, y), f"• {inst}", fontsize=9, color=(0.2, 0.2, 0.2), fontname="helv")
        y += 18
    
    # Signature / verification
    footer_rect = fitz.Rect(40, 750, 555, 800)
    page.draw_rect(footer_rect, color=(0.9, 0.9, 0.9), fill=(0.97, 0.97, 0.97))
    page.insert_text(fitz.Point(55, 770), "COMPUTER GENERATED SECURE ADMIT CARD - AUTHENTICATED ENTRY DOCUMENT", fontsize=8, color=(0.4, 0.4, 0.4), fontname="helv")
    page.insert_text(fitz.Point(55, 785), "Presented via ExamHub India integration with official institution examination services.", fontsize=7, color=(0.5, 0.5, 0.5), fontname="helv")
    
    doc.save(output_path)
    doc.close()
    return output_path

def generate_id_card_pdf(data: dict, output_path: str) -> str:
    """Generates an institutional student identity document preview PDF."""
    doc = fitz.open()
    page = doc.new_page(width=450, height=300) # ID Card landscape
    
    # Header Banner
    page.draw_rect(fitz.Rect(0, 0, 450, 55), color=(0.05, 0.15, 0.35), fill=(0.05, 0.15, 0.35))
    page.insert_text(fitz.Point(25, 25), data.get('institution_name', 'INSTITUTE OF TECHNOLOGY').upper(), fontsize=12, color=(1, 1, 1), fontname="helv")
    page.insert_text(fitz.Point(25, 42), "STUDENT IDENTITY CARD - AUTHORIZED REPLICA", fontsize=8, color=(0.85, 0.9, 1), fontname="helv")
    
    # Photo placeholder
    photo_box = fitz.Rect(25, 75, 115, 185)
    page.draw_rect(photo_box, color=(0.7, 0.75, 0.8), fill=(0.93, 0.95, 0.98))
    page.insert_text(fitz.Point(40, 135), "PHOTO", fontsize=10, color=(0.5, 0.55, 0.6), fontname="helv")
    
    # Student Details
    page.insert_text(fitz.Point(135, 90), f"Name: {data.get('student_name')}", fontsize=11, fontname="helv")
    page.insert_text(fitz.Point(135, 110), f"Enrollment: {data.get('enrollment_number')}", fontsize=10, fontname="helv")
    page.insert_text(fitz.Point(135, 130), f"Program: {data.get('course_branch')}", fontsize=10, fontname="helv")
    page.insert_text(fitz.Point(135, 150), f"Academic Year: {data.get('academic_year')}", fontsize=10, fontname="helv")
    page.insert_text(fitz.Point(135, 170), f"Valid Upto: {data.get('valid_upto')}", fontsize=10, color=(0.1, 0.5, 0.1), fontname="helv")
    page.insert_text(fitz.Point(135, 190), f"Blood Group: {data.get('blood_group', 'N/A')}", fontsize=10, fontname="helv")
    
    # Footer
    page.draw_rect(fitz.Rect(0, 260, 450, 300), color=(0.95, 0.95, 0.95), fill=(0.95, 0.95, 0.95))
    page.insert_text(fitz.Point(25, 280), "This electronic identity document is issued via verified institutional enrollment records.", fontsize=7, color=(0.5, 0.5, 0.5), fontname="helv")
    
    doc.save(output_path)
    doc.close()
    return output_path
