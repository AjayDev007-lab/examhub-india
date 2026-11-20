from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, desc
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone

from app.database import get_db
from app.models.models import Organization, OrganizationCategory, State, AdminUser, IntegrationLog
from app.schemas.schemas import (
    OrganizationOut, OrganizationCreate, OrganizationUpdate,
    ConnectivityTestRequest, ConnectivityTestResponse,
    ApprovalUpdateRequest, IntegrationLogOut, StudentInstitutionStatusOut
)
from app.auth.security import get_current_admin, require_role
from app.services.crypto_service import encrypt_secret, decrypt_secret, mask_secret
from app.services.connectivity_service import test_institution_connectivity
from app.services.audit_service import log_audit_event

router = APIRouter(prefix="/api/admin/institutions", tags=["Admin Institution Integrations"])
public_router = APIRouter(prefix="/api/institutions", tags=["Institution Public Integrations"])

def _format_org_out(org: Organization) -> OrganizationOut:
    has_creds = bool(org.encrypted_credentials)
    masked = None
    if has_creds:
        dec = decrypt_secret(org.encrypted_credentials)
        masked = mask_secret(dec)

    return OrganizationOut(
        id=org.id,
        name=org.name,
        code=org.code,
        category_id=org.category_id,
        state_id=org.state_id,
        official_website=org.official_website,
        result_portal_url=org.result_portal_url,
        hall_ticket_portal_url=org.hall_ticket_portal_url,
        id_card_portal_url=org.id_card_portal_url,
        contact_email=org.contact_email,
        contact_phone=org.contact_phone,
        integration_methods=org.integration_methods or [],
        verification_status=org.verification_status,
        supports_results=org.supports_results if org.supports_results is not None else True,
        supports_hall_tickets=org.supports_hall_tickets if org.supports_hall_tickets is not None else True,
        supports_id_cards=org.supports_id_cards if org.supports_id_cards is not None else True,
        results_retrieval_mode=org.results_retrieval_mode or "OFFICIAL_REDIRECT",
        hall_tickets_retrieval_mode=org.hall_tickets_retrieval_mode or "OFFICIAL_REDIRECT",
        id_cards_retrieval_mode=org.id_cards_retrieval_mode or "INSTITUTION_INTEGRATION",
        approval_status=org.approval_status or "APPROVED",
        approved_by=org.approved_by,
        approved_at=org.approved_at,
        api_endpoint_url=org.api_endpoint_url,
        auth_method=org.auth_method or "NONE",
        has_api_credentials=has_creds,
        masked_credentials=masked,
        health_status=org.health_status or "HEALTHY",
        last_latency_ms=org.last_latency_ms or 0,
        last_tested_at=org.last_tested_at,
        error_count=org.error_count or 0,
        last_checked_at=org.last_checked_at,
        is_active=org.is_active
    )

@router.get("", response_model=List[OrganizationOut])
async def list_institution_integrations(
    query: Optional[str] = None,
    category_id: Optional[int] = None,
    approval_status: Optional[str] = None,
    health_status: Optional[str] = None,
    is_active: Optional[bool] = None,
    limit: int = 100,
    offset: int = 0,
    admin: AdminUser = Depends(require_role(["SUPER_ADMIN", "ADMIN", "SUPPORT_STAFF"])),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Organization).where(Organization.deleted_at.is_(None))
    if query:
        q = f"%{query.strip()}%"
        stmt = stmt.where(or_(Organization.name.ilike(q), Organization.code.ilike(q)))
    if category_id:
        stmt = stmt.where(Organization.category_id == category_id)
    if approval_status:
        stmt = stmt.where(Organization.approval_status == approval_status)
    if health_status:
        stmt = stmt.where(Organization.health_status == health_status)
    if is_active is not None:
        stmt = stmt.where(Organization.is_active == is_active)

    stmt = stmt.order_by(Organization.name.asc()).limit(limit).offset(offset)
    res = await db.execute(stmt)
    orgs = res.scalars().all()
    return [_format_org_out(o) for o in orgs]

@router.post("", response_model=OrganizationOut, status_code=status.HTTP_201_CREATED)
async def create_institution_integration(
    req: OrganizationCreate,
    request: Request,
    admin: AdminUser = Depends(require_role(["SUPER_ADMIN", "ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    # Verify code uniqueness
    code_clean = req.code.strip().upper()
    existing = (await db.execute(select(Organization).where(Organization.code == code_clean, Organization.deleted_at.is_(None)))).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail=f"An active institution with code '{code_clean}' already exists")

    # Encrypt credentials if provided
    encrypted_secret = None
    if req.api_credentials:
        encrypted_secret = encrypt_secret(req.api_credentials.strip())

    approval = req.approval_status
    approved_by = admin.id if approval == "APPROVED" else None
    approved_at = datetime.now(timezone.utc) if approval == "APPROVED" else None

    org = Organization(
        name=req.name.strip(),
        code=code_clean,
        category_id=req.category_id,
        state_id=req.state_id,
        official_website=req.official_website.strip(),
        result_portal_url=req.result_portal_url.strip() if req.result_portal_url else None,
        hall_ticket_portal_url=req.hall_ticket_portal_url.strip() if req.hall_ticket_portal_url else None,
        id_card_portal_url=req.id_card_portal_url.strip() if req.id_card_portal_url else None,
        contact_email=req.contact_email.strip() if req.contact_email else None,
        contact_phone=req.contact_phone.strip() if req.contact_phone else None,
        integration_methods=req.integration_methods or ["OFFICIAL_REDIRECT"],
        verification_status=req.verification_status or "VERIFIED",
        supports_results=req.supports_results,
        supports_hall_tickets=req.supports_hall_tickets,
        supports_id_cards=req.supports_id_cards,
        results_retrieval_mode=req.results_retrieval_mode,
        hall_tickets_retrieval_mode=req.hall_tickets_retrieval_mode,
        id_cards_retrieval_mode=req.id_cards_retrieval_mode,
        approval_status=approval,
        approved_by=approved_by,
        approved_at=approved_at,
        api_endpoint_url=req.api_endpoint_url.strip() if req.api_endpoint_url else None,
        auth_method=req.auth_method or "NONE",
        encrypted_credentials=encrypted_secret,
        health_status="UNTESTED",
        is_active=True
    )
    db.add(org)
    await db.commit()
    await db.refresh(org)

    client_ip = request.client.host if request.client else "127.0.0.1"
    await log_audit_event(
        db,
        actor_type="ADMIN",
        actor_id=admin.id,
        action="INSTITUTION_REGISTERED",
        target_type="ORGANIZATION",
        target_id=org.id,
        details={"code": org.code, "name": org.name, "approval": approval},
        ip_address=client_ip
    )

    return _format_org_out(org)

@router.get("/{id}", response_model=OrganizationOut)
async def get_institution_integration(
    id: int,
    admin: AdminUser = Depends(require_role(["SUPER_ADMIN", "ADMIN", "SUPPORT_STAFF"])),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Organization).where(Organization.id == id, Organization.deleted_at.is_(None))
    org = (await db.execute(stmt)).scalar_one_or_none()
    if not org:
        raise HTTPException(status_code=404, detail="Institution not found")
    return _format_org_out(org)

@router.put("/{id}", response_model=OrganizationOut)
async def update_institution_integration(
    id: int,
    req: OrganizationUpdate,
    request: Request,
    admin: AdminUser = Depends(require_role(["SUPER_ADMIN", "ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Organization).where(Organization.id == id, Organization.deleted_at.is_(None))
    org = (await db.execute(stmt)).scalar_one_or_none()
    if not org:
        raise HTTPException(status_code=404, detail="Institution not found")

    if req.name is not None:
        org.name = req.name.strip()
    if req.code is not None:
        new_code = req.code.strip().upper()
        if new_code != org.code:
            existing = (await db.execute(select(Organization).where(Organization.code == new_code, Organization.id != id))).scalar_one_or_none()
            if existing:
                raise HTTPException(status_code=400, detail=f"Code '{new_code}' already exists")
            org.code = new_code
    if req.category_id is not None:
        org.category_id = req.category_id
    if req.state_id is not None:
        org.state_id = req.state_id
    if req.official_website is not None:
        org.official_website = req.official_website.strip()
    if req.result_portal_url is not None:
        org.result_portal_url = req.result_portal_url.strip() if req.result_portal_url else None
    if req.hall_ticket_portal_url is not None:
        org.hall_ticket_portal_url = req.hall_ticket_portal_url.strip() if req.hall_ticket_portal_url else None
    if req.id_card_portal_url is not None:
        org.id_card_portal_url = req.id_card_portal_url.strip() if req.id_card_portal_url else None
    if req.contact_email is not None:
        org.contact_email = req.contact_email.strip() if req.contact_email else None
    if req.contact_phone is not None:
        org.contact_phone = req.contact_phone.strip() if req.contact_phone else None
    if req.integration_methods is not None:
        org.integration_methods = req.integration_methods
    if req.verification_status is not None:
        org.verification_status = req.verification_status
    if req.supports_results is not None:
        org.supports_results = req.supports_results
    if req.supports_hall_tickets is not None:
        org.supports_hall_tickets = req.supports_hall_tickets
    if req.supports_id_cards is not None:
        org.supports_id_cards = req.supports_id_cards
    if req.results_retrieval_mode is not None:
        org.results_retrieval_mode = req.results_retrieval_mode
    if req.hall_tickets_retrieval_mode is not None:
        org.hall_tickets_retrieval_mode = req.hall_tickets_retrieval_mode
    if req.id_cards_retrieval_mode is not None:
        org.id_cards_retrieval_mode = req.id_cards_retrieval_mode
    if req.approval_status is not None:
        org.approval_status = req.approval_status
        if req.approval_status == "APPROVED" and not org.approved_at:
            org.approved_by = admin.id
            org.approved_at = datetime.now(timezone.utc)
    if req.api_endpoint_url is not None:
        org.api_endpoint_url = req.api_endpoint_url.strip() if req.api_endpoint_url else None
    if req.auth_method is not None:
        org.auth_method = req.auth_method
    if req.api_credentials is not None:
        if req.api_credentials.strip():
            org.encrypted_credentials = encrypt_secret(req.api_credentials.strip())
        else:
            org.encrypted_credentials = None
    if req.is_active is not None:
        org.is_active = req.is_active

    org.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(org)

    client_ip = request.client.host if request.client else "127.0.0.1"
    await log_audit_event(
        db,
        actor_type="ADMIN",
        actor_id=admin.id,
        action="INSTITUTION_UPDATED",
        target_type="ORGANIZATION",
        target_id=org.id,
        details={"code": org.code},
        ip_address=client_ip
    )

    return _format_org_out(org)

@router.delete("/{id}")
async def delete_institution_integration(
    id: int,
    request: Request,
    admin: AdminUser = Depends(require_role(["SUPER_ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Organization).where(Organization.id == id, Organization.deleted_at.is_(None))
    org = (await db.execute(stmt)).scalar_one_or_none()
    if not org:
        raise HTTPException(status_code=404, detail="Institution not found")

    org.deleted_at = datetime.now(timezone.utc)
    org.is_active = False
    await db.commit()

    client_ip = request.client.host if request.client else "127.0.0.1"
    await log_audit_event(
        db,
        actor_type="ADMIN",
        actor_id=admin.id,
        action="INSTITUTION_DELETED",
        target_type="ORGANIZATION",
        target_id=org.id,
        details={"code": org.code},
        ip_address=client_ip
    )

    return {"message": f"Institution '{org.name}' successfully deleted", "id": id}

@router.put("/{id}/approval", response_model=OrganizationOut)
async def update_institution_approval(
    id: int,
    req: ApprovalUpdateRequest,
    request: Request,
    admin: AdminUser = Depends(require_role(["SUPER_ADMIN", "ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Organization).where(Organization.id == id, Organization.deleted_at.is_(None))
    org = (await db.execute(stmt)).scalar_one_or_none()
    if not org:
        raise HTTPException(status_code=404, detail="Institution not found")

    status_upper = req.approval_status.upper().strip()
    if status_upper not in ("APPROVED", "REJECTED", "PENDING_APPROVAL"):
        raise HTTPException(status_code=400, detail="Invalid approval status")

    org.approval_status = status_upper
    if status_upper == "APPROVED":
        org.approved_by = admin.id
        org.approved_at = datetime.now(timezone.utc)
    elif status_upper == "REJECTED":
        org.approved_by = None
        org.approved_at = None

    await db.commit()
    await db.refresh(org)

    client_ip = request.client.host if request.client else "127.0.0.1"
    await log_audit_event(
        db,
        actor_type="ADMIN",
        actor_id=admin.id,
        action=f"INSTITUTION_APPROVAL_{status_upper}",
        target_type="ORGANIZATION",
        target_id=org.id,
        details={"new_status": status_upper, "reason": req.reason},
        ip_address=client_ip
    )

    return _format_org_out(org)

@router.put("/{id}/toggle-active", response_model=OrganizationOut)
async def toggle_institution_active(
    id: int,
    admin: AdminUser = Depends(require_role(["SUPER_ADMIN", "ADMIN"])),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Organization).where(Organization.id == id, Organization.deleted_at.is_(None))
    org = (await db.execute(stmt)).scalar_one_or_none()
    if not org:
        raise HTTPException(status_code=404, detail="Institution not found")

    org.is_active = not org.is_active
    await db.commit()
    await db.refresh(org)
    return _format_org_out(org)

@router.post("/{id}/test-connection", response_model=ConnectivityTestResponse)
async def test_institution_connection(
    id: int,
    req: Optional[ConnectivityTestRequest] = None,
    admin: AdminUser = Depends(require_role(["SUPER_ADMIN", "ADMIN", "SUPPORT_STAFF"])),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Organization).where(Organization.id == id, Organization.deleted_at.is_(None))
    org = (await db.execute(stmt)).scalar_one_or_none()
    if not org:
        raise HTTPException(status_code=404, detail="Institution not found")

    # Determine target URL
    target_url = None
    if req and req.target_url:
        target_url = req.target_url.strip()
    elif req and req.use_api_endpoint and org.api_endpoint_url:
        target_url = org.api_endpoint_url.strip()
    else:
        target_url = org.official_website.strip()

    # Formulate headers with authorized credentials if configured
    custom_headers = {}
    if org.encrypted_credentials:
        decrypted = decrypt_secret(org.encrypted_credentials)
        if decrypted:
            if org.auth_method == "API_KEY":
                custom_headers["X-API-Key"] = decrypted
            elif org.auth_method == "BEARER_TOKEN":
                custom_headers["Authorization"] = f"Bearer {decrypted}"

    test_res = await test_institution_connectivity(
        target_url=target_url,
        db=db,
        org_id=org.id,
        admin_id=admin.id,
        custom_headers=custom_headers if custom_headers else None
    )

    return ConnectivityTestResponse(
        success=test_res["success"],
        status_code=test_res["status_code"],
        latency_ms=test_res["latency_ms"],
        health_status=test_res["health_status"],
        message=test_res["message"],
        tested_url=test_res["tested_url"],
        tested_at=test_res["tested_at"]
    )

@router.get("/{id}/logs", response_model=List[IntegrationLogOut])
async def get_institution_integration_logs(
    id: int,
    limit: int = 50,
    admin: AdminUser = Depends(require_role(["SUPER_ADMIN", "ADMIN", "SUPPORT_STAFF"])),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(IntegrationLog).where(
        IntegrationLog.organization_id == id
    ).order_by(desc(IntegrationLog.created_at)).limit(limit)
    res = await db.execute(stmt)
    logs = res.scalars().all()
    return logs

# ================= PUBLIC STUDENT TRANSPARENCY ENDPOINT =================
@public_router.get("/{id}/integration-status", response_model=StudentInstitutionStatusOut)
async def get_student_institution_status(
    id: int,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Organization).where(Organization.id == id, Organization.deleted_at.is_(None), Organization.is_active == True)
    org = (await db.execute(stmt)).scalar_one_or_none()
    if not org:
        raise HTTPException(status_code=404, detail="Institution not found or inactive")

    return StudentInstitutionStatusOut(
        id=org.id,
        name=org.name,
        code=org.code,
        supports_results=org.supports_results if org.supports_results is not None else True,
        results_retrieval_mode=org.results_retrieval_mode or "OFFICIAL_REDIRECT",
        supports_hall_tickets=org.supports_hall_tickets if org.supports_hall_tickets is not None else True,
        hall_tickets_retrieval_mode=org.hall_tickets_retrieval_mode or "OFFICIAL_REDIRECT",
        supports_id_cards=org.supports_id_cards if org.supports_id_cards is not None else True,
        id_cards_retrieval_mode=org.id_cards_retrieval_mode or "INSTITUTION_INTEGRATION",
        health_status=org.health_status or "HEALTHY",
        verification_status=org.verification_status
    )
