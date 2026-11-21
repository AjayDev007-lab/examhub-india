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
    slug = Column(String(255), index=True, nullable=True) # e.g. "upsc", "nta", "tnpsc"
    code = Column(String(50), index=True, nullable=True) # e.g. "UPSC", "SSC", "NTA", "TNPSC"
    category_type = Column(String(50), nullable=False, index=True) # "NATIONAL_PORTAL", "CENTRAL_RECRUITMENT", "DEFENCE_RECRUITMENT", "PSU_SCIENTIFIC", "NATIONAL_ENTRANCE", "STATE_PSC", "UNIVERSITY", "SCHOOL_BOARD", "SCHOLARSHIP", "CITIZEN_SERVICE"
    organization_type = Column(String(50), default="CENTRAL") # "CENTRAL", "STATE", "UT", "AUTONOMOUS", "PUBLIC_SECTOR"
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


# 32. RRB GROUP D RECRUITMENT & RESULT MANAGEMENT
class RRBGroupDResult(Base):
    __tablename__ = "rrb_group_d_results"

    id = Column(Integer, primary_key=True, index=True)
    cen_number = Column(String(50), nullable=False, index=True) # e.g. "CEN RRC-01/2019", "CEN 02/2024"
    title = Column(String(255), nullable=False) # e.g. "Level 1 Posts (Group D) - 7th CPC Matrix"
    zone_code = Column(String(50), nullable=False, index=True) # e.g. "RRB_CHENNAI", "RRB_MUMBAI", "ALL"
    zone_name = Column(String(100), nullable=False) # e.g. "Railway Recruitment Board, Chennai"
    vacancies_count = Column(Integer, default=0)
    official_portal_url = Column(String(512), nullable=False) # e.g. "https://www.rrbchennai.gov.in"
    scorecard_url = Column(String(512), nullable=True) # e.g. "https://rrb.digialm.com/..."
    merit_list_pdf_url = Column(String(512), nullable=True)
    cutoff_marks_pdf_url = Column(String(512), nullable=True)
    pet_instructions_url = Column(String(512), nullable=True) # Physical Efficiency Test
    document_verification_url = Column(String(512), nullable=True)
    announcement_date = Column(DateTime, nullable=True)
    scorecard_available_until = Column(DateTime, nullable=True)
    status = Column(String(50), default="DRAFT", index=True) # "DRAFT", "PENDING_VERIFICATION", "APPROVED", "PUBLISHED", "ARCHIVED"
    verification_source = Column(String(255), default="Ministry of Railways / Railway Recruitment Control Board")
    verified_by_admin_id = Column(Integer, ForeignKey("admin_users.id", ondelete="SET NULL"), nullable=True)
    published_by_admin_id = Column(Integer, ForeignKey("admin_users.id", ondelete="SET NULL"), nullable=True)
    admin_notes = Column(Text, nullable=True)
    view_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)


# 33. SCHOLARSHIP PROGRAMMES
class Scholarship(Base):
    __tablename__ = "scholarships"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    provider_name = Column(String(255), nullable=False) # e.g. "Ministry of Minority Affairs", "AICTE"
    category = Column(String(100), default="CENTRAL") # "CENTRAL", "STATE", "UGC_AICTE", "PRIVATE"
    eligibility_criteria = Column(Text, nullable=False)
    award_amount = Column(String(100), nullable=True) # e.g. "₹50,000 per annum"
    application_portal_url = Column(String(512), nullable=False) # e.g. "https://scholarships.gov.in"
    notification_pdf_url = Column(String(512), nullable=True)
    opening_date = Column(DateTime, nullable=True)
    deadline_date = Column(DateTime, nullable=True, index=True)
    status = Column(String(50), default="PUBLISHED", index=True) # "DRAFT", "PUBLISHED", "CLOSED"
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)


# 34. AI SETTINGS & CONFIGURATION
class AISetting(Base):
    __tablename__ = "ai_settings"

    id = Column(Integer, primary_key=True, index=True)
    provider = Column(String(50), default="google_gemini", nullable=False) # "google_gemini", "anthropic_claude", "openai"
    model_name = Column(String(100), default="gemini-1.5-flash", nullable=False)
    is_enabled = Column(Boolean, default=True)
    daily_student_token_limit = Column(Integer, default=25000)
    daily_institution_token_limit = Column(Integer, default=500000)
    temperature = Column(Float, default=0.2)
    system_prompt = Column(Text, nullable=False)
    grounded_citation_required = Column(Boolean, default=True)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)


# 35. AI USAGE LOGS
class AIUsageLog(Base):
    __tablename__ = "ai_usage_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    prompt_tokens = Column(Integer, default=0)
    completion_tokens = Column(Integer, default=0)
    total_tokens = Column(Integer, default=0)
    estimated_cost_inr = Column(Float, default=0.0)
    latency_ms = Column(Integer, default=0)
    status = Column(String(50), default="SUCCESS") # "SUCCESS", "RATE_LIMITED", "FILTERED_SAFETY", "ERROR"
    created_at = Column(DateTime, default=utc_now, nullable=False, index=True)


# 36. PAYMENT TRANSACTIONS & REVENUE
class PaymentTransaction(Base):
    __tablename__ = "payment_transactions"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(String(100), unique=True, nullable=False, index=True)
    payment_id = Column(String(100), unique=True, nullable=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    tier = Column(String(50), nullable=False) # "STUDENT_PRO", "INSTITUTION_VERIFIED"
    amount = Column(Integer, nullable=False) # In Paise (e.g. 9900 = ₹99)
    currency = Column(String(10), default="INR")
    status = Column(String(50), default="PENDING", index=True) # "PENDING", "COMPLETED", "FAILED", "REFUNDED"
    hmac_signature = Column(String(255), nullable=True)
    refund_reason = Column(Text, nullable=True)
    refund_amount = Column(Integer, default=0)
    created_at = Column(DateTime, default=utc_now, nullable=False, index=True)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)


# 37. SECURITY INCIDENT AUDIT
class SecurityIncident(Base):
    __tablename__ = "security_incidents"

    id = Column(Integer, primary_key=True, index=True)
    incident_type = Column(String(100), nullable=False, index=True) # "BRUTE_FORCE_LOGIN", "SUSPICIOUS_IP", "SSRF_ATTEMPT", "PERMISSION_DENIED", "UNAUTHORIZED_API"
    severity = Column(String(50), default="MEDIUM", index=True) # "LOW", "MEDIUM", "HIGH", "CRITICAL"
    source_ip = Column(String(64), nullable=True)
    user_agent = Column(String(512), nullable=True)
    target_resource = Column(String(255), nullable=True)
    details = Column(Text, nullable=True)
    is_resolved = Column(Boolean, default=False)
    resolved_by_admin_id = Column(Integer, ForeignKey("admin_users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False, index=True)


# 38. JOB NOTIFICATIONS & CAREER UPDATES
class JobNotification(Base):
    __tablename__ = "job_notifications"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    organization_name = Column(String(255), nullable=False, index=True)
    organization_logo_url = Column(String(512), nullable=True)
    sector = Column(String(50), default="CENTRAL_GOVT", index=True) # "CENTRAL_GOVT", "STATE_GOVT", "PRIVATE", "PSU"
    category = Column(String(50), default="GOVERNMENT", index=True) # "GOVERNMENT", "STATE_GOVERNMENT", "PRIVATE", "IT", "INTERNSHIP", "APPRENTICESHIP", "WALK_IN", "REMOTE", "RAILWAY", "BANKING", "DEFENCE", "TEACHING"
    job_description = Column(Text, nullable=False)
    vacancies_count = Column(Integer, default=0)
    qualification = Column(String(255), nullable=False, index=True) # e.g. "B.E/B.Tech", "Any Graduate", "10th / 12th", "Diploma"
    required_skills = Column(String(512), nullable=True)
    age_limit = Column(String(100), default="18 - 30 Years")
    experience_required = Column(String(50), default="FRESHER", index=True) # "FRESHER", "0-1", "1-3", "3-5", "5+"
    salary_range = Column(String(100), nullable=True) # e.g. "₹35,400 - ₹1,12,400 (Level 6)"
    location = Column(String(100), default="All India", index=True)
    work_mode = Column(String(50), default="ON_SITE") # "ON_SITE", "REMOTE", "HYBRID"
    application_start_date = Column(DateTime, nullable=True)
    application_end_date = Column(DateTime, nullable=True, index=True)
    application_fee = Column(String(255), nullable=True) # e.g. "₹100 (SC/ST/Women Exempted)"
    selection_process = Column(Text, nullable=True) # e.g. "CBT Stage 1 -> CBT Stage 2 -> Document Verification"
    syllabus_details = Column(Text, nullable=True)
    official_notification_pdf = Column(String(512), nullable=True)
    official_application_url = Column(String(512), nullable=False)
    source_website_url = Column(String(512), nullable=False)
    verification_source = Column(String(255), default="Official Recruitment Board Portal / Union Gazette")
    status = Column(String(50), default="PUBLISHED", index=True) # "DRAFT", "PENDING_VERIFICATION", "VERIFIED", "PUBLISHED", "UPDATED", "EXPIRED", "CANCELLED", "REJECTED"
    view_count = Column(Integer, default=0)
    apply_clicks_count = Column(Integer, default=0)
    is_featured = Column(Boolean, default=False)
    published_at = Column(DateTime, default=utc_now, nullable=False, index=True)
    last_verified_at = Column(DateTime, default=utc_now, nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)


# 39. OFFICIAL RECRUITMENT SOURCES DIRECTORY
class JobSource(Base):
    __tablename__ = "job_sources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False) # e.g. "Union Public Service Commission"
    code = Column(String(50), unique=True, index=True, nullable=False) # e.g. "UPSC", "SSC", "RRB"
    official_url = Column(String(512), nullable=False)
    careers_url = Column(String(512), nullable=False)
    category = Column(String(50), default="CENTRAL_GOVT")
    verification_status = Column(String(50), default="VERIFIED") # "VERIFIED", "NEEDS_REVIEW", "UNREACHABLE"
    last_checked_at = Column(DateTime, default=utc_now, nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)


# 40. SAVED JOBS (STUDENT BOOKMARKS)
class SavedJob(Base):
    __tablename__ = "saved_jobs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    job_id = Column(Integer, ForeignKey("job_notifications.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    __table_args__ = (
        UniqueConstraint("user_id", "job_id", name="uq_user_saved_job"),
    )


# 41. STUDENT JOB APPLICATION TRACKER
class JobApplication(Base):
    __tablename__ = "job_applications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    job_id = Column(Integer, ForeignKey("job_notifications.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String(50), default="APPLIED", index=True) # "APPLIED", "UNDER_REVIEW", "INTERVIEW_CALLED", "SELECTED", "REJECTED"
    application_number = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)
    applied_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)


# 42. INCORRECT JOB NOTIFICATION REPORTS
class JobReport(Base):
    __tablename__ = "job_reports"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("job_notifications.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    reporter_email = Column(String(255), nullable=True)
    issue_type = Column(String(50), nullable=False) # "EXPIRED_LINK", "WRONG_VACANCY", "INCORRECT_DATE", "FAKE_PORTAL", "OTHER"
    details = Column(Text, nullable=True)
    status = Column(String(50), default="PENDING") # "PENDING", "VERIFIED", "RESOLVED"
    created_at = Column(DateTime, default=utc_now, nullable=False)


# 43. STUDENT EXAMINATION REGISTRATIONS
class StudentExamRegistration(Base):
    __tablename__ = "student_exam_registrations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    examination_id = Column(Integer, ForeignKey("examinations.id", ondelete="SET NULL"), nullable=True, index=True)
    schedule_id = Column(Integer, ForeignKey("exam_schedules.id", ondelete="SET NULL"), nullable=True)
    
    # Distinction between registration states:
    # "ADDED_TO_MY_EXAMS": Tracked on ExamHub India
    # "REGISTRATION_STARTED": Student clicked official link and began
    # "APPLICATION_SUBMITTED": Application marked as submitted with ack/app number
    # "APPLICATION_CONFIRMED": Verified with hall ticket or official confirmation
    status = Column(String(50), default="ADDED_TO_MY_EXAMS", index=True)
    
    application_number = Column(String(100), nullable=True)
    registration_date = Column(DateTime, nullable=True)
    official_portal_url = Column(String(512), nullable=True)
    confirmation_proof_url = Column(String(512), nullable=True)
    notes = Column(Text, nullable=True)
    
    # External exam support (manually entered by student)
    is_external = Column(Boolean, default=False)
    external_exam_name = Column(String(255), nullable=True)
    external_authority = Column(String(255), nullable=True)
    external_exam_date = Column(DateTime, nullable=True)
    external_application_deadline = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    user = relationship("User")
    examination = relationship("Examination")
    schedule = relationship("ExamSchedule")


# 44. STUDENT CALENDAR EVENTS
class StudentCalendarEvent(Base):
    __tablename__ = "student_calendar_events"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    registration_id = Column(Integer, ForeignKey("student_exam_registrations.id", ondelete="CASCADE"), nullable=True, index=True)
    examination_id = Column(Integer, ForeignKey("examinations.id", ondelete="SET NULL"), nullable=True, index=True)
    
    title = Column(String(255), nullable=False)
    # Event types: "APPLICATION_START", "APPLICATION_END", "ADMIT_CARD", "EXAM_DATE", "RESULT_DATE", "CUSTOM"
    event_type = Column(String(50), nullable=False, index=True)
    event_date = Column(DateTime, nullable=False, index=True)
    end_date = Column(DateTime, nullable=True)
    is_all_day = Column(Boolean, default=True)
    location = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)
    # Status: "SCHEDULED", "POSTPONED", "CANCELLED", "COMPLETED"
    status = Column(String(50), default="SCHEDULED")
    is_custom = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)


# 45. AUTOMATED EXAMINATION REMINDERS
class ExamReminder(Base):
    __tablename__ = "exam_reminders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    registration_id = Column(Integer, ForeignKey("student_exam_registrations.id", ondelete="CASCADE"), nullable=True)
    calendar_event_id = Column(Integer, ForeignKey("student_calendar_events.id", ondelete="CASCADE"), nullable=True)
    examination_id = Column(Integer, ForeignKey("examinations.id", ondelete="CASCADE"), nullable=True)
    
    # Reminder types: "EXAM_30D", "EXAM_15D", "EXAM_7D", "EXAM_3D", "EXAM_1D", "EXAM_DAY",
    # "APP_CLOSING_7D", "APP_CLOSING_3D", "APP_CLOSING_1D", "APP_CLOSING_DAY",
    # "DATE_CHANGED", "ADMIT_CARD_RELEASED", "RESULT_PUBLISHED", "CUSTOM"
    reminder_type = Column(String(50), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    scheduled_for = Column(DateTime, nullable=False, index=True)
    sent_at = Column(DateTime, nullable=True)
    status = Column(String(50), default="PENDING", index=True) # "PENDING", "SENT", "FAILED", "CANCELLED"
    delivery_channel = Column(String(50), default="IN_APP") # "IN_APP", "EMAIL", "PUSH"
    
    created_at = Column(DateTime, default=utc_now, nullable=False)


# 46. STUDENT JOB PREFERENCES & PROFILE
class StudentJobPreference(Base):
    __tablename__ = "student_job_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    
    qualification = Column(String(100), default="GRADUATION")
    degree_department = Column(String(255), nullable=True)
    graduation_year = Column(Integer, nullable=True)
    skills = Column(Text, nullable=True) # comma-separated keywords: Python, SQL, Banking, Reasoning
    experience_level = Column(String(50), default="FRESHER") # "FRESHER", "0-1", "1-3", "3-5", "5+"
    preferred_roles = Column(Text, nullable=True) # "Software Engineer, Bank PO, Civil Services"
    preferred_locations = Column(Text, nullable=True) # "Tamil Nadu, Karnataka, Delhi, All India"
    expected_salary_min = Column(String(50), nullable=True)
    sector_preference = Column(String(50), default="ALL") # "ALL", "GOVERNMENT", "PRIVATE"
    employment_type_preference = Column(String(50), default="FULL_TIME") # "FULL_TIME", "INTERNSHIP", "REMOTE"
    
    job_alerts_enabled = Column(Boolean, default=True)
    email_alerts_enabled = Column(Boolean, default=True)
    push_alerts_enabled = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)


# 47. JOB ALERT SUBSCRIPTIONS
class JobAlertSubscription(Base):
    __tablename__ = "job_alert_subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    keyword = Column(String(255), nullable=True)
    sector = Column(String(50), nullable=True)
    category = Column(String(50), nullable=True)
    qualification = Column(String(50), nullable=True)
    is_active = Column(Boolean, default=True)
    frequency = Column(String(50), default="INSTANT") # "INSTANT", "DAILY", "WEEKLY"
    last_triggered_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)


# 48. NOTIFICATION TEMPLATES
class NotificationTemplate(Base):
    __tablename__ = "notification_templates"

    id = Column(Integer, primary_key=True, index=True)
    template_code = Column(String(100), unique=True, index=True, nullable=False)
    category = Column(String(50), nullable=False) # "EXAMINATION", "JOB", "DEADLINE", "SYSTEM"
    title_template = Column(String(255), nullable=False)
    body_template = Column(Text, nullable=False)
    channels = Column(String(100), default="IN_APP,EMAIL")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)


# 49. NOTIFICATION DELIVERY LOGS
class NotificationDeliveryLog(Base):
    __tablename__ = "notification_delivery_logs"

    id = Column(Integer, primary_key=True, index=True)
    notification_id = Column(Integer, nullable=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    channel = Column(String(50), nullable=False) # "IN_APP", "EMAIL", "PUSH", "SMS"
    recipient = Column(String(255), nullable=True)
    status = Column(String(50), default="DELIVERED") # "QUEUED", "DELIVERED", "FAILED", "BOUNCED"
    provider = Column(String(50), default="SYSTEM_IN_APP")
    provider_message_id = Column(String(255), nullable=True)
    error_message = Column(Text, nullable=True)
    sent_at = Column(DateTime, default=utc_now, nullable=False)


# 50. ADMIN ALERTS & NOTIFICATION CENTRE
class AdminAlert(Base):
    __tablename__ = "admin_alerts"

    id = Column(Integer, primary_key=True, index=True)
    alert_type = Column(String(100), nullable=False, index=True) # "NEW_STUDENT", "NEW_INSTITUTION", "EXAM_DATE_CHANGE", "JOB_PENDING_VERIFICATION", "WEBSITE_UNAVAILABLE", "FAILED_TASK", "SECURITY_ALERT"
    severity = Column(String(50), default="INFO", index=True) # "INFO", "WARNING", "CRITICAL"
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    status = Column(String(50), default="OPEN", index=True) # "OPEN", "ACKNOWLEDGED", "RESOLVED"
    assigned_admin_id = Column(Integer, ForeignKey("admin_users.id", ondelete="SET NULL"), nullable=True)
    metadata_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    resolved_at = Column(DateTime, nullable=True)


# 51. PLATFORM ANALYTICS EVENTS
class AnalyticsEvent(Base):
    __tablename__ = "analytics_events"

    id = Column(Integer, primary_key=True, index=True)
    event_name = Column(String(100), nullable=False, index=True) # "PAGE_VIEW", "EXAM_VIEW", "EXAM_REGISTER", "CALENDAR_ADD", "JOB_VIEW", "JOB_APPLY_CLICK", "WEBSITE_CLICK", "LOGIN"
    entity_type = Column(String(50), nullable=True) # "EXAM", "JOB", "WEBSITE", "STUDENT"
    entity_id = Column(String(100), nullable=True)
    user_id = Column(Integer, nullable=True, index=True)
    session_id = Column(String(100), nullable=True)
    metadata_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False, index=True)


# 52. SCHEDULED AUTOMATION TASK LOGS
class ScheduledTaskLog(Base):
    __tablename__ = "scheduled_task_logs"

    id = Column(Integer, primary_key=True, index=True)
    task_name = Column(String(100), nullable=False, index=True) # "RECALCULATE_REMINDERS", "CHECK_EXAM_DATES", "EXPIRE_OLD_JOBS", "DISPATCH_JOB_ALERTS", "PROBE_GOV_WEBSITES", "CLEANUP_SESSIONS"
    status = Column(String(50), default="COMPLETED") # "RUNNING", "COMPLETED", "FAILED"
    records_processed = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)
    started_at = Column(DateTime, default=utc_now, nullable=False)
    completed_at = Column(DateTime, default=utc_now, nullable=False)


# 53. MONITORING SOURCES (Official Recruitment, Examination & Education Authorities)
class MonitoringSource(Base):
    __tablename__ = "monitoring_sources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    organization_code = Column(String(100), nullable=False, index=True) # e.g. "UPSC", "SSC", "RRB", "CBSE"
    organization_name = Column(String(255), nullable=False)
    category = Column(String(50), nullable=False, index=True) # "GOVT_JOB", "PRIVATE_JOB", "EXAM", "RESULT", "SCHOOL_RESULT", "ADMIT_CARD", "SCHOLARSHIP", "ADMISSION"
    state_code = Column(String(10), default="ALL", index=True) # "ALL", "TN", "DL", "KA", "MH", etc.
    source_type = Column(String(50), default="OFFICIAL_GOVT") # "OFFICIAL_GOVT", "EMPLOYER_CAREER", "EDUCATION_BOARD", "TESTING_AGENCY"
    official_website_url = Column(String(512), nullable=False)
    notification_url = Column(String(512), nullable=False)
    verification_status = Column(String(50), default="VERIFIED", index=True) # "PENDING", "VERIFIED", "NEEDS_REVIEW", "BROKEN", "REDIRECT_CHANGED", "SUSPICIOUS", "DISABLED"
    check_frequency = Column(String(50), default="DAILY") # "6_HOURS", "DAILY", "TWICE_DAILY"
    is_enabled = Column(Boolean, default=True)
    priority = Column(Integer, default=1) # 1 (Highest/Govt), 2 (State), 3 (Private)
    last_checked_at = Column(DateTime, nullable=True)
    last_successful_check_at = Column(DateTime, nullable=True)
    error_count = Column(Integer, default=0)
    last_error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)


# 54. MONITORING SCHEDULES
class MonitoringSchedule(Base):
    __tablename__ = "monitoring_schedules"

    id = Column(Integer, primary_key=True, index=True)
    slot_name = Column(String(100), nullable=False) # e.g. "Morning Source Check", "Midday Check", "Evening Check", "Nightly Verification"
    time_slot = Column(String(10), nullable=False) # e.g. "06:00", "12:00", "18:00", "22:00"
    timezone = Column(String(50), default="Asia/Kolkata")
    is_active = Column(Boolean, default=True)
    category_scope = Column(String(100), default="ALL") # "ALL", "GOVT_JOBS", "EXAMS", "RESULTS"
    last_run_at = Column(DateTime, nullable=True)
    next_run_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)


# 55. MONITORING RUNS
class MonitoringRun(Base):
    __tablename__ = "monitoring_runs"

    id = Column(Integer, primary_key=True, index=True)
    schedule_slot = Column(String(100), nullable=False)
    status = Column(String(50), default="COMPLETED", index=True) # "RUNNING", "COMPLETED", "FAILED", "PARTIAL"
    sources_checked_count = Column(Integer, default=0)
    new_items_detected = Column(Integer, default=0)
    updated_items_detected = Column(Integer, default=0)
    failed_sources_count = Column(Integer, default=0)
    duration_seconds = Column(Float, default=0.0)
    error_details = Column(Text, nullable=True)
    started_at = Column(DateTime, default=utc_now, nullable=False)
    completed_at = Column(DateTime, default=utc_now, nullable=False)


# 56. DETECTED UPDATES (Information Extraction & Verification Pipeline)
class DetectedUpdate(Base):
    __tablename__ = "detected_updates"

    id = Column(Integer, primary_key=True, index=True)
    source_id = Column(Integer, ForeignKey("monitoring_sources.id", ondelete="SET NULL"), nullable=True, index=True)
    title = Column(String(255), nullable=False)
    organization = Column(String(255), nullable=False, index=True)
    category = Column(String(50), nullable=False, index=True) # "GOVT_JOB", "PRIVATE_JOB", "EXAM", "RESULT", "SCHOOL_RESULT", "ADMIT_CARD", "SCHOLARSHIP", "ADMISSION"
    state = Column(String(50), default="All India", index=True)
    description = Column(Text, nullable=False)
    qualification = Column(String(255), nullable=True)
    vacancies_count = Column(Integer, nullable=True)
    official_notification_url = Column(String(512), nullable=True)
    application_url = Column(String(512), nullable=True)
    source_url = Column(String(512), nullable=False)
    important_dates = Column(JSON, nullable=True) # {"application_start": "...", "application_end": "...", "exam_date": "...", "result_date": "..."}
    publication_date = Column(DateTime, nullable=True)
    detection_date = Column(DateTime, default=utc_now, nullable=False)
    
    # Workflow: DETECTED -> PROCESSING -> PENDING_VERIFICATION -> APPROVED -> PUBLISHED -> ARCHIVED
    verification_status = Column(String(50), default="PUBLISHED", index=True)
    change_type = Column(String(50), default="NEW", index=True) # "NEW", "UPDATED", "DUPLICATE", "EXPIRED", "CANCELLED", "DATE_CHANGED", "BROKEN_LINK"
    is_officially_verified = Column(Boolean, default=True)
    verification_badge = Column(String(50), default="OFFICIALLY_VERIFIED", index=True) # "OFFICIALLY_VERIFIED", "THIRD_PARTY", "EXPECTED_UNOFFICIAL", "AWAITING_VERIFICATION"
    is_featured = Column(Boolean, default=False)
    is_closing_soon = Column(Boolean, default=False)
    
    reviewed_by_admin_id = Column(Integer, ForeignKey("admin_users.id", ondelete="SET NULL"), nullable=True)
    review_notes = Column(Text, nullable=True)
    published_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    source = relationship("MonitoringSource")


# 57. UPDATE VERIFICATION AUDIT LOGS
class UpdateVerificationLog(Base):
    __tablename__ = "update_verification_logs"

    id = Column(Integer, primary_key=True, index=True)
    detected_update_id = Column(Integer, ForeignKey("detected_updates.id", ondelete="CASCADE"), nullable=False, index=True)
    admin_id = Column(Integer, ForeignKey("admin_users.id", ondelete="SET NULL"), nullable=True)
    action = Column(String(50), nullable=False) # "APPROVE", "REJECT", "EDIT", "PUBLISH", "ARCHIVE", "FLAG_SUSPICIOUS"
    previous_state = Column(JSON, nullable=True)
    new_state = Column(JSON, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)


# 58. STUDENT UPDATE BOOKMARKS
class StudentUpdateBookmark(Base):
    __tablename__ = "student_update_bookmarks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    update_id = Column(Integer, ForeignKey("detected_updates.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    __table_args__ = (
        UniqueConstraint("user_id", "update_id", name="uq_user_update_bookmark"),
    )


# 59. STUDENT UPDATE PREFERENCES & SUBSCRIPTIONS
class StudentUpdatePreference(Base):
    __tablename__ = "student_update_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    subscribed_categories = Column(JSON, nullable=True) # ["GOVT_JOB", "EXAM", "RESULT", "SCHOOL_RESULT"]
    subscribed_organizations = Column(JSON, nullable=True) # ["UPSC", "SSC", "CBSE"]
    in_app_enabled = Column(Boolean, default=True)
    email_enabled = Column(Boolean, default=True)
    push_enabled = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)


# 60. WEBSITE MAINTENANCE TASKS
class MaintenanceTask(Base):
    __tablename__ = "maintenance_tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(50), nullable=False, index=True) # "BROKEN_LINK", "SECURITY_ISSUE", "WEBSITE_BUG", "PERFORMANCE_ISSUE", "CONTENT_UPDATE", "DATABASE_ISSUE", "API_ISSUE", "DESIGN_ISSUE", "USER_REPORTED_ISSUE"
    priority = Column(String(50), default="MEDIUM", index=True) # "LOW", "MEDIUM", "HIGH", "URGENT"
    status = Column(String(50), default="OPEN", index=True) # "OPEN", "ASSIGNED", "IN_PROGRESS", "AWAITING_REVIEW", "RESOLVED", "CLOSED"
    assigned_to_admin_id = Column(Integer, ForeignKey("admin_users.id", ondelete="SET NULL"), nullable=True)
    reported_by = Column(String(100), default="SYSTEM_MONITOR")
    resolution_notes = Column(Text, nullable=True)
    deadline = Column(DateTime, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)


# 61. WEBSITE HEALTH CHECKS
class WebsiteHealthCheck(Base):
    __tablename__ = "website_health_checks"

    id = Column(Integer, primary_key=True, index=True)
    component_name = Column(String(100), nullable=False, index=True) # "HOMEPAGE", "EXAMS_PORTAL", "JOBS_PORTAL", "SCHOOL_PORTAL", "STUDENT_DASHBOARD", "ADMIN_PORTAL", "DATABASE", "API_GATEWAY", "AUTH_SERVICE", "BACKGROUND_WORKER"
    route_path = Column(String(255), nullable=True)
    status = Column(String(50), default="HEALTHY", index=True) # "HEALTHY", "WARNING", "CRITICAL", "UNKNOWN"
    latency_ms = Column(Float, default=0.0)
    http_status = Column(Integer, default=200)
    error_message = Column(Text, nullable=True)
    checked_at = Column(DateTime, default=utc_now, nullable=False, index=True)


# 62. DATABASE HEALTH LOGS
class DatabaseHealthLog(Base):
    __tablename__ = "database_health_logs"

    id = Column(Integer, primary_key=True, index=True)
    connection_status = Column(String(50), default="CONNECTED") # "CONNECTED", "ERROR", "SLOW"
    active_connections = Column(Integer, default=1)
    query_latency_ms = Column(Float, default=2.5)
    total_tables_count = Column(Integer, default=65)
    database_size_mb = Column(Float, default=28.4)
    failed_migrations_count = Column(Integer, default=0)
    notes = Column(Text, nullable=True)
    checked_at = Column(DateTime, default=utc_now, nullable=False)


# 63. AUTOMATED BACKUP RECORDS
class BackupRecord(Base):
    __tablename__ = "backup_records"

    id = Column(Integer, primary_key=True, index=True)
    backup_type = Column(String(50), default="DAILY", index=True) # "DAILY", "WEEKLY", "MONTHLY", "MANUAL"
    file_name = Column(String(255), nullable=False)
    file_size_kb = Column(Integer, default=0)
    status = Column(String(50), default="SUCCESS", index=True) # "SUCCESS", "FAILED", "VERIFYING", "RESTORED"
    integrity_checksum = Column(String(128), nullable=True) # SHA-256
    storage_path = Column(String(512), nullable=False)
    retention_days = Column(Integer, default=30)
    created_by_admin_id = Column(Integer, ForeignKey("admin_users.id", ondelete="SET NULL"), nullable=True)
    last_verified_at = Column(DateTime, nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)


# 64. APPLICATION ERROR LOGS
class ApplicationErrorLog(Base):
    __tablename__ = "application_error_logs"

    id = Column(Integer, primary_key=True, index=True)
    error_type = Column(String(100), nullable=False, index=True) # "FRONTEND_EXCEPTION", "BACKEND_EXCEPTION", "API_FAILURE", "DB_ERROR", "TASK_FAILURE", "NOTIFICATION_FAILURE"
    service = Column(String(100), default="API", index=True) # "API", "FRONTEND", "SCHEDULER", "AUTH", "STORAGE"
    severity = Column(String(50), default="MEDIUM", index=True) # "LOW", "MEDIUM", "HIGH", "CRITICAL"
    message = Column(Text, nullable=False)
    stack_trace = Column(Text, nullable=True)
    endpoint = Column(String(255), nullable=True)
    status = Column(String(50), default="OPEN", index=True) # "OPEN", "INVESTIGATING", "RESOLVED", "IGNORED"
    frequency_count = Column(Integer, default=1)
    first_seen_at = Column(DateTime, default=utc_now, nullable=False)
    last_seen_at = Column(DateTime, default=utc_now, nullable=False)


# 65. DAILY ADMIN REPORTS (20-Point Operational Report)
class DailyAdminReport(Base):
    __tablename__ = "daily_admin_reports"

    id = Column(Integer, primary_key=True, index=True)
    report_date = Column(String(20), unique=True, index=True, nullable=False) # "YYYY-MM-DD"
    sources_checked_count = Column(Integer, default=0)
    new_govt_jobs = Column(Integer, default=0)
    new_private_jobs = Column(Integer, default=0)
    new_exam_notices = Column(Integer, default=0)
    new_results_announced = Column(Integer, default=0)
    school_results_updated = Column(Integer, default=0)
    new_admit_cards = Column(Integer, default=0)
    scholarships_updated = Column(Integer, default=0)
    deadlines_updated = Column(Integer, default=0)
    broken_links_found = Column(Integer, default=0)
    failed_sources_count = Column(Integer, default=0)
    pending_verifications = Column(Integer, default=0)
    failed_notifications = Column(Integer, default=0)
    website_health_status = Column(String(50), default="HEALTHY")
    api_health_status = Column(String(50), default="HEALTHY")
    db_health_status = Column(String(50), default="HEALTHY")
    backup_status = Column(String(50), default="SUCCESS")
    security_alerts_count = Column(Integer, default=0)
    maintenance_tasks_completed = Column(Integer, default=0)
    outstanding_issues_count = Column(Integer, default=0)
    report_data_json = Column(JSON, nullable=True)
    generated_at = Column(DateTime, default=utc_now, nullable=False)





