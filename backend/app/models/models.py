import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, DateTime, Float, ForeignKey, JSON, Index, UniqueConstraint
)
from sqlalchemy.orm import relationship
from app.database import Base

def utc_now():
    return datetime.datetime.now(datetime.timezone.utc)

# 1. USERS (Students)
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    mobile = Column(String(20), unique=True, index=True, nullable=True)
    password_hash = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    mobile_verified = Column(Boolean, default=False, nullable=False)
    avatar_url = Column(String(512), nullable=True)
    date_of_birth = Column(String(20), nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)
    deleted_at = Column(DateTime, nullable=True)

    documents = relationship("StudentDocument", back_populates="user", cascade="all, delete-orphan")
    result_requests = relationship("StudentResultRequest", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    preferences = relationship("NotificationPreference", back_populates="user", uselist=False, cascade="all, delete-orphan")
    support_tickets = relationship("SupportTicket", back_populates="user", cascade="all, delete-orphan")
    sessions = relationship("UserSession", back_populates="user", cascade="all, delete-orphan")
    saved_websites = relationship("SavedWebsite", back_populates="user", cascade="all, delete-orphan")

# 2. ADMIN ROLES
class AdminRole(Base):
    __tablename__ = "admin_roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False) # SUPER_ADMIN, ADMIN, FINANCE_ADMIN, SUPPORT_STAFF, INSTITUTION_MANAGER
    description = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    users = relationship("AdminUser", back_populates="role")
    permissions = relationship("AdminPermission", back_populates="role", cascade="all, delete-orphan")

# 3. ADMIN PERMISSIONS
class AdminPermission(Base):
    __tablename__ = "admin_permissions"

    id = Column(Integer, primary_key=True, index=True)
    role_id = Column(Integer, ForeignKey("admin_roles.id", ondelete="CASCADE"), nullable=False)
    permission_name = Column(String(100), nullable=False) # e.g. "exams:write", "results:publish", "users:manage"
    created_at = Column(DateTime, default=utc_now, nullable=False)

    role = relationship("AdminRole", back_populates="permissions")

# 4. ADMIN USERS
class AdminUser(Base):
    __tablename__ = "admin_users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role_id = Column(Integer, ForeignKey("admin_roles.id"), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    last_login_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    role = relationship("AdminRole", back_populates="users")

# 5. STATES (Indian States & UTs)
class State(Base):
    __tablename__ = "states"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(10), unique=True, index=True, nullable=False) # e.g. "DL", "MH", "KA", "TN", "UP"
    name = Column(String(100), nullable=False)
    type = Column(String(20), default="STATE") # "STATE" or "UT"
    is_active = Column(Boolean, default=True)

    organizations = relationship("Organization", back_populates="state")

# 6. ORGANIZATION CATEGORIES
class OrganizationCategory(Base):
    __tablename__ = "organization_categories"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False) # "CENTRAL_GOVT", "STATE_GOVT", "ENTRANCE_BOARD", "CENTRAL_UNIVERSITY", "STATE_UNIVERSITY", "PRIVATE_UNIVERSITY", "AUTONOMOUS_COLLEGE", "RECRUITMENT_BOARD"
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)

    organizations = relationship("Organization", back_populates="category")

# 7. ORGANIZATIONS
class Organization(Base):
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), index=True, nullable=False)
    code = Column(String(50), unique=True, index=True, nullable=False) # "UPSC", "SSC", "NTA", "RRB", "TNPSC", "DU", "VTU", "ANNA_UNIV"
    category_id = Column(Integer, ForeignKey("organization_categories.id"), nullable=False)
    state_id = Column(Integer, ForeignKey("states.id"), nullable=True) # None for Central organizations
    official_website = Column(String(512), nullable=False)
    result_portal_url = Column(String(512), nullable=True)
    hall_ticket_portal_url = Column(String(512), nullable=True)
    id_card_portal_url = Column(String(512), nullable=True)
    contact_email = Column(String(255), nullable=True)
    contact_phone = Column(String(50), nullable=True)
    integration_methods = Column(JSON, default=list) # ["OFFICIAL_API", "STUDENT_PORTAL_SESSION", "OFFICIAL_REDIRECT", "MANUAL_UPLOAD"]
    verification_status = Column(String(50), default="VERIFIED") # "VERIFIED", "PENDING_VERIFICATION", "UNAVAILABLE"
    supports_results = Column(Boolean, default=True)
    supports_hall_tickets = Column(Boolean, default=True)
    supports_id_cards = Column(Boolean, default=True)
    results_retrieval_mode = Column(String(50), default="OFFICIAL_REDIRECT") # "OFFICIAL_API", "INSTITUTION_INTEGRATION", "OFFICIAL_REDIRECT", "MANUAL_UPLOAD"
    hall_tickets_retrieval_mode = Column(String(50), default="OFFICIAL_REDIRECT")
    id_cards_retrieval_mode = Column(String(50), default="INSTITUTION_INTEGRATION")
    approval_status = Column(String(50), default="APPROVED") # "PENDING_APPROVAL", "APPROVED", "REJECTED"
    approved_by = Column(Integer, ForeignKey("admin_users.id"), nullable=True)
    approved_at = Column(DateTime, nullable=True)
    api_endpoint_url = Column(String(512), nullable=True)
    auth_method = Column(String(50), default="NONE") # "NONE", "API_KEY", "BEARER_TOKEN", "OAUTH2", "MUTUAL_TLS"
    encrypted_credentials = Column(Text, nullable=True)
    health_status = Column(String(50), default="HEALTHY") # "HEALTHY", "DEGRADED", "UNREACHABLE", "UNTESTED"
    last_latency_ms = Column(Integer, default=0)
    last_tested_at = Column(DateTime, nullable=True)
    error_count = Column(Integer, default=0)
    deleted_at = Column(DateTime, nullable=True)
    last_checked_at = Column(DateTime, default=utc_now)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    category = relationship("OrganizationCategory", back_populates="organizations")
    state = relationship("State", back_populates="organizations")
    examinations = relationship("Examination", back_populates="organization", cascade="all, delete-orphan")
    portal_integrations = relationship("PortalIntegration", back_populates="organization", cascade="all, delete-orphan")
    integration_logs = relationship("IntegrationLog", back_populates="organization", cascade="all, delete-orphan")

# 8. EXAMINATIONS
class Examination(Base):
    __tablename__ = "examinations"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), index=True, nullable=False) # e.g. "Civil Services Examination", "NEET UG", "JEE Main", "Combined Graduate Level (CGL)"
    code = Column(String(100), index=True, nullable=False)
    exam_type = Column(String(50), default="GOVERNMENT") # "GOVERNMENT", "ENTRANCE", "RECRUITMENT", "UNIVERSITY", "PRIVATE", "SEMESTER"
    description = Column(Text, nullable=True)
    year = Column(Integer, index=True, nullable=False)
    cycle = Column(String(50), default="Annual") # "Annual", "Session 1", "Session 2", "Semester I", "Odd Semester", etc.
    requires_dob = Column(Boolean, default=True)
    requires_captcha = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    organization = relationship("Organization", back_populates="examinations")
    schedules = relationship("ExamSchedule", back_populates="examination", cascade="all, delete-orphan")
    results = relationship("ExamResult", back_populates="examination", cascade="all, delete-orphan")
    result_sources = relationship("ResultSource", back_populates="examination", cascade="all, delete-orphan")
    announcements = relationship("ResultAnnouncement", back_populates="examination", cascade="all, delete-orphan")
    student_requests = relationship("StudentResultRequest", back_populates="examination", cascade="all, delete-orphan")

# 9. EXAM SCHEDULES
class ExamSchedule(Base):
    __tablename__ = "exam_schedules"

    id = Column(Integer, primary_key=True, index=True)
    examination_id = Column(Integer, ForeignKey("examinations.id", ondelete="CASCADE"), nullable=False)
    event_type = Column(String(50), nullable=False) # "EXAM_DATE", "ADMIT_CARD_RELEASE", "RESULT_ANNOUNCEMENT", "APPLICATION_WINDOW"
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    notification_date = Column(DateTime, nullable=True)
    hall_ticket_release_date = Column(DateTime, nullable=True)
    result_expected_date = Column(DateTime, nullable=True)
    status = Column(String(50), default="SCHEDULED") # "SCHEDULED", "ONGOING", "COMPLETED", "POSTPONED"
    created_at = Column(DateTime, default=utc_now)

    examination = relationship("Examination", back_populates="schedules")

# 10. EXAM RESULTS (Official and Verified Results)
class ExamResult(Base):
    __tablename__ = "exam_results"

    id = Column(Integer, primary_key=True, index=True)
    examination_id = Column(Integer, ForeignKey("examinations.id", ondelete="CASCADE"), nullable=False)
    student_identifier_roll = Column(String(100), index=True, nullable=False)
    student_identifier_reg = Column(String(100), index=True, nullable=True)
    student_name = Column(String(255), nullable=False)
    date_of_birth = Column(String(20), nullable=True)
    subject_marks = Column(JSON, default=dict) # e.g. {"Physics": 92, "Chemistry": 88, "Mathematics": 95}
    marks_obtained = Column(Float, nullable=True)
    max_marks = Column(Float, nullable=True)
    percentage = Column(Float, nullable=True)
    grade = Column(String(20), nullable=True)
    rank = Column(String(50), nullable=True)
    qualifying_status = Column(String(50), nullable=False) # "QUALIFIED", "NOT_QUALIFIED", "PASS", "PROMOTED", "WITHHELD"
    scorecard_path = Column(String(512), nullable=True)
    is_official = Column(Boolean, default=True, nullable=False) # True = retrieved directly from official integration
    raw_response = Column(JSON, nullable=True)
    published_date = Column(DateTime, default=utc_now)
    result_status = Column(String(50), default="AVAILABLE") # "ANNOUNCED", "AVAILABLE", "TEMPORARILY_UNAVAILABLE", "PREVIOUS_RESULT", "VERIFICATION_REQUIRED"
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    examination = relationship("Examination", back_populates="results")
    result_documents = relationship("ResultDocument", back_populates="exam_result", cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_exam_roll", "examination_id", "student_identifier_roll"),
    )

# 11. RESULT SOURCES
class ResultSource(Base):
    __tablename__ = "result_sources"

    id = Column(Integer, primary_key=True, index=True)
    examination_id = Column(Integer, ForeignKey("examinations.id", ondelete="CASCADE"), nullable=False)
    source_type = Column(String(50), default="OFFICIAL_PORTAL") # "OFFICIAL_PORTAL", "NIC_SERVICE", "STATE_PORTAL", "UNIVERSITY_ERP"
    source_url = Column(String(512), nullable=False)
    verified_by_admin = Column(Boolean, default=True)
    last_verified_at = Column(DateTime, default=utc_now)
    is_trusted = Column(Boolean, default=True)

    examination = relationship("Examination", back_populates="result_sources")

# 12. RESULT INTEGRATIONS
class ResultIntegration(Base):
    __tablename__ = "result_integrations"

    id = Column(Integer, primary_key=True, index=True)
    examination_id = Column(Integer, ForeignKey("examinations.id", ondelete="CASCADE"), nullable=False)
    adapter_key = Column(String(100), nullable=False) # e.g. "UPSCAdapter", "NTAAdapter", "TNPSCAdapter", "UniversityAdapter"
    endpoint_url = Column(String(512), nullable=True)
    auth_type = Column(String(50), default="PUBLIC_AUTHENTICATED")
    status = Column(String(50), default="ACTIVE") # "ACTIVE", "DEGRADED", "OFFLINE", "REDIRECT_ONLY"
    last_success_at = Column(DateTime, nullable=True)
    error_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=utc_now)

# 13. RESULT ANNOUNCEMENTS
class ResultAnnouncement(Base):
    __tablename__ = "result_announcements"

    id = Column(Integer, primary_key=True, index=True)
    examination_id = Column(Integer, ForeignKey("examinations.id", ondelete="CASCADE"), nullable=True)
    title = Column(String(255), nullable=False)
    announcement_type = Column(String(50), default="RESULT_DECLARED") # "RESULT_DECLARED", "HALL_TICKET_RELEASED", "TIMETABLE_OUT", "REVALUATION_OUT", "OFFICIAL_CIRCULAR"
    circular_url = Column(String(512), nullable=True)
    circular_date = Column(DateTime, default=utc_now)
    is_verified = Column(Boolean, default=True)
    announcement_text = Column(Text, nullable=False)
    source_portal = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=utc_now)

    examination = relationship("Examination", back_populates="announcements")

# 14. PORTAL INTEGRATIONS
class PortalIntegration(Base):
    __tablename__ = "portal_integrations"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    adapter_name = Column(String(100), nullable=False) # "UPSCAdapter", "SSCAdapter", "RRBAdapter", etc.
    integration_type = Column(String(50), default="AUTOMATED_API") # "AUTOMATED_API", "STUDENT_SESSION", "OFFICIAL_REDIRECT"
    status = Column(String(50), default="OPERATIONAL") # "OPERATIONAL", "MAINTENANCE", "DEPRECATED", "DOWN"
    config_json = Column(JSON, default=dict)
    health_status = Column(String(50), default="HEALTHY")
    last_checked_at = Column(DateTime, default=utc_now)
    created_at = Column(DateTime, default=utc_now)

    organization = relationship("Organization", back_populates="portal_integrations")
    logs = relationship("IntegrationLog", back_populates="portal_integration", cascade="all, delete-orphan")

# 15. INTEGRATION LOGS
class IntegrationLog(Base):
    __tablename__ = "integration_logs"

    id = Column(Integer, primary_key=True, index=True)
    portal_integration_id = Column(Integer, ForeignKey("portal_integrations.id", ondelete="CASCADE"), nullable=True)
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=True, index=True)
    action = Column(String(100), nullable=False) # "CONNECTIVITY_TEST", "CHECK_RESULT", "DOWNLOAD_HALL_TICKET", "VERIFY_PORTAL"
    tested_url = Column(String(512), nullable=True)
    status_code = Column(Integer, default=200)
    is_success = Column(Boolean, default=True)
    message = Column(Text, nullable=True)
    duration_ms = Column(Integer, default=0)
    tested_by_admin_id = Column(Integer, ForeignKey("admin_users.id"), nullable=True)
    created_at = Column(DateTime, default=utc_now)

    portal_integration = relationship("PortalIntegration", back_populates="logs")
    organization = relationship("Organization", back_populates="integration_logs")

# 16. DOCUMENT TYPES
class DocumentType(Base):
    __tablename__ = "document_types"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False) # "RESULT_SCORECARD", "HALL_TICKET", "STUDENT_ID_CARD", "OTHER"
    name = Column(String(100), nullable=False)
    description = Column(String(255), nullable=True)

    documents = relationship("StudentDocument", back_populates="document_type")

# 17. STUDENT DOCUMENTS (Personal Secure Library)
class StudentDocument(Base):
    __tablename__ = "student_documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    document_type_id = Column(Integer, ForeignKey("document_types.id"), nullable=False)
    title = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    stored_path = Column(String(512), nullable=False) # Stored in private encrypted directory
    preview_path = Column(String(512), nullable=True)
    mime_type = Column(String(100), default="application/pdf")
    file_size = Column(Integer, default=0) # In bytes
    is_verified = Column(Boolean, default=False)
    source = Column(String(100), default="OFFICIAL_PORTAL") # "OFFICIAL_PORTAL", "STUDENT_UPLOAD", "INSTITUTION_INTEGRATION"
    encrypted_token = Column(String(128), unique=True, index=True, nullable=False) # For signed short-lived download URLs
    metadata_json = Column(JSON, default=dict)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)
    deleted_at = Column(DateTime, nullable=True) # Soft delete

    user = relationship("User", back_populates="documents")
    document_type = relationship("DocumentType", back_populates="documents")
    result_documents = relationship("ResultDocument", back_populates="document", cascade="all, delete-orphan")
    downloads = relationship("DocumentDownload", back_populates="document", cascade="all, delete-orphan")

# 18. RESULT DOCUMENTS (Join between ExamResult and StudentDocument)
class ResultDocument(Base):
    __tablename__ = "result_documents"

    id = Column(Integer, primary_key=True, index=True)
    exam_result_id = Column(Integer, ForeignKey("exam_results.id", ondelete="CASCADE"), nullable=False)
    document_id = Column(Integer, ForeignKey("student_documents.id", ondelete="CASCADE"), nullable=False)
    is_official_scorecard = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utc_now)

    exam_result = relationship("ExamResult", back_populates="result_documents")
    document = relationship("StudentDocument", back_populates="result_documents")

# 19. STUDENT RESULT REQUESTS
class StudentResultRequest(Base):
    __tablename__ = "student_result_requests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    examination_id = Column(Integer, ForeignKey("examinations.id", ondelete="CASCADE"), nullable=False)
    roll_number = Column(String(100), nullable=False)
    registration_number = Column(String(100), nullable=True)
    date_of_birth = Column(String(20), nullable=True)
    status = Column(String(50), default="PENDING") # "PENDING", "COMPLETED", "FAILED", "NOT_FOUND"
    result_id = Column(Integer, ForeignKey("exam_results.id"), nullable=True)
    requested_at = Column(DateTime, default=utc_now)
    completed_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="result_requests")
    examination = relationship("Examination", back_populates="student_requests")

# 20. DOCUMENT DOWNLOADS (Download Audit History)
class DocumentDownload(Base):
    __tablename__ = "document_downloads"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    document_id = Column(Integer, ForeignKey("student_documents.id", ondelete="CASCADE"), nullable=False)
    ip_address = Column(String(50), nullable=True)
    user_agent = Column(String(512), nullable=True)
    downloaded_at = Column(DateTime, default=utc_now)

    document = relationship("StudentDocument", back_populates="downloads")

# 21. NOTIFICATIONS
class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(50), default="RESULT_ANNOUNCEMENT") # "RESULT_ANNOUNCEMENT", "HALL_TICKET", "ID_CARD", "EXAM_ALERT", "SYSTEM"
    priority = Column(String(20), default="NORMAL") # "LOW", "NORMAL", "HIGH", "URGENT"
    is_read = Column(Boolean, default=False)
    source_url = Column(String(512), nullable=True)
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="notifications")

# 22. NOTIFICATION PREFERENCES
class NotificationPreference(Base):
    __tablename__ = "notification_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    email_results = Column(Boolean, default=True)
    email_hall_tickets = Column(Boolean, default=True)
    email_announcements = Column(Boolean, default=True)
    in_app_all = Column(Boolean, default=True)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    user = relationship("User", back_populates="preferences")

# 23. SUPPORT TICKETS
class SupportTicket(Base):
    __tablename__ = "support_tickets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    subject = Column(String(255), nullable=False)
    category = Column(String(50), default="RESULT_ISSUE") # "RESULT_ISSUE", "HALL_TICKET_ISSUE", "ID_CARD_ISSUE", "PORTAL_DOWN", "ACCOUNT", "OTHER"
    message = Column(Text, nullable=False)
    status = Column(String(50), default="OPEN") # "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"
    priority = Column(String(20), default="MEDIUM") # "LOW", "MEDIUM", "HIGH"
    admin_response = Column(Text, nullable=True)
    resolved_by = Column(Integer, ForeignKey("admin_users.id"), nullable=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    user = relationship("User", back_populates="support_tickets")

# 24. AUDIT LOGS
class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    actor_type = Column(String(50), nullable=False) # "USER", "ADMIN", "SYSTEM"
    actor_id = Column(Integer, nullable=True)
    action = Column(String(100), nullable=False) # "USER_LOGIN", "ADMIN_EXAM_UPDATE", "DOCUMENT_DOWNLOAD", "RESULT_RETRIEVED", etc.
    target_type = Column(String(50), nullable=True) # "EXAMINATION", "DOCUMENT", "USER", "PORTAL"
    target_id = Column(Integer, nullable=True)
    details_json = Column(JSON, default=dict)
    ip_address = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=utc_now)

# 25. USER SESSIONS
class UserSession(Base):
    __tablename__ = "user_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    session_token = Column(String(255), unique=True, index=True, nullable=False)
    ip_address = Column(String(50), nullable=True)
    user_agent = Column(String(512), nullable=True)
    expires_at = Column(DateTime, nullable=False)
    is_revoked = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="sessions")

# 26. SYSTEM SETTINGS
class SystemSetting(Base):
    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True, index=True)
    setting_key = Column(String(100), unique=True, index=True, nullable=False)
    setting_value = Column(Text, nullable=False)
    category = Column(String(50), default="GENERAL") # "GENERAL", "SECURITY", "RETENTION", "INTEGRATION"
    description = Column(String(255), nullable=True)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

# 27. PASSWORD RESET TOKENS
class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    reset_token = Column(String(128), unique=True, index=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    is_used = Column(Boolean, default=False, nullable=False)
    ip_address = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    user = relationship("User")

# 28. OFFICIAL WEBSITES DIRECTORY
class OfficialWebsite(Base):
    __tablename__ = "official_websites"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    code = Column(String(50), index=True, nullable=True) # e.g. "UPSC", "SSC", "NTA", "TNPSC"
    category_type = Column(String(50), nullable=False, index=True) # "NATIONAL_PORTAL", "CENTRAL_RECRUITMENT", "NATIONAL_ENTRANCE", "STATE_PSC", "UNIVERSITY", "STUDENT_SERVICE"
    state_id = Column(Integer, ForeignKey("states.id"), nullable=True, index=True)
    official_url = Column(String(512), nullable=False)
    application_portal_url = Column(String(512), nullable=True)
    domain = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    related_examinations = Column(JSON, default=list) # e.g. ["CSE", "NDA", "CDS"]
    contact_email = Column(String(255), nullable=True)
    contact_phone = Column(String(100), nullable=True)
    verification_status = Column(String(50), default="VERIFIED", index=True) # "VERIFIED", "PENDING_REVIEW", "SUSPICIOUS", "BROKEN"
    verification_source = Column(String(255), default="National Portal of India / Official Gazette")
    last_verified_at = Column(DateTime, default=utc_now)
    is_ssl_valid = Column(Boolean, default=True)
    response_time_ms = Column(Integer, default=120)
    is_active = Column(Boolean, default=True, index=True)
    is_featured = Column(Boolean, default=False, index=True)
    view_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    state = relationship("State")
    verification_logs = relationship("WebsiteVerificationLog", back_populates="website", cascade="all, delete-orphan")
    reports = relationship("BrokenLinkReport", back_populates="website", cascade="all, delete-orphan")

# 29. WEBSITE VERIFICATION LOGS
class WebsiteVerificationLog(Base):
    __tablename__ = "website_verification_logs"

    id = Column(Integer, primary_key=True, index=True)
    website_id = Column(Integer, ForeignKey("official_websites.id", ondelete="CASCADE"), nullable=False, index=True)
    status_code = Column(Integer, nullable=False)
    latency_ms = Column(Integer, nullable=False)
    is_ssl_valid = Column(Boolean, default=True)
    redirect_url = Column(String(512), nullable=True)
    message = Column(String(255), nullable=True)
    checked_by = Column(String(100), default="SYSTEM_MONITOR")
    checked_at = Column(DateTime, default=utc_now, nullable=False)

    website = relationship("OfficialWebsite", back_populates="verification_logs")

# 30. SAVED WEBSITES (User Bookmarks)
class SavedWebsite(Base):
    __tablename__ = "saved_websites"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    website_id = Column(Integer, ForeignKey("official_websites.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    user = relationship("User", back_populates="saved_websites")
    website = relationship("OfficialWebsite")

    __table_args__ = (
        UniqueConstraint("user_id", "website_id", name="uq_user_saved_website"),
    )

# 31. BROKEN LINK REPORTS
class BrokenLinkReport(Base):
    __tablename__ = "broken_link_reports"

    id = Column(Integer, primary_key=True, index=True)
    website_id = Column(Integer, ForeignKey("official_websites.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    reporter_name = Column(String(255), nullable=True)
    reporter_email = Column(String(255), nullable=True)
    reported_issue = Column(String(100), nullable=False) # "HTTP_404", "REDIRECT_WRONG", "SSL_ERROR", "SUSPICIOUS_PHISHING", "SLOW_UNRESPONSIVE", "OTHER"
    details = Column(Text, nullable=True)
    status = Column(String(50), default="PENDING", index=True) # "PENDING", "VERIFIED", "RESOLVED", "REJECTED"
    admin_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    website = relationship("OfficialWebsite", back_populates="reports")
