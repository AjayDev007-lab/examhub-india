from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime

# ================= AUTH SCHEMAS =================
class UserRegister(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    mobile: Optional[str] = Field(None, pattern=r"^[6-9]\d{9}$")
    password: str = Field(..., min_length=8)
    password_confirm: str = Field(..., min_length=8)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class SendOtpRequest(BaseModel):
    mobile: str = Field(..., pattern=r"^[6-9]\d{9}$")
    purpose: str = "LOGIN"

class VerifyOtpRequest(BaseModel):
    mobile: str = Field(..., pattern=r"^[6-9]\d{9}$")
    otp: str = Field(..., min_length=6, max_length=6)

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_type: str = "student"
    user: Dict[str, Any]

class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    email: str
    mobile: Optional[str] = None
    is_active: bool
    is_verified: bool
    mobile_verified: bool
    avatar_url: Optional[str] = None
    created_at: datetime

class AdminLogin(BaseModel):
    email: EmailStr
    password: str

class AdminUserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    email: str
    role_name: str
    is_active: bool
    last_login_at: Optional[datetime] = None
    created_at: datetime

# ================= STATE & ORGANIZATION SCHEMAS =================
class StateOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    code: str
    name: str
    type: str

class OrganizationCategoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    code: str
    name: str
    description: Optional[str] = None

class OrganizationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    code: str
    category_id: int
    state_id: Optional[int] = None
    official_website: str
    result_portal_url: Optional[str] = None
    hall_ticket_portal_url: Optional[str] = None
    id_card_portal_url: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    integration_methods: List[str] = []
    verification_status: str
    supports_results: bool = True
    supports_hall_tickets: bool = True
    supports_id_cards: bool = True
    results_retrieval_mode: str = "OFFICIAL_REDIRECT"
    hall_tickets_retrieval_mode: str = "OFFICIAL_REDIRECT"
    id_cards_retrieval_mode: str = "INSTITUTION_INTEGRATION"
    approval_status: str = "APPROVED"
    approved_by: Optional[int] = None
    approved_at: Optional[datetime] = None
    api_endpoint_url: Optional[str] = None
    auth_method: str = "NONE"
    has_api_credentials: bool = False
    masked_credentials: Optional[str] = None
    health_status: str = "HEALTHY"
    last_latency_ms: int = 0
    last_tested_at: Optional[datetime] = None
    error_count: int = 0
    last_checked_at: Optional[datetime] = None
    is_active: bool

class OrganizationCreate(BaseModel):
    name: str
    code: str
    category_id: int
    state_id: Optional[int] = None
    official_website: str
    result_portal_url: Optional[str] = None
    hall_ticket_portal_url: Optional[str] = None
    id_card_portal_url: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    integration_methods: List[str] = ["OFFICIAL_REDIRECT"]
    verification_status: str = "VERIFIED"
    supports_results: bool = True
    supports_hall_tickets: bool = True
    supports_id_cards: bool = True
    results_retrieval_mode: str = "OFFICIAL_REDIRECT"
    hall_tickets_retrieval_mode: str = "OFFICIAL_REDIRECT"
    id_cards_retrieval_mode: str = "INSTITUTION_INTEGRATION"
    approval_status: str = "APPROVED"
    api_endpoint_url: Optional[str] = None
    auth_method: str = "NONE"
    api_credentials: Optional[str] = None

class OrganizationUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    category_id: Optional[int] = None
    state_id: Optional[int] = None
    official_website: Optional[str] = None
    result_portal_url: Optional[str] = None
    hall_ticket_portal_url: Optional[str] = None
    id_card_portal_url: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    integration_methods: Optional[List[str]] = None
    verification_status: Optional[str] = None
    supports_results: Optional[bool] = None
    supports_hall_tickets: Optional[bool] = None
    supports_id_cards: Optional[bool] = None
    results_retrieval_mode: Optional[str] = None
    hall_tickets_retrieval_mode: Optional[str] = None
    id_cards_retrieval_mode: Optional[str] = None
    approval_status: Optional[str] = None
    api_endpoint_url: Optional[str] = None
    auth_method: Optional[str] = None
    api_credentials: Optional[str] = None
    is_active: Optional[bool] = None

class ConnectivityTestRequest(BaseModel):
    target_url: Optional[str] = None
    use_api_endpoint: bool = False

class ConnectivityTestResponse(BaseModel):
    success: bool
    status_code: int
    latency_ms: int
    health_status: str
    message: str
    tested_url: str
    tested_at: str

class ApprovalUpdateRequest(BaseModel):
    approval_status: str # "APPROVED", "REJECTED", "PENDING_APPROVAL"
    reason: Optional[str] = None

class IntegrationLogOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    organization_id: Optional[int] = None
    action: str
    tested_url: Optional[str] = None
    status_code: int
    is_success: bool
    message: Optional[str] = None
    duration_ms: int
    created_at: datetime

class StudentInstitutionStatusOut(BaseModel):
    id: int
    name: str
    code: str
    supports_results: bool
    results_retrieval_mode: str
    supports_hall_tickets: bool
    hall_tickets_retrieval_mode: str
    supports_id_cards: bool
    id_cards_retrieval_mode: str
    health_status: str
    verification_status: str

# ================= EXAMINATION SCHEMAS =================
class ExamScheduleOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    event_type: str
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    notification_date: Optional[datetime] = None
    hall_ticket_release_date: Optional[datetime] = None
    result_expected_date: Optional[datetime] = None
    status: str

class ExaminationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    organization_id: int
    organization_name: Optional[str] = None
    organization_code: Optional[str] = None
    name: str
    code: str
    exam_type: str
    description: Optional[str] = None
    year: int
    cycle: str
    requires_dob: bool
    requires_captcha: bool
    is_active: bool
    schedules: List[ExamScheduleOut] = []

class ExaminationCreate(BaseModel):
    organization_id: int
    name: str
    code: str
    exam_type: str = "GOVERNMENT"
    description: Optional[str] = None
    year: int
    cycle: str = "Annual"
    requires_dob: bool = True
    requires_captcha: bool = False

# ================= RESULT CHECKING SCHEMAS =================
class ResultCheckRequest(BaseModel):
    examination_id: int
    roll_number: str
    registration_number: Optional[str] = None
    date_of_birth: Optional[str] = None
    save_to_documents: bool = False

class ExamResultOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    examination_id: int
    examination_name: Optional[str] = None
    organization_name: Optional[str] = None
    student_identifier_roll: str
    student_identifier_reg: Optional[str] = None
    student_name: str
    date_of_birth: Optional[str] = None
    subject_marks: Dict[str, Any] = {}
    marks_obtained: Optional[float] = None
    max_marks: Optional[float] = None
    percentage: Optional[float] = None
    grade: Optional[str] = None
    rank: Optional[str] = None
    qualifying_status: str
    scorecard_path: Optional[str] = None
    is_official: bool
    result_status: str
    published_date: Optional[datetime] = None
    official_source_url: Optional[str] = None
    has_scorecard: bool = False
    document_id: Optional[int] = None

# ================= HALL TICKET SCHEMAS =================
class HallTicketCheckRequest(BaseModel):
    examination_id: int
    application_number: str
    date_of_birth: Optional[str] = None
    registered_mobile: Optional[str] = None
    save_to_documents: bool = False

class HallTicketOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    examination_id: int
    examination_name: str
    organization_name: str
    candidate_name: str
    application_number: str
    roll_number: str
    exam_date: str
    exam_time: str
    reporting_time: str
    exam_center_name: str
    exam_center_code: str
    exam_center_address: str
    subject_details: List[Dict[str, str]] = []
    instructions: List[str] = []
    pdf_download_url: Optional[str] = None
    official_portal_url: Optional[str] = None
    is_available: bool = True
    document_id: Optional[int] = None

# ================= STUDENT ID CARD SCHEMAS =================
class IDCardRetrieveRequest(BaseModel):
    organization_id: int
    student_enrollment_no: str
    admission_year: int
    date_of_birth: Optional[str] = None
    save_to_documents: bool = False

class IDCardOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    institution_name: str
    student_name: str
    enrollment_number: str
    course_branch: str
    academic_year: str
    valid_upto: str
    blood_group: Optional[str] = None
    emergency_contact: Optional[str] = None
    is_verified: bool = False
    source: str = "OFFICIAL_PORTAL"
    download_url: Optional[str] = None
    official_portal_url: Optional[str] = None
    document_id: Optional[int] = None

# ================= DOCUMENT MANAGEMENT SCHEMAS =================
class DocumentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    document_type_code: str
    document_type_name: str
    title: str
    original_filename: str
    mime_type: str
    file_size: int
    is_verified: bool
    source: str
    download_url: str
    preview_url: Optional[str] = None
    created_at: datetime

# ================= NOTIFICATIONS & SUPPORT =================
class NotificationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    message: str
    notification_type: str
    priority: str
    is_read: bool
    source_url: Optional[str] = None
    created_at: datetime

class SupportTicketCreate(BaseModel):
    subject: str = Field(..., min_length=5, max_length=200)
    category: str = "RESULT_ISSUE"
    message: str = Field(..., min_length=10)
    priority: str = "MEDIUM"

class SupportTicketOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    subject: str
    category: str
    message: str
    status: str
    priority: str
    admin_response: Optional[str] = None
    created_at: datetime
    updated_at: datetime

# ================= AUDIT & ADMIN SCHEMAS =================
class AuditLogOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    actor_type: str
    actor_id: Optional[int] = None
    action: str
    target_type: Optional[str] = None
    target_id: Optional[int] = None
    details_json: Dict[str, Any] = {}
    ip_address: Optional[str] = None
    created_at: datetime

class DashboardStats(BaseModel):
    total_organizations: int
    total_examinations: int
    total_results_indexed: int
    total_students_registered: int
    active_integrations: int
    recent_announcements: int
