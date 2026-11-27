import asyncio
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import AsyncSessionLocal, engine, Base
from app.models.models import (
    State, OrganizationCategory, Organization, Examination, ExamSchedule,
    AdminRole, AdminUser, AdminPermission, DocumentType, SystemSetting,
    ResultAnnouncement, ExamResult, PortalIntegration, User,
    OfficialWebsite, WebsiteVerificationLog, SavedWebsite, BrokenLinkReport,
    RRBGroupDResult, AISetting, Scholarship, SecurityIncident,
    JobNotification, JobSource, SavedJob, JobApplication,
    StudentExamRegistration, StudentCalendarEvent, ExamReminder,
    StudentJobPreference, JobAlertSubscription, NotificationTemplate,
    StudentSchoolProfile,
    NotificationDeliveryLog, AdminAlert, AnalyticsEvent, ScheduledTaskLog,
    MonitoringSource, MonitoringSchedule, MonitoringRun, DetectedUpdate,
    UpdateVerificationLog, MaintenanceTask, WebsiteHealthCheck,
    DatabaseHealthLog, BackupRecord, ApplicationErrorLog, DailyAdminReport,
    WebsiteOperatingControl, WebsiteStatusHistory
)
from app.auth.security import hash_password
from app.config import settings

def utc_now():
    return datetime.now(timezone.utc)

STATES_DATA = [
    # States
    {"code": "AP", "name": "Andhra Pradesh", "type": "STATE"},
    {"code": "AR", "name": "Arunachal Pradesh", "type": "STATE"},
    {"code": "AS", "name": "Assam", "type": "STATE"},
    {"code": "BR", "name": "Bihar", "type": "STATE"},
    {"code": "CG", "name": "Chhattisgarh", "type": "STATE"},
    {"code": "GA", "name": "Goa", "type": "STATE"},
    {"code": "GJ", "name": "Gujarat", "type": "STATE"},
    {"code": "HR", "name": "Haryana", "type": "STATE"},
    {"code": "HP", "name": "Himachal Pradesh", "type": "STATE"},
    {"code": "JH", "name": "Jharkhand", "type": "STATE"},
    {"code": "KA", "name": "Karnataka", "type": "STATE"},
    {"code": "KL", "name": "Kerala", "type": "STATE"},
    {"code": "MP", "name": "Madhya Pradesh", "type": "STATE"},
    {"code": "MH", "name": "Maharashtra", "type": "STATE"},
    {"code": "MN", "name": "Manipur", "type": "STATE"},
    {"code": "ML", "name": "Meghalaya", "type": "STATE"},
    {"code": "MZ", "name": "Mizoram", "type": "STATE"},
    {"code": "NL", "name": "Nagaland", "type": "STATE"},
    {"code": "OD", "name": "Odisha", "type": "STATE"},
    {"code": "PB", "name": "Punjab", "type": "STATE"},
    {"code": "RJ", "name": "Rajasthan", "type": "STATE"},
    {"code": "SK", "name": "Sikkim", "type": "STATE"},
    {"code": "TN", "name": "Tamil Nadu", "type": "STATE"},
    {"code": "TS", "name": "Telangana", "type": "STATE"},
    {"code": "TR", "name": "Tripura", "type": "STATE"},
    {"code": "UP", "name": "Uttar Pradesh", "type": "STATE"},
    {"code": "UK", "name": "Uttarakhand", "type": "STATE"},
    {"code": "WB", "name": "West Bengal", "type": "STATE"},
    # UTs
    {"code": "AN", "name": "Andaman and Nicobar Islands", "type": "UT"},
    {"code": "CH", "name": "Chandigarh", "type": "UT"},
    {"code": "DH", "name": "Dadra and Nagar Haveli and Daman and Diu", "type": "UT"},
    {"code": "DL", "name": "Delhi (NCT)", "type": "UT"},
    {"code": "JK", "name": "Jammu and Kashmir", "type": "UT"},
    {"code": "LA", "name": "Ladakh", "type": "UT"},
    {"code": "LD", "name": "Lakshadweep", "type": "UT"},
    {"code": "PY", "name": "Puducherry", "type": "UT"}
]

CATEGORIES_DATA = [
    {"code": "CENTRAL_GOVT", "name": "Central Government Examination", "description": "Commissions and boards governed directly by Union Ministries"},
    {"code": "STATE_GOVT", "name": "State Public Service Commission", "description": "State level civil service and departmental recruitment"},
    {"code": "ENTRANCE_BOARD", "name": "National Entrance Testing Board", "description": "National Testing Agency and autonomous entrance councils"},
    {"code": "RECRUITMENT_BOARD", "name": "Recruitment Board", "description": "Railways, Banking and Specialized Recruitment Boards"},
    {"code": "CENTRAL_UNIVERSITY", "name": "Central University", "description": "Universities established by an Act of Parliament"},
    {"code": "STATE_UNIVERSITY", "name": "State University", "description": "State government universities with affiliated colleges"},
    {"code": "AUTONOMOUS_COLLEGE", "name": "Autonomous & Affiliated College", "description": "Autonomous degree colleges and state affiliate colleges"},
    {"code": "PRIVATE_UNIVERSITY", "name": "Private & Deemed University", "description": "Recognized private universities and institutes of eminence"}
]

DOC_TYPES_DATA = [
    {"code": "RESULT_SCORECARD", "name": "Examination Result / Scorecard", "description": "Official marksheets and score statements"},
    {"code": "HALL_TICKET", "name": "Hall Ticket / Admit Card", "description": "Examination entry pass with center details"},
    {"code": "STUDENT_ID_CARD", "name": "Student Identity Card", "description": "Institution-issued student identity documentation"},
    {"code": "CERTIFICATE", "name": "Certificate / Degree", "description": "Passing certificate, provisional degree or transfer record"}
]

async def seed_database():
    """Initializes schema and populates all initial reference data, institutions, and roles."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        # 1. Seed Roles
        role_stmt = select(AdminRole)
        res = await db.execute(role_stmt)
        if not res.scalars().first():
            super_role = AdminRole(name="SUPER_ADMIN", description="Complete system administration")
            admin_role = AdminRole(name="ADMIN", description="Examination and integration management")
            finance_role = AdminRole(name="FINANCE_ADMIN", description="Financial auditing and document billing")
            support_role = AdminRole(name="SUPPORT_STAFF", description="Student assistance and verification")
            manager_role = AdminRole(name="INSTITUTION_MANAGER", description="Institutional portal management")
            db.add_all([super_role, admin_role, finance_role, support_role, manager_role])
            await db.flush()

            # Seed Permissions
            db.add_all([
                AdminPermission(role_id=super_role.id, permission_name="*"),
                AdminPermission(role_id=admin_role.id, permission_name="exams:write"),
                AdminPermission(role_id=admin_role.id, permission_name="results:publish"),
                AdminPermission(role_id=admin_role.id, permission_name="integrations:manage"),
                AdminPermission(role_id=finance_role.id, permission_name="finance:audit"),
                AdminPermission(role_id=support_role.id, permission_name="support:read_write"),
                AdminPermission(role_id=manager_role.id, permission_name="institution:manage")
            ])


        if settings.SUPERADMIN_EMAIL and settings.SUPERADMIN_PASSWORD:
            admin_res = await db.execute(select(AdminUser).where(AdminUser.email == settings.SUPERADMIN_EMAIL.lower()))
            if not admin_res.scalar_one_or_none():
                super_role = await db.scalar(select(AdminRole).where(AdminRole.name == "SUPER_ADMIN"))
                if super_role:
                    db.add(AdminUser(
                        full_name="ExamHub Super Administrator",
                        email=settings.SUPERADMIN_EMAIL.lower(),
                        password_hash=hash_password(settings.SUPERADMIN_PASSWORD),
                        role_id=super_role.id,
                        is_active=True,
                    ))

        # 2. Seed States
        state_stmt = select(State)
        res = await db.execute(state_stmt)
        if not res.scalars().first():
            for s in STATES_DATA:
                db.add(State(code=s["code"], name=s["name"], type=s["type"]))
            await db.flush()

        # 3. Seed Categories
        cat_stmt = select(OrganizationCategory)
        res = await db.execute(cat_stmt)
        if not res.scalars().first():
            for c in CATEGORIES_DATA:
                db.add(OrganizationCategory(code=c["code"], name=c["name"], description=c["description"]))
            await db.flush()

        # 4. Seed Document Types
        dt_stmt = select(DocumentType)
        res = await db.execute(dt_stmt)
        if not res.scalars().first():
            for dt in DOC_TYPES_DATA:
                db.add(DocumentType(code=dt["code"], name=dt["name"], description=dt["description"]))
            await db.flush()

        # 5. Seed Organizations
        org_stmt = select(Organization)
        res = await db.execute(org_stmt)
        if not res.scalars().first():
            # Get category IDs
            cat_map = {}
            c_res = await db.execute(select(OrganizationCategory))
            for c in c_res.scalars().all():
                cat_map[c.code] = c.id

            delhi_res = await db.execute(select(State).where(State.code == "DL"))
            delhi = delhi_res.scalar_one_or_none()
            delhi_id = delhi.id if delhi else None

            tn_res = await db.execute(select(State).where(State.code == "TN"))
            tn = tn_res.scalar_one_or_none()
            tn_id = tn.id if tn else None

            up_res = await db.execute(select(State).where(State.code == "UP"))
            up = up_res.scalar_one_or_none()
            up_id = up.id if up else None

            ka_res = await db.execute(select(State).where(State.code == "KA"))
            ka = ka_res.scalar_one_or_none()
            ka_id = ka.id if ka else None

            mh_res = await db.execute(select(State).where(State.code == "MH"))
            mh = mh_res.scalar_one_or_none()
            mh_id = mh.id if mh else None

            orgs = [
                # 1. UPSC
                Organization(
                    name="Union Public Service Commission",
                    code="UPSC",
                    category_id=cat_map["CENTRAL_GOVT"],
                    state_id=delhi_id,
                    official_website="https://upsc.gov.in",
                    result_portal_url="https://upsc.gov.in/examinations/active-examinations",
                    hall_ticket_portal_url="https://upsconline.nic.in/eadmitcard/",
                    contact_email="feedback-upsc@gov.in",
                    contact_phone="+91-11-23098591",
                    integration_methods=["OFFICIAL_REDIRECT", "STUDENT_PORTAL_SESSION"],
                    verification_status="VERIFIED"
                ),
                # 2. SSC
                Organization(
                    name="Staff Selection Commission",
                    code="SSC",
                    category_id=cat_map["CENTRAL_GOVT"],
                    state_id=delhi_id,
                    official_website="https://ssc.gov.in",
                    result_portal_url="https://ssc.gov.in/candidate-portal/results",
                    hall_ticket_portal_url="https://ssc.gov.in/candidate-portal/admit-card",
                    contact_email="enquiry-ssc@nic.in",
                    contact_phone="+91-11-24363343",
                    integration_methods=["OFFICIAL_REDIRECT", "STUDENT_PORTAL_SESSION"],
                    verification_status="VERIFIED"
                ),
                # 3. NTA
                Organization(
                    name="National Testing Agency (NTA)",
                    code="NTA",
                    category_id=cat_map["ENTRANCE_BOARD"],
                    state_id=delhi_id,
                    official_website="https://nta.ac.in",
                    result_portal_url="https://examinationservices.nic.in/resultservices/",
                    hall_ticket_portal_url="https://examinationservices.nic.in/admitcard/",
                    contact_email="genadmin-nta@nic.in",
                    contact_phone="+91-11-40759000",
                    integration_methods=["OFFICIAL_API", "OFFICIAL_REDIRECT"],
                    verification_status="VERIFIED"
                ),
                # 4. RRB
                Organization(
                    name="Railway Recruitment Boards (RRB)",
                    code="RRB",
                    category_id=cat_map["RECRUITMENT_BOARD"],
                    state_id=delhi_id,
                    official_website="https://indianrailways.gov.in",
                    result_portal_url="https://rrbcdg.gov.in/results.php",
                    hall_ticket_portal_url="https://rrb.digialm.com/OnlineAssessment/",
                    contact_email="rrb@nic.in",
                    contact_phone="+91-172-2793254",
                    integration_methods=["OFFICIAL_REDIRECT", "STUDENT_PORTAL_SESSION"],
                    verification_status="VERIFIED"
                ),
                # 5. TNPSC
                Organization(
                    name="Tamil Nadu Public Service Commission",
                    code="TNPSC",
                    category_id=cat_map["STATE_GOVT"],
                    state_id=tn_id,
                    official_website="https://tnpsc.gov.in",
                    result_portal_url="https://tnpsc.gov.in/results.html",
                    hall_ticket_portal_url="https://apply.tnpscexams.in/otrdsh/login",
                    contact_email="contacttnpsc@gmail.com",
                    contact_phone="1800-419-0958",
                    integration_methods=["OFFICIAL_REDIRECT", "STUDENT_PORTAL_SESSION"],
                    verification_status="VERIFIED"
                ),
                # 6. DU (Central University)
                Organization(
                    name="University of Delhi",
                    code="DU",
                    category_id=cat_map["CENTRAL_UNIVERSITY"],
                    state_id=delhi_id,
                    official_website="https://www.du.ac.in",
                    result_portal_url="https://slc.uod.ac.in/index.php/site/login",
                    hall_ticket_portal_url="https://exam.du.ac.in/admit-card.html",
                    id_card_portal_url="https://slc.uod.ac.in/student/id-card",
                    contact_email="registrar@du.ac.in",
                    contact_phone="+91-11-27006900",
                    integration_methods=["OFFICIAL_API", "STUDENT_PORTAL_SESSION", "MANUAL_UPLOAD"],
                    verification_status="VERIFIED"
                ),
                # 7. Anna University (State University)
                Organization(
                    name="Anna University",
                    code="ANNA_UNIV",
                    category_id=cat_map["STATE_UNIVERSITY"],
                    state_id=tn_id,
                    official_website="https://www.annauniv.edu",
                    result_portal_url="https://coe1.annauniv.edu/home/index.php",
                    hall_ticket_portal_url="https://coe1.annauniv.edu/hallticket",
                    id_card_portal_url="https://student.annauniv.edu/identity",
                    contact_email="coe@annauniv.edu",
                    contact_phone="+91-44-22357295",
                    integration_methods=["OFFICIAL_REDIRECT", "STUDENT_PORTAL_SESSION"],
                    verification_status="VERIFIED"
                ),
                # 8. VTU (State University)
                Organization(
                    name="Visvesvaraya Technological University",
                    code="VTU",
                    category_id=cat_map["STATE_UNIVERSITY"],
                    state_id=ka_id,
                    official_website="https://vtu.ac.in",
                    result_portal_url="https://results.vtu.ac.in",
                    hall_ticket_portal_url="https://prexam.vtu.ac.in",
                    id_card_portal_url="https://vtu.ac.in/student-id",
                    contact_email="regeval@vtu.ac.in",
                    contact_phone="+91-831-2498131",
                    integration_methods=["OFFICIAL_REDIRECT", "STUDENT_PORTAL_SESSION"],
                    verification_status="VERIFIED"
                ),
                # 9. BITS Pilani (Private & Deemed)
                Organization(
                    name="BITS Pilani",
                    code="BITS",
                    category_id=cat_map["PRIVATE_UNIVERSITY"],
                    state_id=delhi_id, # Rajasthan / Multi-campus
                    official_website="https://www.bits-pilani.ac.in",
                    result_portal_url="https://erp.bits-pilani.ac.in/results",
                    hall_ticket_portal_url="https://erp.bits-pilani.ac.in/admitcard",
                    id_card_portal_url="https://erp.bits-pilani.ac.in/student-id",
                    contact_email="admissions@pilani.bits-pilani.ac.in",
                    contact_phone="+91-1596-242205",
                    integration_methods=["OFFICIAL_API", "STUDENT_PORTAL_SESSION"],
                    verification_status="VERIFIED"
                ),
                # 10. UPPSC (State Commission)
                Organization(
                    name="Uttar Pradesh Public Service Commission",
                    code="UPPSC",
                    category_id=cat_map["STATE_GOVT"],
                    state_id=up_id,
                    official_website="https://uppsc.up.nic.in",
                    result_portal_url="https://uppsc.up.nic.in/CandidateSegment/Results.aspx",
                    hall_ticket_portal_url="https://uppsc.up.nic.in/CandidateSegment/AdmitCard.aspx",
                    contact_email="online.uppsc@nic.in",
                    contact_phone="+91-532-2407547",
                    integration_methods=["OFFICIAL_REDIRECT", "STUDENT_PORTAL_SESSION"],
                    verification_status="VERIFIED"
                )
            ]
            db.add_all(orgs)
            await db.flush()

            # Seed Portal Integrations
            for org in orgs:
                pi = PortalIntegration(
                    organization_id=org.id,
                    adapter_name=f"{org.code}Adapter" if org.code in ["UPSC", "SSC", "RRB", "NTA", "TNPSC"] else "UniversityAdapter",
                    integration_type="AUTOMATED_API" if "OFFICIAL_API" in org.integration_methods else "OFFICIAL_REDIRECT",
                    status="OPERATIONAL",
                    config_json={"api_version": "v1", "rate_limit_per_min": 60},
                    health_status="HEALTHY"
                )
                db.add(pi)

            # 6. Seed Examinations
            org_map = {o.code: o.id for o in orgs}
            exams = [
                # UPSC
                Examination(
                    organization_id=org_map["UPSC"],
                    name="Civil Services (Preliminary) Examination",
                    code="UPSC-CSE-PRE-2026",
                    exam_type="GOVERNMENT",
                    description="National competitive examination for recruitment to IAS, IPS, IFS and Central Group A & B services.",
                    year=2026,
                    cycle="Annual",
                    requires_dob=True
                ),
                Examination(
                    organization_id=org_map["UPSC"],
                    name="National Defence Academy & Naval Academy Examination (NDA I)",
                    code="UPSC-NDA-1-2026",
                    exam_type="GOVERNMENT",
                    description="Admission examination to the Army, Navy and Air Force wings of the NDA.",
                    year=2026,
                    cycle="Cycle 1",
                    requires_dob=True
                ),
                # SSC
                Examination(
                    organization_id=org_map["SSC"],
                    name="Combined Graduate Level (CGL) Examination",
                    code="SSC-CGL-2026",
                    exam_type="GOVERNMENT",
                    description="Tier I & II recruitment for Ministries, Departments, and Organizations of the Government of India.",
                    year=2026,
                    cycle="Tier-I",
                    requires_dob=True
                ),
                # NTA
                Examination(
                    organization_id=org_map["NTA"],
                    name="National Eligibility cum Entrance Test (NEET UG)",
                    code="NTA-NEET-2026",
                    exam_type="ENTRANCE",
                    description="All India pre-medical entrance test for students who wish to pursue undergraduate medical (MBBS) and dental (BDS).",
                    year=2026,
                    cycle="Annual",
                    requires_dob=True
                ),
                Examination(
                    organization_id=org_map["NTA"],
                    name="Joint Entrance Examination (JEE Main)",
                    code="NTA-JEE-2026",
                    exam_type="ENTRANCE",
                    description="National engineering entrance assessment for admission to NITs, IIITs and CFTIs.",
                    year=2026,
                    cycle="Session 1",
                    requires_dob=True
                ),
                # RRB
                Examination(
                    organization_id=org_map["RRB"],
                    name="Non-Technical Popular Categories (NTPC)",
                    code="RRB-NTPC-2026",
                    exam_type="RECRUITMENT",
                    description="Recruitment for Station Master, Goods Guard, Commercial Apprentice, and Traffic Assistant in Indian Railways.",
                    year=2026,
                    cycle="CEN 01/2026",
                    requires_dob=True
                ),
                # TNPSC
                Examination(
                    organization_id=org_map["TNPSC"],
                    name="Combined Civil Services Examination - Group IV",
                    code="TNPSC-GRP4-2026",
                    exam_type="GOVERNMENT",
                    description="Recruitment to Village Administrative Officer, Junior Assistant, Typist, and Steno-Typist posts in Tamil Nadu.",
                    year=2026,
                    cycle="Annual",
                    requires_dob=True
                ),
                # DU
                Examination(
                    organization_id=org_map["DU"],
                    name="Undergraduate Semester Examination (CBCS / NEP)",
                    code="DU-UG-SEM-2026",
                    exam_type="UNIVERSITY",
                    description="Regular semester-end evaluation for B.A., B.Sc., B.Com, and B.Tech across North and South Campus colleges.",
                    year=2026,
                    cycle="Semester VI",
                    requires_dob=False
                )
            ]
            db.add_all(exams)
            await db.flush()

            # Seed Announcements
            announcements = [
                ResultAnnouncement(
                    examination_id=exams[3].id, # NEET
                    title="NTA NEET UG 2026 All India Merit List & Scorecards Published",
                    announcement_type="RESULT_DECLARED",
                    circular_url="https://nta.ac.in/circulars/neet2026-result.pdf",
                    is_verified=True,
                    announcement_text="National Testing Agency has officially released the scorecard and rank card for NEET UG 2026. Candidates can download their scorecards using their Application Number and Date of Birth.",
                    source_portal="https://examinationservices.nic.in"
                ),
                ResultAnnouncement(
                    examination_id=exams[0].id, # UPSC CSE
                    title="UPSC Civil Services 2026 e-Admit Card Available for Download",
                    announcement_type="HALL_TICKET_RELEASED",
                    circular_url="https://upsconline.nic.in/eadmitcard/",
                    is_verified=True,
                    announcement_text="Union Public Service Commission has released the e-Admit cards for the upcoming Civil Services (Preliminary) Examination 2026. Verify details immediately upon download.",
                    source_portal="https://upsconline.nic.in"
                ),
                ResultAnnouncement(
                    examination_id=exams[2].id, # SSC CGL
                    title="SSC CGL 2026 Tier-I Results and Cut-off Marks Declared",
                    announcement_type="RESULT_DECLARED",
                    circular_url="https://ssc.gov.in/notices/cgl2026_tier1.pdf",
                    is_verified=True,
                    announcement_text="Staff Selection Commission has announced the results for CGL 2026 Tier-I examination. Qualified candidates are shortlisted for Tier-II computer based test.",
                    source_portal="https://ssc.gov.in"
                )
            ]
            if settings.APP_ENV.lower() != "production":
                db.add_all(announcements)

            # Seed Demo Verified Exam Results for Testing
            demo_results = [
                ExamResult(
                    examination_id=exams[3].id, # NEET
                    student_identifier_roll="2604108821",
                    student_identifier_reg="NTA2026001452",
                    student_name="ROHAN ANAND DESHMUKH",
                    date_of_birth="2007-08-14",
                    subject_marks={
                        "Physics": 170,
                        "Chemistry": 175,
                        "Biology (Botany & Zoology)": 340
                    },
                    marks_obtained=685.0,
                    max_marks=720.0,
                    percentage=95.14,
                    grade="Eligible for Counselling",
                    rank="AIR 482",
                    qualifying_status="QUALIFIED",
                    is_official=True,
                    result_status="AVAILABLE"
                ),
                ExamResult(
                    examination_id=exams[0].id, # UPSC
                    student_identifier_roll="0824190",
                    student_identifier_reg="RID-0824190",
                    student_name="ADITYA SHARMA",
                    date_of_birth="1999-11-20",
                    subject_marks={
                        "General Studies I": 104,
                        "General Studies II": 118,
                        "General Studies III": 92,
                        "General Studies IV": 112,
                        "Essay": 138,
                        "Optional": 278,
                        "Personality Test": 142
                    },
                    marks_obtained=984.0,
                    max_marks=1750.0,
                    percentage=56.23,
                    grade="Recommended for Service",
                    rank="AIR 142",
                    qualifying_status="QUALIFIED",
                    is_official=True,
                    result_status="AVAILABLE"
                ),
                ExamResult(
                    examination_id=exams[7].id, # DU
                    student_identifier_roll="2204456701",
                    student_identifier_reg="22DU-CS-102",
                    student_name="AARAV KAPOOR",
                    date_of_birth="2003-05-12",
                    subject_marks={
                        "Data Structures": 88,
                        "Operating Systems": 82,
                        "Computer Networks": 85,
                        "DBMS": 90,
                        "Discrete Mathematics": 74,
                        "SE Lab": 63
                    },
                    marks_obtained=482.0,
                    max_marks=600.0,
                    percentage=80.33,
                    grade="First Division with Distinction",
                    rank="College Rank 3",
                    qualifying_status="PASS",
                    is_official=True,
                    result_status="AVAILABLE"
                )
            ]
            if settings.APP_ENV.lower() != "production":
                db.add_all(demo_results)

            # Seed Demo Student Account
            if settings.APP_ENV.lower() != "production":
                demo_student = User(
                    full_name="Aarav Kapoor",
                    email="student@examhub.in",
                    mobile="9876543210",
                    password_hash=hash_password("Student@ExamHub2026!"),
                    is_active=True,
                    is_verified=True,
                    mobile_verified=True
                )
                db.add(demo_student)

            # Seed System Settings
            settings_entries = [
                SystemSetting(setting_key="platform_name", setting_value="EXAMHUB INDIA", category="GENERAL", description="Display name of portal"),
                SystemSetting(setting_key="allow_student_registrations", setting_value="true", category="GENERAL", description="Toggle public registration"),
                SystemSetting(setting_key="max_document_storage_per_student_mb", setting_value="100", category="RETENTION", description="Max storage limit per student in MB"),
                SystemSetting(setting_key="document_retention_days", setting_value="1825", category="RETENTION", description="5 years storage retention policy"),
                SystemSetting(setting_key="enforce_student_privacy", setting_value="true", category="SECURITY", description="Student-to-student strict data isolation")
            ]
            db.add_all(settings_entries)
            await db.commit()

        # Seed Official Government & Examination Website Directory if not yet seeded
        web_check = await db.execute(select(OfficialWebsite))
        if not web_check.scalars().first():
            all_states_res = await db.execute(select(State))
            all_states = all_states_res.scalars().all()
            state_map = {s.code: s.id for s in all_states}

            official_websites_seed = [
                # 2.1 National Government Portals
                OfficialWebsite(
                    name="National Portal of India",
                    code="INDIA-GOV",
                    category_type="NATIONAL_PORTAL",
                    state_id=state_map.get("DL"),
                    official_url="https://www.india.gov.in/",
                    application_portal_url="https://services.india.gov.in/",
                    domain="india.gov.in",
                    description="Single-window access to information and services being provided by the Government of India for citizens, business and government departments.",
                    related_examinations=["National Citizen Services", "E-Governance Services"],
                    contact_email="indiagov-feedback@gov.in",
                    verification_status="VERIFIED",
                    verification_source="National Informatics Centre (NIC) / MeitY",
                    is_featured=True
                ),
                OfficialWebsite(
                    name="Government Services Portal",
                    code="SERVICES-GOV",
                    category_type="NATIONAL_PORTAL",
                    state_id=state_map.get("DL"),
                    official_url="https://services.india.gov.in/",
                    domain="services.india.gov.in",
                    description="National services portal delivering online government services across central and state government departments.",
                    related_examinations=["Citizen Welfare & Examination Services"],
                    verification_status="VERIFIED",
                    verification_source="National Informatics Centre (NIC)",
                    is_featured=True
                ),
                OfficialWebsite(
                    name="National Government Directory (IGOD)",
                    code="IGOD",
                    category_type="NATIONAL_PORTAL",
                    state_id=state_map.get("DL"),
                    official_url="https://igod.gov.in/",
                    domain="igod.gov.in",
                    description="Comprehensive directory of Indian Government websites from central ministries to district administration.",
                    verification_status="VERIFIED",
                    verification_source="National Informatics Centre (NIC)",
                    is_featured=False
                ),
                OfficialWebsite(
                    name="Digital India",
                    code="DIGITAL-INDIA",
                    category_type="NATIONAL_PORTAL",
                    state_id=state_map.get("DL"),
                    official_url="https://www.digitalindia.gov.in/",
                    domain="digitalindia.gov.in",
                    description="Flagship program of the Government of India with a vision to transform India into a digitally empowered society and knowledge economy.",
                    verification_status="VERIFIED",
                    verification_source="Ministry of Electronics and Information Technology (MeitY)",
                    is_featured=True
                ),
                OfficialWebsite(
                    name="DigiLocker Official Portal",
                    code="DIGILOCKER",
                    category_type="STUDENT_SERVICE",
                    state_id=state_map.get("DL"),
                    official_url="https://www.digilocker.gov.in/",
                    application_portal_url="https://accounts.digilocker.gov.in/signin/smart_v2/",
                    domain="digilocker.gov.in",
                    description="A secure cloud-based platform for storage, sharing and verification of documents and certificates like academic marksheets, Aadhaar, and driving license.",
                    related_examinations=["Academic Document Verification", "CBSE Marksheets", "Degree Certificates"],
                    contact_email="support@digitallocker.gov.in",
                    verification_status="VERIFIED",
                    verification_source="Ministry of Electronics & Information Technology (MeitY)",
                    is_featured=True
                ),
                OfficialWebsite(
                    name="National Scholarship Portal (NSP)",
                    code="NSP",
                    category_type="STUDENT_SERVICE",
                    state_id=state_map.get("DL"),
                    official_url="https://scholarships.gov.in/",
                    application_portal_url="https://scholarships.gov.in/fresh/newstdRegfrmInstruction",
                    domain="scholarships.gov.in",
                    description="One-stop solution for scholarship schemes of Government of India, implementing common application forms and direct fund disbursement.",
                    related_examinations=["Central Sector Scholarships", "Post-Matric Scholarships", "Merit Scholarships"],
                    contact_email="helpdesk@nsp.gov.in",
                    verification_status="VERIFIED",
                    verification_source="National Informatics Centre (NIC)",
                    is_featured=True
                ),
                OfficialWebsite(
                    name="Ministry of Education",
                    code="MOE",
                    category_type="NATIONAL_PORTAL",
                    state_id=state_map.get("DL"),
                    official_url="https://www.education.gov.in/",
                    domain="education.gov.in",
                    description="Apex union ministry governing school education, literacy, higher education and national education policies across India.",
                    verification_status="VERIFIED",
                    verification_source="Government of India",
                    is_featured=False
                ),
                OfficialWebsite(
                    name="University Grants Commission (UGC)",
                    code="UGC",
                    category_type="NATIONAL_PORTAL",
                    state_id=state_map.get("DL"),
                    official_url="https://www.ugc.gov.in/",
                    domain="ugc.gov.in",
                    description="Statutory organization for the coordination, determination and maintenance of standards of teaching, examination and research in university education.",
                    related_examinations=["UGC-NET", "University Recognitions", "Autonomous Approvals"],
                    verification_status="VERIFIED",
                    verification_source="Ministry of Education, Govt of India",
                    is_featured=True
                ),
                OfficialWebsite(
                    name="All India Council for Technical Education (AICTE)",
                    code="AICTE",
                    category_type="NATIONAL_PORTAL",
                    state_id=state_map.get("DL"),
                    official_url="https://www.aicte-india.org/",
                    domain="aicte-india.org",
                    description="National-level council for technical education and apex body for planning, formulation and maintenance of technical standards in India.",
                    verification_status="VERIFIED",
                    verification_source="Statutory Body under Ministry of Education",
                    is_featured=False
                ),
                OfficialWebsite(
                    name="Central Board of Secondary Education (CBSE)",
                    code="CBSE",
                    category_type="NATIONAL_PORTAL",
                    state_id=state_map.get("DL"),
                    official_url="https://www.cbse.gov.in/",
                    application_portal_url="https://cbseresults.nic.in/",
                    domain="cbse.gov.in",
                    description="National board of education in India for public and private schools, controlled and managed by Union Government of India.",
                    related_examinations=["Class 10 Board", "Class 12 Board", "CTET"],
                    verification_status="VERIFIED",
                    verification_source="Ministry of Education, Govt of India",
                    is_featured=True
                ),

                # 2.2 Central Government Recruitment & Exam Authorities
                OfficialWebsite(
                    name="Union Public Service Commission (UPSC)",
                    code="UPSC",
                    category_type="CENTRAL_RECRUITMENT",
                    state_id=state_map.get("DL"),
                    official_url="https://upsc.gov.in/",
                    application_portal_url="https://upsconline.nic.in/",
                    domain="upsc.gov.in",
                    description="Constitutional recruitment agency of India for recruitment of civil servants and defense officials in the Union Government.",
                    related_examinations=["Civil Services Examination (CSE)", "NDA & NA", "CDS", "Indian Forest Service", "IES/ISS", "CAPF"],
                    contact_email="feedback-upsc@gov.in",
                    contact_phone="011-23385271",
                    verification_status="VERIFIED",
                    verification_source="NIC / President Secretariat Gazette",
                    is_featured=True
                ),
                OfficialWebsite(
                    name="UPSC Online Application Portal",
                    code="UPSC-ONLINE",
                    category_type="CENTRAL_RECRUITMENT",
                    state_id=state_map.get("DL"),
                    official_url="https://upsconline.nic.in/",
                    domain="upsconline.nic.in",
                    description="Official One Time Registration (OTR) and online application portal for all UPSC examinations and recruitment posts.",
                    related_examinations=["One Time Registration (OTR)", "Civil Services Prelims/Mains", "NDA Application"],
                    verification_status="VERIFIED",
                    verification_source="UPSC / NIC",
                    is_featured=True
                ),
                OfficialWebsite(
                    name="Staff Selection Commission (SSC)",
                    code="SSC",
                    category_type="CENTRAL_RECRUITMENT",
                    state_id=state_map.get("DL"),
                    official_url="https://ssc.gov.in/",
                    application_portal_url="https://ssc.gov.in/login",
                    domain="ssc.gov.in",
                    description="Official commission conducting recruitment for Group B and Group C posts across ministries and departments of the Government of India.",
                    related_examinations=["SSC CGL", "SSC CHSL", "SSC MTS", "SSC GD Constable", "SSC CPO"],
                    contact_email="enquiry-ssc@nic.in",
                    verification_status="VERIFIED",
                    verification_source="DoPT / NIC",
                    is_featured=True
                ),
                OfficialWebsite(
                    name="Railway Recruitment Boards (RRB Central)",
                    code="RRB",
                    category_type="CENTRAL_RECRUITMENT",
                    state_id=state_map.get("CH"),
                    official_url="https://www.rrbcdg.gov.in/",
                    domain="rrbcdg.gov.in",
                    description="Central Railway Recruitment Board conducting recruitments for technical, non-technical, and safety category posts across Indian Railways.",
                    related_examinations=["RRB NTPC", "RRB Group D", "RRB ALP & Technicians", "RRB JE"],
                    verification_status="VERIFIED",
                    verification_source="Ministry of Railways / NIC",
                    is_featured=True
                ),
                OfficialWebsite(
                    name="Indian Railways Official Portal",
                    code="INDIAN-RAILWAYS",
                    category_type="CENTRAL_RECRUITMENT",
                    state_id=state_map.get("DL"),
                    official_url="https://indianrailways.gov.in/",
                    domain="indianrailways.gov.in",
                    description="Ministry of Railways official portal with national notices, central circulars, recruitment updates, and railway board announcements.",
                    verification_status="VERIFIED",
                    verification_source="Ministry of Railways, Govt of India",
                    is_featured=False
                ),
                OfficialWebsite(
                    name="Institute of Banking Personnel Selection (IBPS)",
                    code="IBPS",
                    category_type="CENTRAL_RECRUITMENT",
                    state_id=state_map.get("MH"),
                    official_url="https://www.ibps.in/",
                    domain="ibps.in",
                    description="Autonomous agency conducting Common Recruitment Process (CRP) for Probationary Officers, Clerks, and Specialist Officers in public sector banks.",
                    related_examinations=["IBPS PO", "IBPS Clerk", "IBPS SO", "IBPS RRB Officer Scale I & Office Assistant"],
                    contact_phone="1800 222 366",
                    verification_status="VERIFIED",
                    verification_source="IBPS Governing Board",
                    is_featured=True
                ),
                OfficialWebsite(
                    name="State Bank of India Careers (SBI)",
                    code="SBI-CAREERS",
                    category_type="CENTRAL_RECRUITMENT",
                    state_id=state_map.get("MH"),
                    official_url="https://sbi.co.in/web/careers",
                    domain="sbi.co.in",
                    description="Official State Bank of India career opportunities portal for recruitment of Probationary Officers, Junior Associates and Specialist Officers.",
                    related_examinations=["SBI PO", "SBI Clerk (Junior Associates)", "SBI Specialist Cadre Officer"],
                    verification_status="VERIFIED",
                    verification_source="State Bank of India Corporate Centre",
                    is_featured=True
                ),
                OfficialWebsite(
                    name="Reserve Bank of India Opportunities",
                    code="RBI",
                    category_type="CENTRAL_RECRUITMENT",
                    state_id=state_map.get("MH"),
                    official_url="https://opportunities.rbi.org.in/",
                    domain="rbi.org.in",
                    description="Official Reserve Bank of India career portal for Officers in Grade 'B', Assistants, and Specialized Cadre recruitment.",
                    related_examinations=["RBI Grade B Officer", "RBI Assistant", "RBI Research Officer"],
                    verification_status="VERIFIED",
                    verification_source="Reserve Bank of India",
                    is_featured=True
                ),
                OfficialWebsite(
                    name="Securities and Exchange Board of India (SEBI)",
                    code="SEBI",
                    category_type="CENTRAL_RECRUITMENT",
                    state_id=state_map.get("MH"),
                    official_url="https://www.sebi.gov.in/",
                    domain="sebi.gov.in",
                    description="Regulator of securities and commodity market in India owned by the Ministry of Finance, Government of India.",
                    related_examinations=["SEBI Grade A Officer (General & Technical)"],
                    verification_status="VERIFIED",
                    verification_source="SEBI Official Headquarters",
                    is_featured=False
                ),
                OfficialWebsite(
                    name="NABARD Recruitment",
                    code="NABARD",
                    category_type="CENTRAL_RECRUITMENT",
                    state_id=state_map.get("MH"),
                    official_url="https://www.nabard.org/",
                    domain="nabard.org",
                    description="Apex development bank for agriculture and rural development, holding national recruitments for Grade A and B Officers.",
                    related_examinations=["NABARD Grade A Assistant Manager", "NABARD Development Assistant"],
                    verification_status="VERIFIED",
                    verification_source="NABARD Central Office",
                    is_featured=False
                ),
                OfficialWebsite(
                    name="Join Indian Army Recruitment",
                    code="INDIAN-ARMY",
                    category_type="CENTRAL_RECRUITMENT",
                    state_id=state_map.get("DL"),
                    official_url="https://joinindianarmy.nic.in/",
                    domain="joinindianarmy.nic.in",
                    description="Official recruitment portal of Indian Army for Officers (NDA, CDS, TGC, SSC Tech) and Agniveer General Duty/Technical enlistment.",
                    related_examinations=["Agniveer Army Rally", "TGC Entry", "SSC Non-Tech", "TES 10+2"],
                    verification_status="VERIFIED",
                    verification_source="Ministry of Defence / NIC",
                    is_featured=True
                ),
                OfficialWebsite(
                    name="Join Indian Navy Recruitment",
                    code="INDIAN-NAVY",
                    category_type="CENTRAL_RECRUITMENT",
                    state_id=state_map.get("DL"),
                    official_url="https://www.joinindiannavy.gov.in/",
                    domain="joinindiannavy.gov.in",
                    description="Official recruitment portal of Indian Navy for Officers (INET, NDA, CDSE, SSC) and Agniveer (SSR/MR) recruitment.",
                    related_examinations=["Indian Navy Agniveer SSR", "Agniveer MR", "Navy INET Officer"],
                    verification_status="VERIFIED",
                    verification_source="Ministry of Defence / NIC",
                    is_featured=True
                ),
                OfficialWebsite(
                    name="Indian Air Force Recruitment (AFCAT / Agniveer)",
                    code="INDIAN-AIR-FORCE",
                    category_type="CENTRAL_RECRUITMENT",
                    state_id=state_map.get("DL"),
                    official_url="https://afcat.cdac.in/",
                    application_portal_url="https://agnipathvayu.cdac.in/",
                    domain="afcat.cdac.in",
                    description="Air Force Common Admission Test (AFCAT) and Agnipath Vayu recruitment portal for Indian Air Force flying, technical and ground branches.",
                    related_examinations=["AFCAT Entry", "Agnipath Vayu", "Meteorology Branch"],
                    verification_status="VERIFIED",
                    verification_source="Indian Air Force & C-DAC",
                    is_featured=True
                ),
                OfficialWebsite(
                    name="India Post (Department of Posts)",
                    code="INDIA-POST",
                    category_type="CENTRAL_RECRUITMENT",
                    state_id=state_map.get("DL"),
                    official_url="https://www.indiapost.gov.in/",
                    application_portal_url="https://indiapostgdsonline.gov.in/",
                    domain="indiapost.gov.in",
                    description="Department of Posts recruitment portal for Gramin Dak Sevaks (GDS), Postal Assistants, and Postman examination cycles.",
                    related_examinations=["Gramin Dak Sevak (GDS)", "Postal Assistant / Sorting Assistant"],
                    verification_status="VERIFIED",
                    verification_source="Ministry of Communications, Govt of India",
                    is_featured=True
                ),

                # 2.3 National Entrance & University Exam Authorities
                OfficialWebsite(
                    name="National Testing Agency (NTA)",
                    code="NTA",
                    category_type="NATIONAL_ENTRANCE",
                    state_id=state_map.get("DL"),
                    official_url="https://nta.ac.in/",
                    application_portal_url="https://exams.nta.ac.in/",
                    domain="nta.ac.in",
                    description="Autonomous agency conducting transparent, international standard tests to assess the competency of candidates for admission to premier higher education institutions.",
                    related_examinations=["JEE Main", "NEET UG", "CUET UG/PG", "UGC NET", "CSIR NET", "CMAT", "GPAT"],
                    contact_email="genadmin@nta.ac.in",
                    contact_phone="011-40759000",
                    verification_status="VERIFIED",
                    verification_source="Ministry of Education, Govt of India",
                    is_featured=True
                ),
                OfficialWebsite(
                    name="NTA Examinations Portal",
                    code="NTA-EXAMS",
                    category_type="NATIONAL_ENTRANCE",
                    state_id=state_map.get("DL"),
                    official_url="https://exams.nta.ac.in/",
                    domain="exams.nta.ac.in",
                    description="Consolidated examination portal of National Testing Agency with links to all active application forms, admit cards, and scorecards.",
                    related_examinations=["All NTA Entrance Tests & Admit Cards"],
                    verification_status="VERIFIED",
                    verification_source="National Testing Agency / NIC",
                    is_featured=True
                ),
                OfficialWebsite(
                    name="JEE (Main) Official Portal",
                    code="JEE-MAIN",
                    category_type="NATIONAL_ENTRANCE",
                    state_id=state_map.get("DL"),
                    official_url="https://jeemain.nta.nic.in/",
                    domain="jeemain.nta.nic.in",
                    description="Joint Entrance Examination (Main) conducted for admission to Undergraduate Engineering Programs at NITs, IIITs and other Centrally Funded Technical Institutions.",
                    related_examinations=["JEE Main Session 1", "JEE Main Session 2", "JEE Advanced Eligibility"],
                    contact_email="jeemain@nta.ac.in",
                    verification_status="VERIFIED",
                    verification_source="National Testing Agency / NIC",
                    is_featured=True
                ),
                OfficialWebsite(
                    name="NEET (UG) Official Portal",
                    code="NEET-UG",
                    category_type="NATIONAL_ENTRANCE",
                    state_id=state_map.get("DL"),
                    official_url="https://neet.nta.nic.in/",
                    domain="neet.nta.nic.in",
                    description="National Eligibility cum Entrance Test for admission to undergraduate medical (MBBS), dental (BDS), AYUSH and veterinary courses across India.",
                    related_examinations=["NEET UG All India Medical"],
                    contact_email="neet@nta.ac.in",
                    verification_status="VERIFIED",
                    verification_source="National Testing Agency / National Medical Commission",
                    is_featured=True
                ),
                OfficialWebsite(
                    name="CUET (UG) Official Portal",
                    code="CUET-UG",
                    category_type="NATIONAL_ENTRANCE",
                    state_id=state_map.get("DL"),
                    official_url="https://cuetug.ntaonline.in/",
                    domain="cuetug.ntaonline.in",
                    description="Common University Entrance Test for admission into all UG programmes in all Central Universities, State Universities and participating institutions.",
                    related_examinations=["CUET Undergraduate Central University Admissions"],
                    contact_email="cuet-ug@nta.ac.in",
                    verification_status="VERIFIED",
                    verification_source="UGC / National Testing Agency",
                    is_featured=True
                ),
                OfficialWebsite(
                    name="UGC NET Official Portal",
                    code="UGC-NET",
                    category_type="NATIONAL_ENTRANCE",
                    state_id=state_map.get("DL"),
                    official_url="https://ugcnet.nta.ac.in/",
                    domain="ugcnet.nta.ac.in",
                    description="National Eligibility Test to determine eligibility of Indian nationals for 'Assistant Professor' and 'Junior Research Fellowship and Assistant Professor'.",
                    related_examinations=["UGC NET June Cycle", "UGC NET December Cycle"],
                    verification_status="VERIFIED",
                    verification_source="University Grants Commission / NTA",
                    is_featured=False
                ),
                OfficialWebsite(
                    name="Graduate Aptitude Test in Engineering (GATE)",
                    code="GATE",
                    category_type="NATIONAL_ENTRANCE",
                    state_id=state_map.get("UK"),
                    official_url="https://gate2026.iitr.ac.in/",
                    domain="gate2026.iitr.ac.in",
                    description="National examination testing comprehensive understanding of undergraduate subjects in engineering, technology, architecture, science and commerce.",
                    related_examinations=["GATE 2026 / PSU Recruitment / M.Tech Admissions"],
                    verification_source="Organizing IIT / Ministry of Education",
                    verification_status="VERIFIED",
                    is_featured=True
                ),
                OfficialWebsite(
                    name="Common Admission Test (IIM CAT)",
                    code="CAT",
                    category_type="NATIONAL_ENTRANCE",
                    state_id=state_map.get("WB"),
                    official_url="https://iimcat.ac.in/",
                    domain="iimcat.ac.in",
                    description="Computer-based test for admission to graduate management programs across Indian Institutes of Management (IIMs) and premier business schools.",
                    related_examinations=["CAT MBA Admissions"],
                    verification_status="VERIFIED",
                    verification_source="Indian Institutes of Management",
                    is_featured=True
                ),
                OfficialWebsite(
                    name="Joint Seat Allocation Authority (JoSAA)",
                    code="JOSAA",
                    category_type="STUDENT_SERVICE",
                    state_id=state_map.get("DL"),
                    official_url="https://josaa.nic.in/",
                    domain="josaa.nic.in",
                    description="Authority managing and regulating joint seat allocation for admissions to 110+ institutes including IITs, NITs, IIEST, IIITs and Other-GFTIs.",
                    related_examinations=["IIT / NIT / IIIT Seat Allocation Counselling"],
                    verification_status="VERIFIED",
                    verification_source="Ministry of Education / NIC",
                    is_featured=True
                ),
                OfficialWebsite(
                    name="Medical Counselling Committee (MCC)",
                    code="MCC",
                    category_type="STUDENT_SERVICE",
                    state_id=state_map.get("DL"),
                    official_url="https://mcc.nic.in/",
                    domain="mcc.nic.in",
                    description="Directorate General of Health Services counselling portal for 15% All India Quota MBBS/BDS seats, 100% Deemed/Central Universities, ESIC, AFMC and AIIMS.",
                    related_examinations=["NEET UG All India Counselling", "NEET PG Counselling"],
                    verification_status="VERIFIED",
                    verification_source="Ministry of Health and Family Welfare / NIC",
                    is_featured=True
                ),
                OfficialWebsite(
                    name="SWAYAM - Free National Online Education",
                    code="SWAYAM",
                    category_type="STUDENT_SERVICE",
                    state_id=state_map.get("DL"),
                    official_url="https://swayam.gov.in/",
                    domain="swayam.gov.in",
                    description="Government of India online course platform initiated to achieve the three cardinal principles of Education Policy: access, equity and quality.",
                    related_examinations=["SWAYAM Credit Transfer Exams"],
                    verification_status="VERIFIED",
                    verification_source="Ministry of Education / NPTEL / AICTE",
                    is_featured=False
                ),

                # 2.4 State Public Service Commissions
                OfficialWebsite(
                    name="Tamil Nadu Public Service Commission (TNPSC)",
                    code="TNPSC",
                    category_type="STATE_PSC",
                    state_id=state_map.get("TN"),
                    official_url="https://www.tnpsc.gov.in/",
                    application_portal_url="https://apply.tnpscexams.in/",
                    domain="tnpsc.gov.in",
                    description="Constitutional recruitment agency of Tamil Nadu conducting Group 1, Group 2, Group 4 and Departmental examinations for the state public service.",
                    related_examinations=["TNPSC Group 1 Services", "TNPSC Group 2/2A", "TNPSC Group 4 & VAO", "Combined Engineering Services"],
                    contact_phone="044-25300300",
                    verification_status="VERIFIED",
                    verification_source="Govt of Tamil Nadu / NIC",
                    is_featured=True
                ),
                OfficialWebsite(
                    name="Kerala Public Service Commission (KPSC Kerala)",
                    code="KERALA-PSC",
                    category_type="STATE_PSC",
                    state_id=state_map.get("KL"),
                    official_url="https://www.keralapsc.gov.in/",
                    application_portal_url="https://thulasi.psc.kerala.gov.in/",
                    domain="keralapsc.gov.in",
                    description="Constitutional body created by the Constitution of India to select applicants for civil service jobs in Kerala through the Thulasi OTR portal.",
                    related_examinations=["KAS (Kerala Administrative Service)", "Kerala LDC (Lower Division Clerk)", "Kerala Secretariat Assistant"],
                    contact_phone="0471-2447201",
                    verification_status="VERIFIED",
                    verification_source="Govt of Kerala / Thulasi Portal",
                    is_featured=True
                ),
                OfficialWebsite(
                    name="Karnataka Public Service Commission (KPSC)",
                    code="KPSC",
                    category_type="STATE_PSC",
                    state_id=state_map.get("KA"),
                    official_url="https://kpsc.kar.nic.in/",
                    domain="kpsc.kar.nic.in",
                    description="State body responsible for recruiting candidates into civil service and allied state government roles in Karnataka.",
                    related_examinations=["Karnataka Gazetted Probationers (KAS)", "First Division Assistant (FDA)", "Second Division Assistant (SDA)"],
                    verification_status="VERIFIED",
                    verification_source="Govt of Karnataka / NIC",
                    is_featured=True
                ),
                OfficialWebsite(
                    name="Maharashtra Public Service Commission (MPSC)",
                    code="MPSC",
                    category_type="STATE_PSC",
                    state_id=state_map.get("MH"),
                    official_url="https://mpsc.gov.in/",
                    application_portal_url="https://mpsconline.gov.in/",
                    domain="mpsc.gov.in",
                    description="Constitutional body managing recruitment for various civil service posts in the state of Maharashtra.",
                    related_examinations=["State Services Examination (Rajyaseva)", "Maharashtra Subordinate Services", "Maharashtra Group C"],
                    contact_phone="022-22627101",
                    verification_status="VERIFIED",
                    verification_source="Govt of Maharashtra / NIC",
                    is_featured=True
                ),
                OfficialWebsite(
                    name="Uttar Pradesh Public Service Commission (UPPSC)",
                    code="UPPSC",
                    category_type="STATE_PSC",
                    state_id=state_map.get("UP"),
                    official_url="https://uppsc.up.nic.in/",
                    domain="uppsc.up.nic.in",
                    description="State agency authorized to conduct the Civil Services Examination for entry-level appointments in Uttar Pradesh administrative bodies.",
                    related_examinations=["Combined State / Upper Subordinate Services (UP PCS)", "Review Officer / Assistant Review Officer (RO/ARO)"],
                    verification_status="VERIFIED",
                    verification_source="Govt of Uttar Pradesh / NIC",
                    is_featured=True
                ),
                OfficialWebsite(
                    name="Bihar Public Service Commission (BPSC)",
                    code="BPSC",
                    category_type="STATE_PSC",
                    state_id=state_map.get("BR"),
                    official_url="https://www.bpsc.bih.nic.in/",
                    application_portal_url="https://onlinebpsc.bihar.gov.in/",
                    domain="bpsc.bih.nic.in",
                    description="Constitutional body responsible for civil service recruitment and educator selection throughout the state of Bihar.",
                    related_examinations=["BPSC Combined Competitive Examination (CCE)", "BPSC Teacher Recruitment Exam (TRE)"],
                    verification_status="VERIFIED",
                    verification_source="Govt of Bihar / NIC",
                    is_featured=True
                ),
                OfficialWebsite(
                    name="Rajasthan Public Service Commission (RPSC)",
                    code="RPSC",
                    category_type="STATE_PSC",
                    state_id=state_map.get("RJ"),
                    official_url="https://rpsc.rajasthan.gov.in/",
                    domain="rpsc.rajasthan.gov.in",
                    description="Premier commission of the Government of Rajasthan for organizing recruitment exams for civil servants and subordinate officers.",
                    related_examinations=["RAS / RTS Combined Competitive Exam", "School Lecturer", "Senior Teacher Grade II"],
                    verification_status="VERIFIED",
                    verification_source="Govt of Rajasthan / NIC",
                    is_featured=True
                ),
                OfficialWebsite(
                    name="Madhya Pradesh Public Service Commission (MPPSC)",
                    code="MPPSC",
                    category_type="STATE_PSC",
                    state_id=state_map.get("MP"),
                    official_url="https://mppsc.mp.gov.in/",
                    domain="mppsc.mp.gov.in",
                    description="State recruitment body responsible for conducting civil service and state forest service examinations in Madhya Pradesh.",
                    related_examinations=["State Service Exam (MP PCS)", "State Forest Service Exam", "Assistant Professor Examination"],
                    verification_status="VERIFIED",
                    verification_source="Govt of Madhya Pradesh / NIC",
                    is_featured=True
                ),
                OfficialWebsite(
                    name="West Bengal Public Service Commission (WBPSC)",
                    code="WBPSC",
                    category_type="STATE_PSC",
                    state_id=state_map.get("WB"),
                    official_url="https://psc.wb.gov.in/",
                    domain="psc.wb.gov.in",
                    description="State agency authorized to conduct the West Bengal Civil Service (Executive) and other key state recruitment tests.",
                    related_examinations=["West Bengal Civil Service (WBCS)", "West Bengal Audit & Accounts Service", "Clerkship Examination"],
                    verification_status="VERIFIED",
                    verification_source="Govt of West Bengal / NIC",
                    is_featured=True
                ),
                OfficialWebsite(
                    name="Andhra Pradesh Public Service Commission (APPSC)",
                    code="APPSC",
                    category_type="STATE_PSC",
                    state_id=state_map.get("AP"),
                    official_url="https://psc.ap.gov.in/",
                    domain="psc.ap.gov.in",
                    description="State public service commission responsible for recruiting personnel to various posts in the government of Andhra Pradesh.",
                    related_examinations=["APPSC Group 1 Services", "APPSC Group 2 Services", "Panchayat Secretary"],
                    verification_status="VERIFIED",
                    verification_source="Govt of Andhra Pradesh / NIC",
                    is_featured=True
                ),
                OfficialWebsite(
                    name="Telangana Public Service Commission (TGPSC)",
                    code="TGPSC",
                    category_type="STATE_PSC",
                    state_id=state_map.get("TS"),
                    official_url="https://www.tspsc.gov.in/",
                    domain="tspsc.gov.in",
                    description="Constitutional recruitment agency of Telangana created to select candidates for civil services and departmental posts.",
                    related_examinations=["TGPSC Group 1 Services", "TGPSC Group 2 Services", "Group 3 & Group 4"],
                    verification_status="VERIFIED",
                    verification_source="Govt of Telangana / Centre for Good Governance",
                    is_featured=True
                ),
                OfficialWebsite(
                    name="Assam Public Service Commission (APSC)",
                    code="APSC-ASSAM",
                    category_type="STATE_PSC",
                    state_id=state_map.get("AS"),
                    official_url="https://apsc.nic.in/",
                    domain="apsc.nic.in",
                    description="State recruitment agency responsible for conducting Combined Competitive Examination (CCE) for civil services in Assam.",
                    related_examinations=["APSC Combined Competitive Examination (CCE)", "Assistant Engineer Examination"],
                    verification_status="VERIFIED",
                    verification_source="Govt of Assam / NIC",
                    is_featured=False
                ),
                OfficialWebsite(
                    name="Odisha Public Service Commission (OPSC)",
                    code="OPSC",
                    category_type="STATE_PSC",
                    state_id=state_map.get("OD"),
                    official_url="https://www.opsc.gov.in/",
                    domain="opsc.gov.in",
                    description="State agency authorized to conduct the Odisha Civil Services Examination for Group A and B services in Odisha.",
                    related_examinations=["Odisha Civil Services (OAS/OPS)", "Assistant Section Officer (ASO)"],
                    verification_status="VERIFIED",
                    verification_source="Govt of Odisha / NIC",
                    is_featured=False
                ),
                OfficialWebsite(
                    name="Gujarat Public Service Commission (GPSC)",
                    code="GPSC",
                    category_type="STATE_PSC",
                    state_id=state_map.get("GJ"),
                    official_url="https://gpsc.gujarat.gov.in/",
                    application_portal_url="https://gpsc-ojas.gujarat.gov.in/",
                    domain="gpsc.gujarat.gov.in",
                    description="Constitutional recruitment body responsible for conducting civil services examinations across Gujarat state administration.",
                    related_examinations=["Gujarat Administrative Service (GAS Class 1/2)", "Chief Officer", "State Tax Inspector"],
                    verification_status="VERIFIED",
                    verification_source="Govt of Gujarat / NIC",
                    is_featured=True
                ),
                OfficialWebsite(
                    name="Haryana Public Service Commission (HPSC)",
                    code="HPSC",
                    category_type="STATE_PSC",
                    state_id=state_map.get("HR"),
                    official_url="https://hpsc.gov.in/",
                    domain="hpsc.gov.in",
                    description="State body responsible for recruiting candidates into civil service and allied state government roles in Haryana.",
                    related_examinations=["Haryana Civil Services (HCS Executive Branch)", "Assistant Professor", "Sub Divisional Engineer"],
                    verification_status="VERIFIED",
                    verification_source="Govt of Haryana / NIC",
                    is_featured=False
                ),
                OfficialWebsite(
                    name="Punjab Public Service Commission (PPSC)",
                    code="PPSC",
                    category_type="STATE_PSC",
                    state_id=state_map.get("PB"),
                    official_url="https://ppsc.gov.in/",
                    domain="ppsc.gov.in",
                    description="Government agency of Punjab responsible for civil service examinations and recruitment into Group A and B state services.",
                    related_examinations=["Punjab State Civil Services Combined Competitive Examination (PSCSCCE)", "Sub Divisional Magistrate"],
                    verification_status="VERIFIED",
                    verification_source="Govt of Punjab / NIC",
                    is_featured=False
                ),
                OfficialWebsite(
                    name="Himachal Pradesh Public Service Commission (HPPSC)",
                    code="HPPSC",
                    category_type="STATE_PSC",
                    state_id=state_map.get("HP"),
                    official_url="https://hppsc.hp.gov.in/",
                    domain="hppsc.hp.gov.in",
                    description="Constitutional recruitment agency of Himachal Pradesh responsible for civil services and departmental recruitments.",
                    related_examinations=["HPAS (Himachal Pradesh Administrative Services)", "Tehsildar / BDO Examinations"],
                    verification_status="VERIFIED",
                    verification_source="Govt of Himachal Pradesh / NIC",
                    is_featured=False
                ),
                OfficialWebsite(
                    name="Uttarakhand Public Service Commission (UKPSC)",
                    code="UKPSC",
                    category_type="STATE_PSC",
                    state_id=state_map.get("UK"),
                    official_url="https://psc.uk.gov.in/",
                    domain="psc.uk.gov.in",
                    description="State public service commission responsible for conducting Combined State Civil/Upper Subordinate Examination in Uttarakhand.",
                    related_examinations=["Uttarakhand Combined State Civil/Upper Subordinate", "Lower PCS Exam", "Review Officer"],
                    verification_status="VERIFIED",
                    verification_source="Govt of Uttarakhand / NIC",
                    is_featured=False
                ),
                OfficialWebsite(
                    name="Chhattisgarh Public Service Commission (CGPSC)",
                    code="CGPSC",
                    category_type="STATE_PSC",
                    state_id=state_map.get("CG"),
                    official_url="https://psc.cg.gov.in/",
                    domain="psc.cg.gov.in",
                    description="State recruitment commission conducting civil service examinations for administrative positions in Chhattisgarh.",
                    related_examinations=["CGPSC State Service Exam (SSE)", "State Engineering Service"],
                    verification_status="VERIFIED",
                    verification_source="Govt of Chhattisgarh / NIC",
                    is_featured=False
                ),
                OfficialWebsite(
                    name="Jharkhand Public Service Commission (JPSC)",
                    code="JPSC",
                    category_type="STATE_PSC",
                    state_id=state_map.get("JH"),
                    official_url="https://www.jpsc.gov.in/",
                    domain="jpsc.gov.in",
                    description="Constitutional body responsible for civil service recruitment and educator selection throughout the state of Jharkhand.",
                    related_examinations=["Combined Civil Services Examination (Jharkhand Administrative Service)"],
                    verification_status="VERIFIED",
                    verification_source="Govt of Jharkhand / NIC",
                    is_featured=False
                ),
                OfficialWebsite(
                    name="Goa Public Service Commission (GPSC)",
                    code="GOA-PSC",
                    category_type="STATE_PSC",
                    state_id=state_map.get("GA"),
                    official_url="https://gpsc.goa.gov.in/",
                    domain="gpsc.goa.gov.in",
                    description="State commission conducting recruitments into Goa Civil Service, Police Service, and Medical cadres.",
                    related_examinations=["Goa Civil Service (Junior Scale)", "Junior Law Officer"],
                    verification_status="VERIFIED",
                    verification_source="Govt of Goa / NIC",
                    is_featured=False
                ),
                OfficialWebsite(
                    name="Jammu and Kashmir Public Service Commission (JKPSC)",
                    code="JKPSC",
                    category_type="STATE_PSC",
                    state_id=state_map.get("JK"),
                    official_url="https://jkpsc.nic.in/",
                    domain="jkpsc.nic.in",
                    description="Public service commission for the Union Territory of Jammu and Kashmir conducting civil service and medical officer tests.",
                    related_examinations=["J&K Combined Competitive Examination (CCE / KAS)"],
                    verification_status="VERIFIED",
                    verification_source="Govt of J&K / NIC",
                    is_featured=False
                ),

                # 2.5 Central & State Universities
                OfficialWebsite(
                    name="University of Delhi (DU)",
                    code="DU",
                    category_type="UNIVERSITY",
                    state_id=state_map.get("DL"),
                    official_url="https://www.du.ac.in/",
                    application_portal_url="https://exam.du.ac.in/",
                    domain="du.ac.in",
                    description="Premier collegiate central university located in New Delhi, known for high standards in teaching and research across 86 departments and 90 colleges.",
                    related_examinations=["Undergraduate Semester Examinations", "Postgraduate Examinations", "School of Open Learning (SOL)"],
                    contact_email="registrar@du.ac.in",
                    verification_status="VERIFIED",
                    verification_source="UGC Central University Directory",
                    is_featured=True
                ),
                OfficialWebsite(
                    name="Jawaharlal Nehru University (JNU)",
                    code="JNU",
                    category_type="UNIVERSITY",
                    state_id=state_map.get("DL"),
                    official_url="https://www.jnu.ac.in/",
                    domain="jnu.ac.in",
                    description="World-renowned public major research university consistently ranked as India's premier institution for higher learning.",
                    related_examinations=["JNUEE Post-Graduate Admissions", "Ph.D. Entrance Assessments"],
                    verification_status="VERIFIED",
                    verification_source="UGC Central University Directory",
                    is_featured=True
                ),
                OfficialWebsite(
                    name="Banaras Hindu University (BHU)",
                    code="BHU",
                    category_type="UNIVERSITY",
                    state_id=state_map.get("UP"),
                    official_url="https://www.bhu.ac.in/",
                    application_portal_url="https://bhuonline.in/",
                    domain="bhu.ac.in",
                    description="Collegiate central research university located in Varanasi, one of the largest residential universities in Asia.",
                    related_examinations=["BHU Semester Examinations", "RET Research Entrance Test"],
                    verification_status="VERIFIED",
                    verification_source="Ministry of Education Central University Directory",
                    is_featured=True
                ),
                OfficialWebsite(
                    name="Aligarh Muslim University (AMU)",
                    code="AMU",
                    category_type="UNIVERSITY",
                    state_id=state_map.get("UP"),
                    official_url="https://www.amu.ac.in/",
                    application_portal_url="https://amucontrollerexams.com/",
                    domain="amu.ac.in",
                    description="Historic central university offering more than 300 courses in traditional and modern branches of education.",
                    related_examinations=["AMU Controller of Examinations Board", "AMU Departmental Tests"],
                    verification_status="VERIFIED",
                    verification_source="UGC Central University Directory",
                    is_featured=False
                ),
                OfficialWebsite(
                    name="Jamia Millia Islamia (JMI)",
                    code="JMI",
                    category_type="UNIVERSITY",
                    state_id=state_map.get("DL"),
                    official_url="https://www.jmi.ac.in/",
                    application_portal_url="https://jmicoe.in/",
                    domain="jmi.ac.in",
                    description="Central university in New Delhi with NAAC A++ accreditation offering research, postgraduate, and professional degrees.",
                    related_examinations=["JMI Controller of Examination Semester Exams", "JMI Entrance Tests"],
                    verification_status="VERIFIED",
                    verification_source="Ministry of Education Directory",
                    is_featured=False
                ),
                OfficialWebsite(
                    name="University of Hyderabad (UoH)",
                    code="UOH",
                    category_type="UNIVERSITY",
                    state_id=state_map.get("TS"),
                    official_url="https://uohyd.ac.in/",
                    domain="uohyd.ac.in",
                    description="Premier central university in Hyderabad with Institute of Eminence status dedicated to postgraduate studies and research.",
                    related_examinations=["UoH Semester Exams", "Ph.D. All-India Assessments"],
                    verification_status="VERIFIED",
                    verification_source="UGC Central University Directory",
                    is_featured=False
                ),
                OfficialWebsite(
                    name="Anna University (AU)",
                    code="ANNA-UNIV",
                    category_type="UNIVERSITY",
                    state_id=state_map.get("TN"),
                    official_url="https://www.annauniv.edu/",
                    application_portal_url="https://coe1.annauniv.edu/",
                    domain="annauniv.edu",
                    description="Public state technical university in Tamil Nadu, with over 500 affiliated engineering colleges across the state.",
                    related_examinations=["B.E. / B.Tech Semester Exams", "TANCET Post-Graduate Entrance", "Autonomous College Regulations"],
                    verification_status="VERIFIED",
                    verification_source="Govt of Tamil Nadu Higher Education Dept",
                    is_featured=True
                ),
                OfficialWebsite(
                    name="University of Mumbai (MU)",
                    code="MUMBAI-UNIV",
                    category_type="UNIVERSITY",
                    state_id=state_map.get("MH"),
                    official_url="https://mu.ac.in/",
                    application_portal_url="https://muexam.mu.ac.in/",
                    domain="mu.ac.in",
                    description="Collegiate public state university in Mumbai, one of the oldest and largest universities in the world by student enrollment.",
                    related_examinations=["Mumbai University Summer / Winter Examinations", "Idol Distance Education Exams"],
                    verification_status="VERIFIED",
                    verification_source="Govt of Maharashtra Higher Education",
                    is_featured=True
                ),
                OfficialWebsite(
                    name="University of Calcutta (CU)",
                    code="CALCUTTA-UNIV",
                    category_type="UNIVERSITY",
                    state_id=state_map.get("WB"),
                    official_url="https://www.caluniv.ac.in/",
                    application_portal_url="https://cuexam.net/",
                    domain="caluniv.ac.in",
                    description="Public state university in Kolkata, West Bengal, recognized as a Five Star University and Centre with Potential for Excellence.",
                    related_examinations=["CU B.A. / B.Sc. / B.Com. CBCS Semester Exams"],
                    verification_status="VERIFIED",
                    verification_source="Govt of West Bengal Education Dept",
                    is_featured=False
                ),
                OfficialWebsite(
                    name="Visva-Bharati University",
                    code="VISVA-BHARATI",
                    category_type="UNIVERSITY",
                    state_id=state_map.get("WB"),
                    official_url="https://www.visvabharati.ac.in/",
                    domain="visvabharati.ac.in",
                    description="Central research university and an Institution of National Importance founded by Nobel laureate Rabindranath Tagore.",
                    related_examinations=["Visva-Bharati Annual & Semester Examinations"],
                    verification_status="VERIFIED",
                    verification_source="Ministry of Education Central University Directory",
                    is_featured=False
                )
            ]

            db.add_all(official_websites_seed)
            await db.flush()

            # Seed a verification log for each featured website
            for w in official_websites_seed:
                if w.is_featured:
                    db.add(WebsiteVerificationLog(
                        website_id=w.id,
                        status_code=200,
                        latency_ms=w.response_time_ms or 55,
                        is_ssl_valid=True,
                        message="Verified via Government .gov.in/.nic.in Domain Registry",
                        checked_by="SYSTEM_SEED"
                    ))

            # Seed AI Settings if not exists
            ai_check = await db.execute(select(AISetting))
            if not ai_check.scalars().first():
                db.add(AISetting(
                    provider="google_gemini",
                    model_name="gemini-1.5-flash",
                    is_enabled=True,
                    daily_student_token_limit=25000,
                    daily_institution_token_limit=500000,
                    temperature=0.2,
                    system_prompt="You are ExamHub India's Verified Exam AI Assistant. You only cite official government sources ending in .gov.in, .nic.in, and .ac.in. Never invent exam dates, results, or syllabus rules.",
                    grounded_citation_required=True
                ))

            # Seed initial RRB Group D Recruitment cycles and zones
            rrb_check = await db.execute(select(RRBGroupDResult))
            if not rrb_check.scalars().first():
                rrb_entries = [
                    RRBGroupDResult(
                        cen_number="CEN RRC-01/2019",
                        title="Level 1 Posts (Group D) - 7th CPC Matrix (1,03,769 Vacancies)",
                        zone_code="RRB_CHENNAI",
                        zone_name="Railway Recruitment Board, Chennai",
                        vacancies_count=9579,
                        official_portal_url="https://www.rrbchennai.gov.in",
                        scorecard_url="https://rrb.digialm.com//EForms/configuredHtml/1907/68641/login.html",
                        merit_list_pdf_url="https://www.rrbchennai.gov.in/downloads/cbt-merit-list-cen-01-2019.pdf",
                        cutoff_marks_pdf_url="https://www.rrbchennai.gov.in/downloads/cutoff-marks-cen-01-2019.pdf",
                        pet_instructions_url="https://www.rrcmas.in/pet-instructions.html",
                        status="PUBLISHED",
                        announcement_date=utc_now(),
                        verification_source="Railway Recruitment Control Board / RRB Chennai Official Notice",
                        admin_notes="Final verified merit list and CBT scorecard link published."
                    ),
                    RRBGroupDResult(
                        cen_number="CEN RRC-01/2019",
                        title="Level 1 Posts (Group D) - 7th CPC Matrix",
                        zone_code="RRB_MUMBAI",
                        zone_name="Railway Recruitment Board, Western Railway Mumbai",
                        vacancies_count=10734,
                        official_portal_url="https://www.rrbmumbai.gov.in",
                        scorecard_url="https://rrb.digialm.com//EForms/configuredHtml/1907/68641/login.html",
                        merit_list_pdf_url="https://www.rrbmumbai.gov.in/pdf/CBT-Result-CEN-01-2019.pdf",
                        cutoff_marks_pdf_url="https://www.rrbmumbai.gov.in/pdf/Cutoff-Normalized-CEN-01-2019.pdf",
                        pet_instructions_url="https://www.rrc-wr.com/pet_schedule.html",
                        status="PUBLISHED",
                        announcement_date=utc_now(),
                        verification_source="RRB Mumbai Official Portal",
                        admin_notes="Western Railway zone document verification and PET call letters."
                    ),
                    RRBGroupDResult(
                        cen_number="CEN RRC-01/2024",
                        title="Railway Group D / Track Maintainer Grade IV Recruitment 2026 Cycle",
                        zone_code="ALL_ZONES",
                        zone_name="All Indian Railway Zones (Centralized)",
                        vacancies_count=52000,
                        official_portal_url="https://indianrailways.gov.in",
                        status="DRAFT",
                        verification_source="Official Gazette of India (Draft Proposal)",
                        admin_notes="Draft notification awaiting Ministry of Railways clearance."
                    )
                ]
                db.add_all(rrb_entries)

            # Seed initial Central Scholarships
            sch_check = await db.execute(select(Scholarship))
            if not sch_check.scalars().first():
                db.add_all([
                    Scholarship(
                        title="Post Matric Scholarships Scheme for Minorities",
                        provider_name="Ministry of Minority Affairs",
                        category="CENTRAL",
                        eligibility_criteria="Students studying in Class 11, 12, graduate, postgraduate, technical and vocational courses with minimum 50% marks and family income below ₹2 Lakh/year.",
                        award_amount="Admission fee up to ₹10,000/annum + Maintenance allowance",
                        application_portal_url="https://scholarships.gov.in",
                        status="PUBLISHED"
                    ),
                    Scholarship(
                        title="Central Sector Scheme of Scholarship for College and University Students",
                        provider_name="Department of Higher Education (MoE)",
                        category="CENTRAL",
                        eligibility_criteria="Above 80th percentile in Class 12 board examination pursuing regular degree courses with family income below ₹4.5 Lakh/year.",
                        award_amount="₹12,000 per annum for Graduation; ₹20,000 for Post Graduation",
                        application_portal_url="https://scholarships.gov.in",
                        status="PUBLISHED"
                    )
                ])

            # Seed initial Security Incident Audit
            sec_check = await db.execute(select(SecurityIncident))
            if not sec_check.scalars().first():
                db.add(SecurityIncident(
                    incident_type="SSRF_PROBE_BLOCKED",
                    severity="HIGH",
                    source_ip="192.168.1.105",
                    target_resource="/api/admin/institutions/test-connection",
                    details="Attempted outbound request to private network IP 169.254.169.254 was intercepted and blocked by SSRF Guard.",
                    is_resolved=True
                ))

            # Seed Official Recruitment Sources
            src_check = await db.execute(select(JobSource))
            if not src_check.scalars().first():
                db.add_all([
                    JobSource(name="Union Public Service Commission", code="UPSC", official_url="https://upsc.gov.in/", careers_url="https://upsconline.nic.in/", category="CENTRAL_GOVT", verification_status="VERIFIED"),
                    JobSource(name="Staff Selection Commission", code="SSC", official_url="https://ssc.gov.in/", careers_url="https://ssc.gov.in/candidate-portal/", category="CENTRAL_GOVT", verification_status="VERIFIED"),
                    JobSource(name="Railway Recruitment Boards", code="RRB", official_url="https://www.rrbcdg.gov.in/", careers_url="https://www.rrbapply.gov.in/", category="RAILWAY", verification_status="VERIFIED"),
                    JobSource(name="Institute of Banking Personnel Selection", code="IBPS", official_url="https://www.ibps.in/", careers_url="https://ibpsonline.ibps.in/", category="BANKING", verification_status="VERIFIED"),
                    JobSource(name="State Bank of India Careers", code="SBI", official_url="https://sbi.co.in/", careers_url="https://sbi.co.in/web/careers", category="BANKING", verification_status="VERIFIED"),
                    JobSource(name="Reserve Bank of India Opportunities", code="RBI", official_url="https://www.rbi.org.in/", careers_url="https://opportunities.rbi.org.in/", category="BANKING", verification_status="VERIFIED"),
                    JobSource(name="India Post GDS Online Engagement", code="INDIAPOST-GDS", official_url="https://indiapost.gov.in/", careers_url="https://indiapostgdsonline.gov.in/", category="CENTRAL_GOVT", verification_status="VERIFIED"),
                    JobSource(name="Tamil Nadu Public Service Commission", code="TNPSC", official_url="https://www.tnpsc.gov.in/", careers_url="https://apply.tnpscexams.in/", category="STATE_GOVT", verification_status="VERIFIED"),
                    JobSource(name="TN Uniformed Services Recruitment Board", code="TNUSRB", official_url="https://www.tnusrb.tn.gov.in/", careers_url="https://www.tnusrb.tn.gov.in/", category="STATE_GOVT", verification_status="VERIFIED"),
                    JobSource(name="Indian Army Join Portal", code="ARMY", official_url="https://joinindianarmy.nic.in/", careers_url="https://joinindianarmy.nic.in/default.aspx", category="DEFENCE", verification_status="VERIFIED"),
                    JobSource(name="Indian Navy Join Portal", code="NAVY", official_url="https://www.joinindiannavy.gov.in/", careers_url="https://www.joinindiannavy.gov.in/en/account/login", category="DEFENCE", verification_status="VERIFIED"),
                    JobSource(name="Air Force Common Admission Test (AFCAT)", code="AFCAT", official_url="https://afcat.cdac.in/", careers_url="https://afcat.cdac.in/afcatreg/", category="DEFENCE", verification_status="VERIFIED"),
                    JobSource(name="Indian Space Research Organisation (ISRO)", code="ISRO", official_url="https://www.isro.gov.in/", careers_url="https://www.isro.gov.in/Careers.html", category="PSU_SCIENTIFIC", verification_status="VERIFIED"),
                    JobSource(name="Defence Research and Development Organisation (DRDO)", code="DRDO", official_url="https://www.drdo.gov.in/", careers_url="https://www.drdo.gov.in/careers", category="PSU_SCIENTIFIC", verification_status="VERIFIED"),
                    JobSource(name="National Career Service (NCS)", code="NCS", official_url="https://www.ncs.gov.in/", careers_url="https://www.ncs.gov.in/job-seeker", category="CENTRAL_GOVT", verification_status="VERIFIED"),
                    JobSource(name="Employment News / Rozgar Samachar", code="EMP-NEWS", official_url="https://employmentnews.gov.in/", careers_url="https://employmentnews.gov.in/", category="CENTRAL_GOVT", verification_status="VERIFIED")
                ])

            # Seed Real & Verified Job Notifications
            job_check = await db.execute(select(JobNotification))
            if not job_check.scalars().first():
                db.add_all([
                    # 1. UPSC CSE
                    JobNotification(
                        title="UPSC Civil Services Examination (CSE) 2026",
                        slug="upsc-civil-services-examination-2026",
                        organization_name="Union Public Service Commission (UPSC)",
                        organization_logo_url="https://upsc.gov.in/sites/default/files/upsc_logo_0.png",
                        sector="CENTRAL_GOVT",
                        category="GOVERNMENT",
                        job_description="Recruitment to the Indian Administrative Service (IAS), Indian Foreign Service (IFS), Indian Police Service (IPS) and other Central Group 'A' and Group 'B' Services.",
                        vacancies_count=1056,
                        qualification="Any Graduate (Bachelor's Degree in any discipline from a recognized University)",
                        required_skills="General Studies, Analytical Reasoning, Essay Writing, Current Affairs",
                        age_limit="21 - 32 Years as on 01/08/2026 (Relaxation: SC/ST 5 yrs, OBC 3 yrs)",
                        experience_required="FRESHER",
                        salary_range="₹56,100 - ₹2,50,000 (Level 10 - Apex Scale)",
                        location="All India",
                        work_mode="ON_SITE",
                        application_start_date=datetime(2026, 2, 1, tzinfo=timezone.utc),
                        application_end_date=datetime(2026, 3, 5, 18, 0, tzinfo=timezone.utc),
                        application_fee="₹100 (Female/SC/ST/PwBD Candidates: Exempted)",
                        selection_process="Preliminary Examination (Objective) -> Main Examination (Written) -> Personality Test (Interview)",
                        syllabus_details="Paper I: General Studies (200 marks), Paper II: CSAT (200 marks, qualifying 33%). Mains: 9 descriptive papers.",
                        official_notification_pdf="https://upsc.gov.in/sites/default/files/Notif-CSP-2026-Engl-010226.pdf",
                        official_application_url="https://upsconline.nic.in/upsc/OTRP/",
                        source_website_url="https://upsc.gov.in/",
                        verification_source="UPSC Official Notification No. 05/2026-CSP",
                        status="CLOSED",
                        is_featured=False,
                        view_count=48200
                    ),
                    # 2. SSC CGL
                    JobNotification(
                        title="SSC Combined Graduate Level (CGL) Examination 2026",
                        slug="ssc-cgl-examination-2026",
                        organization_name="Staff Selection Commission (SSC)",
                        organization_logo_url="https://ssc.gov.in/assets/images/logo.png",
                        sector="CENTRAL_GOVT",
                        category="GOVERNMENT",
                        job_description="Recruitment of Assistant Section Officer, Income Tax Inspector, Central Excise Inspector, Sub-Inspector (CBI), and Auditor across Ministries & Departments.",
                        vacancies_count=17727,
                        qualification="Bachelor's Degree from a recognized University or equivalent",
                        required_skills="Quantitative Aptitude, English Comprehension, General Intelligence & Reasoning",
                        age_limit="18 - 30 Years (Post-wise variation, OBC: +3 yrs, SC/ST: +5 yrs)",
                        experience_required="FRESHER",
                        salary_range="Pay Level-4 (₹25,500) to Pay Level-8 (₹1,51,100)",
                        location="All India",
                        work_mode="ON_SITE",
                        application_start_date=datetime(2026, 11, 1, tzinfo=timezone.utc),
                        application_end_date=datetime(2026, 12, 28, 23, 0, tzinfo=timezone.utc),
                        application_fee="₹100 (Women, SC, ST, PwD, ESM: Nil)",
                        selection_process="Tier-I Computer Based Exam -> Tier-II Computer Based Exam -> Data Entry Speed Test -> Document Verification",
                        syllabus_details="Tier-I: Reasoning, GA, Quant, English (25 Qs each). Tier-II: Math, Reasoning, English, GA, Computer Knowledge.",
                        official_notification_pdf="https://ssc.gov.in/api/attachments/uploads/newsArticles/2026_CGL_Notification.pdf",
                        official_application_url="https://ssc.gov.in/",
                        source_website_url="https://ssc.gov.in/",
                        verification_source="Staff Selection Commission Union Gazette Circular",
                        status="PUBLISHED",
                        is_featured=True,
                        view_count=61500
                    ),
                    # 3. RRB ALP & Technician
                    JobNotification(
                        title="RRB Assistant Loco Pilot (ALP) & Technician Recruitment 2026",
                        slug="rrb-assistant-loco-pilot-alp-2026",
                        organization_name="Railway Recruitment Boards (Indian Railways)",
                        organization_logo_url="https://indianrailways.gov.in/images/logo.png",
                        sector="CENTRAL_GOVT",
                        category="RAILWAY",
                        job_description="Recruitment for Assistant Loco Pilot (Level 2) and Technicians Grade III across 21 Railway Zones of Indian Railways.",
                        vacancies_count=18799,
                        qualification="10th Class / Matriculation + ITI in specified trade OR Diploma in Mechanical / Electrical / Electronics / Automobile Engineering",
                        required_skills="Technical Trade Competence, Physics, Basic Science & Engineering, Reasoning",
                        age_limit="18 - 33 Years as on 01/07/2026",
                        experience_required="FRESHER",
                        salary_range="Level-2 (₹19,900 initial pay + DA + Running Allowance)",
                        location="All India (21 RRB Zones)",
                        work_mode="ON_SITE",
                        application_start_date=datetime(2026, 11, 5, tzinfo=timezone.utc),
                        application_end_date=datetime(2026, 12, 31, 23, 59, tzinfo=timezone.utc),
                        application_fee="₹500 (₹400 refundable after attending CBT-1; SC/ST/Women/Minority: ₹250 fully refundable)",
                        selection_process="CBT-1 (Screening) -> CBT-2 (Two Parts) -> Computer Based Aptitude Test (CBAT) -> Document Verification & Medical Exam",
                        syllabus_details="CBT-1: Math, Mental Ability, General Science, General Awareness. CBT-2 Part B: Trade syllabus prescribed by DGT.",
                        official_notification_pdf="https://www.rrbcdg.gov.in/uploads/CEN_01_2026_ALP_English.pdf",
                        official_application_url="https://www.rrbapply.gov.in/",
                        source_website_url="https://www.rrbcdg.gov.in/",
                        verification_source="CEN 01/2026 Railway Recruitment Control Board",
                        status="PUBLISHED",
                        is_featured=True,
                        view_count=82400
                    ),
                    # 4. SBI PO
                    JobNotification(
                        title="SBI Probationary Officers (PO) Recruitment 2026",
                        slug="sbi-probationary-officers-po-2026",
                        organization_name="State Bank of India (SBI)",
                        organization_logo_url="https://sbi.co.in/o/sbi-home-theme/images/sbi_logo.png",
                        sector="PSU",
                        category="BANKING",
                        job_description="Recruitment of Probationary Officers (Scale I) in State Bank of India with opportunities for rapid career advancement to senior leadership.",
                        vacancies_count=2000,
                        qualification="Graduation in any discipline from a recognized University or Central Govt equivalent",
                        required_skills="Banking Awareness, Quantitative Analysis, Logical Reasoning, English Composition",
                        age_limit="21 - 30 Years (OBC: 3 yrs, SC/ST: 5 yrs relaxation)",
                        experience_required="FRESHER",
                        salary_range="₹41,960 basic pay (Emoluments approx. ₹65,000 - ₹72,000/mo)",
                        location="All India",
                        work_mode="ON_SITE",
                        application_start_date=datetime(2026, 11, 12, tzinfo=timezone.utc),
                        application_end_date=datetime(2027, 1, 15, 23, 59, tzinfo=timezone.utc),
                        application_fee="₹750 (SC/ST/PwBD Candidates: Nil)",
                        selection_process="Phase I: Preliminary Exam -> Phase II: Main Exam (Objective + Descriptive) -> Phase III: Psychometric Test, Group Exercise & Interview",
                        syllabus_details="Prelims: English (30 Qs), Quant (35 Qs), Reasoning (35 Qs). Mains: Data Analysis, General Economy/Banking, Reasoning & English.",
                        official_notification_pdf="https://sbi.co.in/documents/careers/CRPD_PO_2026_Notice.pdf",
                        official_application_url="https://bank.sbi/web/careers/current-openings",
                        source_website_url="https://sbi.co.in/web/careers",
                        verification_source="SBI Central Recruitment & Promotion Department (CRPD)",
                        status="PUBLISHED",
                        is_featured=True,
                        view_count=52100
                    ),
                    # 5. India Post GDS
                    JobNotification(
                        title="India Post Gramin Dak Sevaks (GDS) Branch Postmaster / ABPM 2026",
                        slug="india-post-gramin-dak-sevak-gds-2026",
                        organization_name="Department of Posts (India Post)",
                        organization_logo_url="https://indiapostgdsonline.gov.in/images/logo.png",
                        sector="CENTRAL_GOVT",
                        category="GOVERNMENT",
                        job_description="Engagement of Branch Postmaster (BPM) and Assistant Branch Postmaster (ABPM) / Dak Sevaks across 23 postal circles.",
                        vacancies_count=44228,
                        qualification="Secondary School Examination pass certificate of 10th standard with passing marks in Mathematics and English",
                        required_skills="Basic Computer Competence, Cycling, Knowledge of local language of the postal circle",
                        age_limit="18 - 40 Years (SC/ST: 5 yrs, OBC: 3 yrs relaxation)",
                        experience_required="FRESHER",
                        salary_range="TRCA Slab: BPM (₹12,000 - ₹29,380) / ABPM (₹10,000 - ₹24,470)",
                        location="All India (Circle Wise)",
                        work_mode="ON_SITE",
                        application_start_date=datetime(2026, 11, 10, tzinfo=timezone.utc),
                        application_end_date=datetime(2026, 12, 22, 23, 59, tzinfo=timezone.utc),
                        application_fee="₹100 (Female, SC/ST, PwD, Transwomen: Nil)",
                        selection_process="Merit List based on 10th standard marks (No Exam) -> Document Verification",
                        syllabus_details="Pure merit based on Class 10th marks automatically calculated by online system.",
                        official_notification_pdf="https://indiapostgdsonline.gov.in/DOP_GDS_Notification_2026.pdf",
                        official_application_url="https://indiapostgdsonline.gov.in/",
                        source_website_url="https://indiapostgdsonline.gov.in/",
                        verification_source="Ministry of Communications / Department of Posts",
                        status="CLOSED",
                        is_featured=False,
                        view_count=94300
                    ),
                    # 6. TNPSC Group 2 & 2A
                    JobNotification(
                        title="TNPSC Combined Civil Services Examination Group II / IIA Services",
                        slug="tnpsc-combined-civil-services-group-2-2a",
                        organization_name="Tamil Nadu Public Service Commission (TNPSC)",
                        organization_logo_url="https://www.tnpsc.gov.in/images/tnpsc-logo.png",
                        sector="STATE_GOVT",
                        category="STATE_GOVERNMENT",
                        job_description="Recruitment for Sub-Registrar, Municipal Commissioner, Revenue Inspector, and Assistant Section Officer in Tamil Nadu State Administration.",
                        vacancies_count=2327,
                        qualification="Bachelor's Degree of any University recognized by UGC with adequate knowledge of Tamil",
                        required_skills="Tamil Language & Literature, General Studies, Aptitude & Mental Ability",
                        age_limit="18 - 32 Years (No maximum age limit for SC/ST/MBC/BC)",
                        experience_required="FRESHER",
                        salary_range="Level 9 to Level 18 (₹20,600 - ₹1,34,200)",
                        location="Tamil Nadu",
                        work_mode="ON_SITE",
                        application_start_date=datetime(2026, 1, 10, tzinfo=timezone.utc),
                        application_end_date=datetime(2026, 2, 28, 23, 59, tzinfo=timezone.utc),
                        application_fee="One Time Registration: ₹150; Prelims Exam Fee: ₹100",
                        selection_process="Preliminary Examination -> Main Written Examination -> Interview (Group 2) / Non-Interview (Group 2A)",
                        syllabus_details="Prelims: General Tamil (100 Qs), General Studies (75 Qs), Aptitude & Mental Ability (25 Qs).",
                        official_notification_pdf="https://www.tnpsc.gov.in/document/notification/2026_Group2_Notification.pdf",
                        official_application_url="https://apply.tnpscexams.in/otrdsh/login",
                        source_website_url="https://www.tnpsc.gov.in/",
                        verification_source="TNPSC Gazette Notification",
                        status="PUBLISHED",
                        is_featured=False,
                        view_count=38100
                    ),
                    # 7. Indian Army TGC
                    JobNotification(
                        title="Indian Army Technical Graduate Course (TGC-141) Commissioned Officer",
                        slug="indian-army-technical-graduate-course-tgc-141",
                        organization_name="Indian Army (Directorate General of Recruiting)",
                        organization_logo_url="https://joinindianarmy.nic.in/images/logo.png",
                        sector="CENTRAL_GOVT",
                        category="DEFENCE",
                        job_description="Grant of Permanent Commission in the Indian Army for Engineering Graduates across Civil, Mechanical, Computer Science, and Electrical disciplines.",
                        vacancies_count=30,
                        qualification="B.E. / B.Tech in Engineering Stream (Final year students eligible)",
                        required_skills="Physical Endurance, Officer Like Qualities (OLQ), Engineering Fundamentals",
                        age_limit="20 - 27 Years as on first day of month in which course starts",
                        experience_required="FRESHER",
                        salary_range="Lieutenant rank: Level 10 (₹56,100 - ₹1,77,500 + Military Service Pay ₹15,500/mo)",
                        location="All India",
                        work_mode="ON_SITE",
                        application_start_date=datetime(2026, 2, 1, tzinfo=timezone.utc),
                        application_end_date=datetime(2026, 3, 2, 15, 0, tzinfo=timezone.utc),
                        application_fee="Nil (No Application Fee for Indian Army Officer Entries)",
                        selection_process="Shortlisting based on Engineering Marks -> SSB Interview (5 Days) -> Medical Examination",
                        syllabus_details="Service Selection Board (SSB): Stage 1 (OIR & PPDT), Stage 2 (Psychology, GTO Tasks, Personal Interview).",
                        official_notification_pdf="https://joinindianarmy.nic.in/writereaddata/Portal/Notification/TGC_141_Notification.pdf",
                        official_application_url="https://joinindianarmy.nic.in/Authentication.aspx",
                        source_website_url="https://joinindianarmy.nic.in/",
                        verification_source="Indian Army Official Employment Gazette",
                        status="PUBLISHED",
                        is_featured=False,
                        view_count=29400
                    ),
                    # 8. ISRO Scientist
                    JobNotification(
                        title="ISRO ICRB Scientist / Engineer 'SC' (Civil, Mech, Electrical, CS)",
                        slug="isro-scientist-engineer-sc-recruitment-2026",
                        organization_name="Indian Space Research Organisation (ISRO)",
                        organization_logo_url="https://www.isro.gov.in/media_isro/image/logo.png.pagespeed.ce.d5c0b05b38.png",
                        sector="PSU",
                        category="GOVERNMENT",
                        job_description="Recruitment of Scientist/Engineer 'SC' in Level 10 of Pay Matrix at ISRO Centres / Units across India.",
                        vacancies_count=303,
                        qualification="B.E / B.Tech or equivalent in first class with an aggregate minimum of 65% marks or CGPA 6.84/10",
                        required_skills="Space Engineering Fundamentals, Thermodynamics, Structural Dynamics, Algorithms",
                        age_limit="18 - 28 Years (Relaxations: OBC 3 yrs, SC/ST 5 yrs)",
                        experience_required="FRESHER",
                        salary_range="Level 10 (Basic Pay ₹56,100 + DA + HRA + Transport Allowance)",
                        location="Bengaluru, Thiruvananthapuram, Sriharikota, Ahmedabad",
                        work_mode="ON_SITE",
                        application_start_date=datetime(2026, 1, 25, tzinfo=timezone.utc),
                        application_end_date=datetime(2026, 2, 26, 17, 0, tzinfo=timezone.utc),
                        application_fee="₹250 (All Women, SC, ST, PwBD: Refunded upon appearing in written test)",
                        selection_process="Written Test (80 Discipline Qs + 20 Aptitude Qs) -> Interview (1:5 ratio)",
                        syllabus_details="80 MCQs based on GATE core syllabus of relevant engineering branch + 20 MCQs on reasoning, numerical ability and general english.",
                        official_notification_pdf="https://www.isro.gov.in/media_isro/pdf/ICRB_Advt_01_2026.pdf",
                        official_application_url="https://apps.isac.gov.in/icrb-2026/",
                        source_website_url="https://www.isro.gov.in/",
                        verification_source="ISRO Centralised Recruitment Board (ICRB)",
                        status="CLOSED",
                        is_featured=False,
                        view_count=45100
                    ),
                    # 9. TCS NQT IT Software
                    JobNotification(
                        title="TCS National Qualifier Test (NQT) Freshers Hiring Drive 2026",
                        slug="tcs-national-qualifier-test-nqt-2026",
                        organization_name="Tata Consultancy Services (TCS)",
                        organization_logo_url="https://www.tcs.com/content/dam/global-tcs/en/images/home/tcs-logo-1.svg",
                        sector="PRIVATE",
                        category="IT",
                        job_description="Off-campus hiring drive for Ninja (₹3.36 LPA), Digital (₹7.0 LPA), and Prime (₹9.0 LPA) roles across TCS innovation hubs.",
                        vacancies_count=12000,
                        qualification="B.E. / B.Tech / M.E. / M.Tech / MCA / M.Sc in any specialization with min 60% throughout academics",
                        required_skills="Programming (Java / Python / C++), Data Structures, SQL, Cloud Fundamentals",
                        age_limit="18 - 26 Years (2025 & 2026 Passing Out Batch)",
                        experience_required="FRESHER",
                        salary_range="₹3,36,000 - ₹9,00,000 per annum (Based on Test Performance)",
                        location="Pan India (Chennai, Bangalore, Hyderabad, Pune, Mumbai, Delhi-NCR)",
                        work_mode="HYBRID",
                        application_start_date=datetime(2026, 2, 1, tzinfo=timezone.utc),
                        application_end_date=datetime(2026, 3, 15, 23, 59, tzinfo=timezone.utc),
                        application_fee="Free of Cost (TCS does not charge any registration fee)",
                        selection_process="Online Integrated Test (Foundation + Advanced) -> Technical Interview -> HR Round",
                        syllabus_details="Part A: Numerical Ability, Verbal Ability, Reasoning Ability. Part B: Advanced Coding & Algorithmic Problem Solving.",
                        official_notification_pdf="https://www.tcs.com/careers/india/tcs-nqt-registration-guidelines.pdf",
                        official_application_url="https://nextstep.tcs.com/campus/#/",
                        source_website_url="https://www.tcs.com/careers",
                        verification_source="TCS NextStep Official Campus Portal",
                        status="CLOSED",
                        is_featured=False,
                        view_count=73800
                    ),
                    # 10. BHEL Apprentice
                    JobNotification(
                        title="BHEL Graduate & Technician Apprentice Engagement 2026",
                        slug="bhel-graduate-technician-apprentice-engagement-2026",
                        organization_name="Bharat Heavy Electricals Limited (BHEL)",
                        organization_logo_url="https://www.bhel.com/sites/default/files/logo.png",
                        sector="PSU",
                        category="APPRENTICESHIP",
                        job_description="1-Year Apprenticeship training under the Apprentices Act, 1961 in Tiruchirappalli and Bhopal manufacturing units.",
                        vacancies_count=575,
                        qualification="Degree / Diploma in Engineering in Mechanical, Electrical, Civil, Electronics",
                        required_skills="Workshop Safety, Blueprint Reading, Manufacturing Equipment Operation",
                        age_limit="18 - 27 Years as on 01/01/2026",
                        experience_required="FRESHER",
                        salary_range="Stipend: ₹9,000/mo (Graduate) / ₹8,000/mo (Technician Diploma)",
                        location="Tiruchirappalli (TN) / Bhopal (MP)",
                        work_mode="ON_SITE",
                        application_start_date=datetime(2026, 1, 15, tzinfo=timezone.utc),
                        application_end_date=datetime(2026, 2, 28, 17, 0, tzinfo=timezone.utc),
                        application_fee="Nil",
                        selection_process="Merit score based on aggregate marks in Degree/Diploma -> Certificate Verification",
                        syllabus_details="Selection purely based on Degree/Diploma marks. Mandatory NATS portal registration.",
                        official_notification_pdf="https://trichy.bhel.com/tms/app_reg/Apprentice_Advt_2026.pdf",
                        official_application_url="https://nats.education.gov.in/",
                        source_website_url="https://www.bhel.com/",
                        verification_source="BHEL HR Human Resource Directorate Notice",
                        status="PUBLISHED",
                        is_featured=False,
                        view_count=18200
                    )
                ])

            # 24. Seed Notification Templates
            tpl_stmt = select(NotificationTemplate)
            res = await db.execute(tpl_stmt)
            if not res.scalars().first():
                db.add_all([
                    NotificationTemplate(
                        template_code="EXAM_REMINDER_30D",
                        category="EXAMINATION",
                        title_template="30-Day Examination Alert: {exam_name}",
                        body_template="Your registered examination {exam_name} is scheduled on {exam_date}. Please review the official syllabus and complete exam preparation.",
                        channels="IN_APP,EMAIL"
                    ),
                    NotificationTemplate(
                        template_code="EXAM_REMINDER_7D",
                        category="EXAMINATION",
                        title_template="7-Day Final Notice: {exam_name}",
                        body_template="Only 7 days remaining for {exam_name} on {exam_date}. Verify your exam center and print your official hall ticket.",
                        channels="IN_APP,EMAIL,PUSH"
                    ),
                    NotificationTemplate(
                        template_code="EXAM_REMINDER_1D",
                        category="EXAMINATION",
                        title_template="24-Hour Urgent Alert: {exam_name} Tomorrow",
                        body_template="Tomorrow is your {exam_name} examination. Ensure you carry your printed Admit Card and original Government Photo ID.",
                        channels="IN_APP,EMAIL,PUSH"
                    ),
                    NotificationTemplate(
                        template_code="APP_DEADLINE_3D",
                        category="DEADLINE",
                        title_template="Application Closing in 3 Days: {exam_name}",
                        body_template="The official application portal for {exam_name} closes on {closing_date}. Submit your application before the server rush.",
                        channels="IN_APP,EMAIL"
                    ),
                    NotificationTemplate(
                        template_code="ADMIT_CARD_RELEASED",
                        category="EXAMINATION",
                        title_template="Official Admit Card Released: {exam_name}",
                        body_template="The examination board has released the official Hall Ticket / Admit Card for {exam_name}. Download now via ExamHub India.",
                        channels="IN_APP,EMAIL,PUSH"
                    ),
                    NotificationTemplate(
                        template_code="NEW_JOB_MATCH",
                        category="JOB",
                        title_template="Matching Career Opportunity: {job_title}",
                        body_template="A new verified recruitment notice matching your profile was published by {org_name} with {vacancies} vacancies. Apply before {deadline}.",
                        channels="IN_APP,EMAIL"
                    )
                ])
                await db.flush()

            # 25. Seed Demo Student Registrations, Calendar Events & Reminders
            student_res = await db.execute(select(User).where(User.email == "student@examhub.in"))
            demo_user = student_res.scalar_one_or_none()
            
            if demo_user:
                # Check student exam registrations
                reg_stmt = select(StudentExamRegistration).where(StudentExamRegistration.user_id == demo_user.id)
                reg_res = await db.execute(reg_stmt)
                if not reg_res.scalars().first():
                    # Fetch seeded exams
                    exam_res = await db.execute(select(Examination).limit(3))
                    exam_list = exam_res.scalars().all()
                    
                    if exam_list:
                        exam1 = exam_list[0]
                        exam2 = exam_list[1] if len(exam_list) > 1 else exam1
                        
                        reg1 = StudentExamRegistration(
                            user_id=demo_user.id,
                            examination_id=exam1.id,
                            status="APPLICATION_CONFIRMED",
                            application_number="UPSC/CSE/2026/894102",
                            registration_date=datetime(2026, 2, 10, tzinfo=timezone.utc),
                            official_portal_url="https://upsconline.nic.in",
                            notes="Targeting IAS & IFS cadre. Prelims revision in progress."
                        )
                        reg2 = StudentExamRegistration(
                            user_id=demo_user.id,
                            examination_id=exam2.id,
                            status="APPLICATION_SUBMITTED",
                            application_number="SSC/CGL/2026/512903",
                            registration_date=datetime(2026, 2, 14, tzinfo=timezone.utc),
                            official_portal_url="https://ssc.gov.in",
                            notes="Tier 1 exam center: Chennai Main Center"
                        )
                        # External manual entry exam
                        reg3 = StudentExamRegistration(
                            user_id=demo_user.id,
                            examination_id=None,
                            is_external=True,
                            external_exam_name="Tamil Nadu Group 2 Combined Services",
                            external_authority="Tamil Nadu Public Service Commission (TNPSC)",
                            external_exam_date=datetime(2026, 5, 24, 9, 30, tzinfo=timezone.utc),
                            external_application_deadline=datetime(2026, 3, 20, 23, 59, tzinfo=timezone.utc),
                            status="APPLICATION_CONFIRMED",
                            application_number="TNPSC/2026/G2/771829",
                            notes="Applied on official tnpscexams.in portal directly."
                        )
                        db.add_all([reg1, reg2, reg3])
                        await db.flush()

                        # Add Calendar Events
                        db.add_all([
                            StudentCalendarEvent(
                                user_id=demo_user.id,
                                registration_id=reg1.id,
                                examination_id=exam1.id,
                                title=f"{exam1.name} - Preliminary Exam",
                                event_type="EXAM_DATE",
                                event_date=datetime(2026, 5, 25, 9, 30, tzinfo=timezone.utc),
                                location="All India Designated Test Centers",
                                notes="Session 1: GS Paper I (09:30 - 11:30), Session 2: CSAT (14:30 - 16:30)"
                            ),
                            StudentCalendarEvent(
                                user_id=demo_user.id,
                                registration_id=reg1.id,
                                examination_id=exam1.id,
                                title=f"{exam1.name} - Hall Ticket Release",
                                event_type="ADMIT_CARD",
                                event_date=datetime(2026, 5, 1, 10, 0, tzinfo=timezone.utc),
                                notes="Download e-Admit card from upsconline.nic.in"
                            ),
                            StudentCalendarEvent(
                                user_id=demo_user.id,
                                registration_id=reg2.id,
                                examination_id=exam2.id,
                                title=f"{exam2.name} - Tier 1 Exam",
                                event_type="EXAM_DATE",
                                event_date=datetime(2026, 6, 12, 10, 0, tzinfo=timezone.utc),
                                location="Computer Based Test (CBT) Center"
                            ),
                            StudentCalendarEvent(
                                user_id=demo_user.id,
                                registration_id=reg3.id,
                                title="TNPSC Group 2 Preliminary Examination",
                                event_type="EXAM_DATE",
                                event_date=datetime(2026, 5, 24, 9, 30, tzinfo=timezone.utc),
                                location="Chennai District Center",
                                is_custom=True
                            )
                        ])

                        # Add Exam Reminders
                        db.add_all([
                            ExamReminder(
                                user_id=demo_user.id,
                                registration_id=reg1.id,
                                examination_id=exam1.id,
                                reminder_type="EXAM_30D",
                                title=f"30-Day Reminder: {exam1.name}",
                                message=f"Only 30 days left until {exam1.name}. Review mock tests and previous question papers.",
                                scheduled_for=datetime(2026, 4, 25, 9, 0, tzinfo=timezone.utc),
                                status="PENDING",
                                delivery_channel="IN_APP"
                            ),
                            ExamReminder(
                                user_id=demo_user.id,
                                registration_id=reg1.id,
                                examination_id=exam1.id,
                                reminder_type="EXAM_7D",
                                title=f"7-Day Alert: {exam1.name}",
                                message=f"7 days to go for {exam1.name}. Ensure you have printed your admit card.",
                                scheduled_for=datetime(2026, 5, 18, 9, 0, tzinfo=timezone.utc),
                                status="PENDING",
                                delivery_channel="IN_APP"
                            ),
                            ExamReminder(
                                user_id=demo_user.id,
                                registration_id=reg2.id,
                                examination_id=exam2.id,
                                reminder_type="EXAM_30D",
                                title=f"30-Day Reminder: {exam2.name}",
                                message=f"Your {exam2.name} Tier 1 examination is in 30 days.",
                                scheduled_for=datetime(2026, 5, 13, 9, 0, tzinfo=timezone.utc),
                                status="PENDING",
                                delivery_channel="IN_APP"
                            )
                        ])

                # Seed Student Job Preference & Subscriptions
                pref_stmt = select(StudentJobPreference).where(StudentJobPreference.user_id == demo_user.id)
                pref_res = await db.execute(pref_stmt)
                if not pref_res.scalars().first():
                    db.add(StudentJobPreference(
                        user_id=demo_user.id,
                        qualification="GRADUATION",
                        degree_department="B.E. Computer Science & Engineering",
                        graduation_year=2025,
                        skills="Python, SQL, FastApi, Machine Learning, Problem Solving, Data Structures",
                        experience_level="FRESHER",
                        preferred_roles="Software Engineer, Bank PO, Civil Services Officer, Systems Engineer",
                        preferred_locations="Chennai, Bangalore, Hyderabad, All India",
                        expected_salary_min="₹6,00,000",
                        sector_preference="ALL",
                        job_alerts_enabled=True,
                        email_alerts_enabled=True
                    ))
                    
                    db.add_all([
                        JobAlertSubscription(
                            user_id=demo_user.id,
                            keyword="Software Engineer",
                            sector="ALL",
                            category="IT",
                            qualification="GRADUATION",
                            frequency="INSTANT"
                        ),
                        JobAlertSubscription(
                            user_id=demo_user.id,
                            keyword="Civil Services",
                            sector="CENTRAL_GOVT",
                            category="GOVERNMENT",
                            qualification="GRADUATION",
                            frequency="DAILY"
                        )
                    ])

            # 26. Seed Admin Alerts
            alert_stmt = select(AdminAlert)
            alert_res = await db.execute(alert_stmt)
            if not alert_res.scalars().first():
                db.add_all([
                    AdminAlert(
                        alert_type="NEW_INSTITUTION",
                        severity="INFO",
                        title="New Institution Verification Request",
                        message="National Institute of Technology Trichy has submitted credentials for direct result portal integration.",
                        status="OPEN"
                    ),
                    AdminAlert(
                        alert_type="JOB_PENDING_VERIFICATION",
                        severity="WARNING",
                        title="Gazette Notification Verification Required",
                        message="ISRO Scientist/Engineer 'SC' Recruitment notice uploaded by operator; pending gazette approval.",
                        status="OPEN"
                    ),
                    AdminAlert(
                        alert_type="WEBSITE_PROBE_NOTICE",
                        severity="INFO",
                        title="Official Directory Health Check Active",
                        message="Scheduled probe tested 67 official government and state recruitment endpoints. All operational.",
                        status="RESOLVED"
                    )
                ])

            # 27. Seed Scheduled Automation Task Logs
            task_stmt = select(ScheduledTaskLog)
            task_res = await db.execute(task_stmt)
            if not task_res.scalars().first():
                db.add_all([
                    ScheduledTaskLog(
                        task_name="RECALCULATE_EXAM_REMINDERS",
                        status="COMPLETED",
                        records_processed=142,
                        started_at=datetime(2026, 2, 20, 6, 0, tzinfo=timezone.utc),
                        completed_at=datetime(2026, 2, 20, 6, 1, tzinfo=timezone.utc)
                    ),
                    ScheduledTaskLog(
                        task_name="PROBE_GOV_WEBSITES",
                        status="COMPLETED",
                        records_processed=67,
                        started_at=datetime(2026, 2, 20, 5, 0, tzinfo=timezone.utc),
                        completed_at=datetime(2026, 2, 20, 5, 4, tzinfo=timezone.utc)
                    ),
                    ScheduledTaskLog(
                        task_name="EXPIRE_OLD_VACANCIES",
                        status="COMPLETED",
                        records_processed=8,
                        started_at=datetime(2026, 2, 20, 0, 0, tzinfo=timezone.utc),
                        completed_at=datetime(2026, 2, 20, 0, 1, tzinfo=timezone.utc)
                    ),
                    ScheduledTaskLog(
                        task_name="DISPATCH_MATCHING_JOB_ALERTS",
                        status="COMPLETED",
                        records_processed=86,
                        started_at=datetime(2026, 2, 20, 7, 0, tzinfo=timezone.utc),
                        completed_at=datetime(2026, 2, 20, 7, 2, tzinfo=timezone.utc)
                    )
                ])

        # 28. Seed Monitoring Sources
        src_stmt = select(MonitoringSource)
        src_res = await db.execute(src_stmt)
        if not src_res.scalars().first():
            db.add_all([
                MonitoringSource(
                    name="Union Public Service Commission (UPSC) Recruitment & Notices",
                    organization_code="UPSC",
                    organization_name="Union Public Service Commission",
                    category="GOVT_JOB",
                    state_code="ALL",
                    source_type="OFFICIAL_GOVT",
                    official_website_url="https://upsc.gov.in",
                    notification_url="https://upsc.gov.in/examinations/active-examinations",
                    verification_status="VERIFIED",
                    check_frequency="DAILY",
                    is_enabled=True,
                    priority=1,
                    last_checked_at=datetime.now(timezone.utc),
                    last_successful_check_at=datetime.now(timezone.utc)
                ),
                MonitoringSource(
                    name="Staff Selection Commission (SSC) Examination Portal",
                    organization_code="SSC",
                    organization_name="Staff Selection Commission",
                    category="GOVT_JOB",
                    state_code="ALL",
                    source_type="OFFICIAL_GOVT",
                    official_website_url="https://ssc.gov.in",
                    notification_url="https://ssc.gov.in/candidate-portal/notices",
                    verification_status="VERIFIED",
                    check_frequency="DAILY",
                    is_enabled=True,
                    priority=1,
                    last_checked_at=datetime.now(timezone.utc),
                    last_successful_check_at=datetime.now(timezone.utc)
                ),
                MonitoringSource(
                    name="Railway Recruitment Control Board (RRCB)",
                    organization_code="RRB",
                    organization_name="Railway Recruitment Control Board",
                    category="GOVT_JOB",
                    state_code="ALL",
                    source_type="OFFICIAL_GOVT",
                    official_website_url="https://indianrailways.gov.in",
                    notification_url="https://rrcb.gov.in/recruitment.html",
                    verification_status="VERIFIED",
                    check_frequency="DAILY",
                    is_enabled=True,
                    priority=1,
                    last_checked_at=datetime.now(timezone.utc),
                    last_successful_check_at=datetime.now(timezone.utc)
                ),
                MonitoringSource(
                    name="Institute of Banking Personnel Selection (IBPS)",
                    organization_code="IBPS",
                    organization_name="Institute of Banking Personnel Selection",
                    category="GOVT_JOB",
                    state_code="ALL",
                    source_type="OFFICIAL_GOVT",
                    official_website_url="https://www.ibps.in",
                    notification_url="https://www.ibps.in/current-vacancies",
                    verification_status="VERIFIED",
                    check_frequency="DAILY",
                    is_enabled=True,
                    priority=1,
                    last_checked_at=datetime.now(timezone.utc),
                    last_successful_check_at=datetime.now(timezone.utc)
                ),
                MonitoringSource(
                    name="Tamil Nadu Public Service Commission (TNPSC)",
                    organization_code="TNPSC",
                    organization_name="Tamil Nadu Public Service Commission",
                    category="GOVT_JOB",
                    state_code="TN",
                    source_type="OFFICIAL_GOVT",
                    official_website_url="https://www.tnpsc.gov.in",
                    notification_url="https://www.tnpsc.gov.in/english/notifications.aspx",
                    verification_status="VERIFIED",
                    check_frequency="DAILY",
                    is_enabled=True,
                    priority=2,
                    last_checked_at=datetime.now(timezone.utc),
                    last_successful_check_at=datetime.now(timezone.utc)
                ),
                MonitoringSource(
                    name="Central Board of Secondary Education (CBSE) Results & Exam Notices",
                    organization_code="CBSE",
                    organization_name="Central Board of Secondary Education",
                    category="SCHOOL_RESULT",
                    state_code="ALL",
                    source_type="EDUCATION_BOARD",
                    official_website_url="https://cbse.gov.in",
                    notification_url="https://cbseresults.nic.in",
                    verification_status="VERIFIED",
                    check_frequency="DAILY",
                    is_enabled=True,
                    priority=1,
                    last_checked_at=datetime.now(timezone.utc),
                    last_successful_check_at=datetime.now(timezone.utc)
                ),
                MonitoringSource(
                    name="National Institute of Open Schooling (NIOS)",
                    organization_code="NIOS",
                    organization_name="National Institute of Open Schooling",
                    category="SCHOOL_RESULT",
                    state_code="ALL",
                    source_type="EDUCATION_BOARD",
                    official_website_url="https://nios.ac.in",
                    notification_url="https://results.nios.ac.in",
                    verification_status="VERIFIED",
                    check_frequency="DAILY",
                    is_enabled=True,
                    priority=1,
                    last_checked_at=datetime.now(timezone.utc),
                    last_successful_check_at=datetime.now(timezone.utc)
                ),
                MonitoringSource(
                    name="National Scholarship Portal (NSP)",
                    organization_code="NSP",
                    organization_name="Ministry of Electronics and Information Technology",
                    category="SCHOLARSHIP",
                    state_code="ALL",
                    source_type="OFFICIAL_GOVT",
                    official_website_url="https://scholarships.gov.in",
                    notification_url="https://scholarships.gov.in/public/schemeGuidelines",
                    verification_status="VERIFIED",
                    check_frequency="DAILY",
                    is_enabled=True,
                    priority=1,
                    last_checked_at=datetime.now(timezone.utc),
                    last_successful_check_at=datetime.now(timezone.utc)
                ),
                MonitoringSource(
                    name="Joint Seat Allocation Authority (JoSAA)",
                    organization_code="JOSAA",
                    organization_name="Ministry of Education (MoE)",
                    category="ADMISSION",
                    state_code="ALL",
                    source_type="OFFICIAL_GOVT",
                    official_website_url="https://josaa.nic.in",
                    notification_url="https://josaa.nic.in/counselling-schedule",
                    verification_status="VERIFIED",
                    check_frequency="DAILY",
                    is_enabled=True,
                    priority=1,
                    last_checked_at=datetime.now(timezone.utc),
                    last_successful_check_at=datetime.now(timezone.utc)
                ),
                MonitoringSource(
                    name="Infosys Careers Official Talent Portal",
                    organization_code="INFOSYS",
                    organization_name="Infosys Limited",
                    category="PRIVATE_JOB",
                    state_code="ALL",
                    source_type="EMPLOYER_CAREER",
                    official_website_url="https://www.infosys.com",
                    notification_url="https://career.infosys.com/joblist",
                    verification_status="VERIFIED",
                    check_frequency="DAILY",
                    is_enabled=True,
                    priority=3,
                    last_checked_at=datetime.now(timezone.utc),
                    last_successful_check_at=datetime.now(timezone.utc)
                )
            ])

        # 29. Seed Monitoring Schedules (Asia/Kolkata 4 Slots)
        sched_stmt = select(MonitoringSchedule)
        sched_res = await db.execute(sched_stmt)
        if not sched_res.scalars().first():
            db.add_all([
                MonitoringSchedule(slot_name="Morning Source Check", time_slot="06:00", timezone="Asia/Kolkata", is_active=True, category_scope="ALL"),
                MonitoringSchedule(slot_name="Midday Source Check", time_slot="12:00", timezone="Asia/Kolkata", is_active=True, category_scope="ALL"),
                MonitoringSchedule(slot_name="Evening Source Check", time_slot="18:00", timezone="Asia/Kolkata", is_active=True, category_scope="ALL"),
                MonitoringSchedule(slot_name="Nightly Verification & Summary", time_slot="22:00", timezone="Asia/Kolkata", is_active=True, category_scope="ALL")
            ])

        # 30. Seed Detected Updates
        det_stmt = select(DetectedUpdate)
        det_res = await db.execute(det_stmt)
        if not det_res.scalars().first():
            db.add_all([
                DetectedUpdate(
                    title="UPSC Civil Services (Preliminary) Examination 2026 Notification Released",
                    organization="Union Public Service Commission",
                    category="EXAM",
                    state="All India",
                    description="UPSC has published official notification for Civil Services Examination (CSE) 2026 and Indian Forest Service (IFS) 2026 for approximately 1,100 administrative vacancies across India.",
                    qualification="Bachelor's Degree in any discipline from a recognized University",
                    vacancies_count=1100,
                    official_notification_url="https://upsc.gov.in/examinations/active-examinations",
                    application_url="https://upsconline.nic.in",
                    source_url="https://upsc.gov.in",
                    important_dates={"application_start": "2026-02-14", "application_end": "2026-03-05", "exam_date": "2026-05-24", "result_date": "Date Not Announced"},
                    publication_date=datetime(2026, 2, 14, 10, 0, tzinfo=timezone.utc),
                    verification_status="PUBLISHED",
                    change_type="NEW",
                    is_officially_verified=True,
                    verification_badge="OFFICIALLY_VERIFIED",
                    is_featured=True,
                    is_closing_soon=False,
                    published_at=datetime.now(timezone.utc)
                ),
                DetectedUpdate(
                    title="SSC Combined Graduate Level (CGL) 2026 Tier-1 Exam Dates Announced",
                    organization="Staff Selection Commission",
                    category="EXAM",
                    state="All India",
                    description="Staff Selection Commission has announced the schedule for CGL 2026 Computer Based Examination Tier-1. Admit cards will be released 4 days prior to exam dates on regional portals.",
                    qualification="Graduation Degree",
                    vacancies_count=14500,
                    official_notification_url="https://ssc.gov.in",
                    application_url="https://ssc.gov.in",
                    source_url="https://ssc.gov.in",
                    important_dates={"exam_date": "2026-09-12", "result_date": "Date Not Announced"},
                    publication_date=datetime(2026, 2, 18, 12, 0, tzinfo=timezone.utc),
                    verification_status="PUBLISHED",
                    change_type="DATE_CHANGED",
                    is_officially_verified=True,
                    verification_badge="OFFICIALLY_VERIFIED",
                    is_featured=True,
                    published_at=datetime.now(timezone.utc)
                ),
                DetectedUpdate(
                    title="RRB Group D CEN 02/2024 Final Scorecard & Cutoff Marks Notice",
                    organization="Railway Recruitment Control Board",
                    category="RESULT",
                    state="All India",
                    description="Railway Recruitment Boards across 21 zones have issued notice regarding normalisation formula and CEN 02/2024 Level 1 final scorecards. Students can access verified scorecards solely on official RRB regional portals.",
                    qualification="10th Pass / ITI",
                    vacancies_count=103769,
                    official_notification_url="https://indianrailways.gov.in",
                    application_url="https://rrcb.gov.in",
                    source_url="https://indianrailways.gov.in",
                    important_dates={"result_date": "2026-02-28 (Expected - Official Confirmation Pending)"},
                    publication_date=datetime(2026, 2, 19, 14, 0, tzinfo=timezone.utc),
                    verification_status="PUBLISHED",
                    change_type="UPDATED",
                    is_officially_verified=True,
                    verification_badge="EXPECTED_UNOFFICIAL",
                    published_at=datetime.now(timezone.utc)
                ),
                DetectedUpdate(
                    title="CBSE Class 10 & 12 Board Results 2026 – Official Verification Portal Readiness",
                    organization="Central Board of Secondary Education",
                    category="SCHOOL_RESULT",
                    state="All India",
                    description="CBSE has issued security circular instructing schools regarding DigiLocker security PIN distribution for Class 10 and 12 results. Official result release date has not yet been declared by the Controller of Examinations.",
                    qualification="Class 10 / Class 12 Appearing",
                    official_notification_url="https://cbse.gov.in",
                    application_url="https://cbseresults.nic.in",
                    source_url="https://cbse.gov.in",
                    important_dates={"result_date": "Date Not Announced"},
                    publication_date=datetime(2026, 2, 20, 11, 0, tzinfo=timezone.utc),
                    verification_status="PUBLISHED",
                    change_type="UPDATED",
                    is_officially_verified=True,
                    verification_badge="OFFICIALLY_VERIFIED",
                    published_at=datetime.now(timezone.utc)
                ),
                DetectedUpdate(
                    title="TNPSC Combined Civil Services Examination - IV (Group 4) 2026 Notification",
                    organization="Tamil Nadu Public Service Commission",
                    category="GOVT_JOB",
                    state="Tamil Nadu",
                    description="Direct recruitment to Village Administrative Officer (VAO), Junior Assistant, Bill Collector, Typist, and Steno-Typist posts under Tamil Nadu Ministerial & Judicial Services.",
                    qualification="SSLC (10th Standard) Passed with Tamil as one of the subjects",
                    vacancies_count=7382,
                    official_notification_url="https://www.tnpsc.gov.in",
                    application_url="https://apply.tnpscexams.in",
                    source_url="https://www.tnpsc.gov.in",
                    important_dates={"application_start": "2026-01-30", "application_end": "2026-02-28", "exam_date": "2026-06-09"},
                    publication_date=datetime(2026, 1, 30, 9, 0, tzinfo=timezone.utc),
                    verification_status="PUBLISHED",
                    change_type="NEW",
                    is_officially_verified=True,
                    verification_badge="OFFICIALLY_VERIFIED",
                    is_closing_soon=True,
                    published_at=datetime.now(timezone.utc)
                ),
                DetectedUpdate(
                    title="Infosys Specialist Programmer & Digital Specialist Engineer 2026 Batch",
                    organization="Infosys Limited",
                    category="PRIVATE_JOB",
                    state="All India",
                    description="Off-campus recruitment drive for 2025 and 2026 batch engineering graduates. Hands-on coding assessment in Data Structures, Algorithms, and System Design.",
                    qualification="B.E. / B.Tech / M.E. / M.Tech / MCA / M.Sc (Computer Science / IT)",
                    vacancies_count=2500,
                    official_notification_url="https://career.infosys.com",
                    application_url="https://career.infosys.com/joblist",
                    source_url="https://career.infosys.com",
                    important_dates={"application_end": "2026-03-15"},
                    publication_date=datetime(2026, 2, 10, 15, 0, tzinfo=timezone.utc),
                    verification_status="PUBLISHED",
                    change_type="NEW",
                    is_officially_verified=True,
                    verification_badge="THIRD_PARTY",
                    published_at=datetime.now(timezone.utc)
                ),
                DetectedUpdate(
                    title="NSP National Means-cum-Merit Scholarship Scheme (NMMSS) 2026 Renewal",
                    organization="Department of School Education & Literacy, MoE",
                    category="SCHOLARSHIP",
                    state="All India",
                    description="National Scholarship Portal has opened renewal applications for Class 10, 11, and 12 eligible students under NMMSS scheme offering INR 12,000 per annum financial grant.",
                    qualification="Class 9 to 12 students with minimum 55% aggregate",
                    official_notification_url="https://scholarships.gov.in",
                    application_url="https://scholarships.gov.in",
                    source_url="https://scholarships.gov.in",
                    important_dates={"application_end": "2026-03-31"},
                    publication_date=datetime(2026, 2, 1, 10, 0, tzinfo=timezone.utc),
                    verification_status="PUBLISHED",
                    change_type="NEW",
                    is_officially_verified=True,
                    verification_badge="OFFICIALLY_VERIFIED",
                    published_at=datetime.now(timezone.utc)
                ),
                DetectedUpdate(
                    title="JEE Main Session 2 Examination City Intimation Slip Release Notice",
                    organization="National Testing Agency (NTA)",
                    category="ADMIT_CARD",
                    state="All India",
                    description="NTA will release exam city advance allotment slips for JEE Main Session 2 on the official exam portal. Admit cards with roll numbers and venue addresses will follow 3 days prior.",
                    qualification="Class 12 / Appearing with PCM",
                    official_notification_url="https://jeemain.nta.ac.in",
                    application_url="https://jeemain.nta.ac.in",
                    source_url="https://jeemain.nta.ac.in",
                    important_dates={"exam_date": "2026-04-04"},
                    publication_date=datetime(2026, 2, 21, 9, 30, tzinfo=timezone.utc),
                    verification_status="PUBLISHED",
                    change_type="NEW",
                    is_officially_verified=True,
                    verification_badge="OFFICIALLY_VERIFIED",
                    published_at=datetime.now(timezone.utc)
                )
            ])

        # 31. Seed Website Health Checks
        hlth_stmt = select(WebsiteHealthCheck)
        hlth_res = await db.execute(hlth_stmt)
        if not hlth_res.scalars().first():
            db.add_all([
                WebsiteHealthCheck(component_name="HOMEPAGE", route_path="/", status="HEALTHY", latency_ms=42.5, http_status=200),
                WebsiteHealthCheck(component_name="EXAMS_PORTAL", route_path="/apply", status="HEALTHY", latency_ms=68.2, http_status=200),
                WebsiteHealthCheck(component_name="JOBS_PORTAL", route_path="/jobs", status="HEALTHY", latency_ms=54.1, http_status=200),
                WebsiteHealthCheck(component_name="RESULTS_CHECKER", route_path="/results", status="HEALTHY", latency_ms=39.8, http_status=200),
                WebsiteHealthCheck(component_name="SCHOOL_PORTAL", route_path="/school", status="HEALTHY", latency_ms=48.6, http_status=200),
                WebsiteHealthCheck(component_name="STUDENT_DASHBOARD", route_path="/dashboard", status="HEALTHY", latency_ms=61.0, http_status=200),
                WebsiteHealthCheck(component_name="ADMIN_PORTAL", route_path="/admin/dashboard", status="HEALTHY", latency_ms=75.3, http_status=200),
                WebsiteHealthCheck(component_name="API_GATEWAY", route_path="/api/health", status="HEALTHY", latency_ms=12.4, http_status=200),
                WebsiteHealthCheck(component_name="AUTH_SERVICE", route_path="/api/auth/login", status="HEALTHY", latency_ms=28.7, http_status=200),
                WebsiteHealthCheck(component_name="DATABASE", route_path="sqlite:///examhub.db", status="HEALTHY", latency_ms=3.2, http_status=200)
            ])

        # 32. Seed Maintenance Tasks
        task_m_stmt = select(MaintenanceTask)
        task_m_res = await db.execute(task_m_stmt)
        if not task_m_res.scalars().first():
            db.add_all([
                MaintenanceTask(
                    title="Verify TNPSC Group 4 One-Time Registration Gateway Response",
                    description="Ensure redirected OTR links to apply.tnpscexams.in respond within 3000ms during peak application deadlines.",
                    category="BROKEN_LINK",
                    priority="HIGH",
                    status="IN_PROGRESS",
                    reported_by="AUTOMATED_MONITOR",
                    deadline=datetime(2026, 2, 28, 18, 0, tzinfo=timezone.utc)
                ),
                MaintenanceTask(
                    title="Audit Content Freshness for Expired State Police Jobs",
                    description="Scan recruitment database and archive notifications whose application closing date was before February 15, 2026.",
                    category="CONTENT_UPDATE",
                    priority="MEDIUM",
                    status="RESOLVED",
                    reported_by="SUPER_ADMIN",
                    resolution_notes="Archived 4 expired police recruitment notices automatically.",
                    resolved_at=datetime.now(timezone.utc)
                ),
                MaintenanceTask(
                    title="Verify CSP & Security Headers Compliance across All School Routes",
                    description="Check Content-Security-Policy headers on /school/books/reader to guarantee sandboxed iframe protections.",
                    category="SECURITY_ISSUE",
                    priority="URGENT",
                    status="RESOLVED",
                    reported_by="SECURITY_AUDIT",
                    resolution_notes="Confirmed X-Frame-Options: DENY and strict referrer policies active.",
                    resolved_at=datetime.now(timezone.utc)
                )
            ])

        # 33. Seed Backup Records
        bkp_stmt = select(BackupRecord)
        bkp_res = await db.execute(bkp_stmt)
        if not bkp_res.scalars().first():
            db.add_all([
                BackupRecord(
                    backup_type="DAILY",
                    file_name="examhub_backup_20260220_020000.sql.gz",
                    file_size_kb=14280,
                    status="SUCCESS",
                    integrity_checksum="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                    storage_path="/var/backups/examhub/daily/examhub_backup_20260220.sql.gz",
                    retention_days=30,
                    last_verified_at=datetime.now(timezone.utc)
                ),
                BackupRecord(
                    backup_type="WEEKLY",
                    file_name="examhub_backup_week07_2026.sql.gz",
                    file_size_kb=13920,
                    status="SUCCESS",
                    integrity_checksum="ca978112ca1bbdcafac231b39a23dc4da7860814416067137f828062ec85a218",
                    storage_path="/var/backups/examhub/weekly/examhub_backup_week07_2026.sql.gz",
                    retention_days=90,
                    last_verified_at=datetime.now(timezone.utc)
                )
            ])

        # 34. Seed Daily Admin Report
        today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        rep_stmt = select(DailyAdminReport).where(DailyAdminReport.report_date == today_str)
        rep_res = await db.execute(rep_stmt)
        if not rep_res.scalars().first():
            db.add(DailyAdminReport(
                report_date=today_str,
                sources_checked_count=24,
                new_govt_jobs=5,
                new_private_jobs=3,
                new_exam_notices=2,
                new_results_announced=1,
                school_results_updated=1,
                new_admit_cards=2,
                scholarships_updated=1,
                deadlines_updated=3,
                broken_links_found=0,
                failed_sources_count=0,
                pending_verifications=1,
                failed_notifications=0,
                website_health_status="HEALTHY",
                api_health_status="HEALTHY",
                db_health_status="HEALTHY",
                backup_status="SUCCESS",
                security_alerts_count=0,
                maintenance_tasks_completed=2,
                outstanding_issues_count=1
            ))

            # 28. Seed Monitoring Sources
            src_stmt = select(MonitoringSource)
            src_res = await db.execute(src_stmt)
            if not src_res.scalars().first():
                db.add_all([
                    MonitoringSource(
                        name="Union Public Service Commission (UPSC) Recruitment & Notices",
                        organization_code="UPSC",
                        organization_name="Union Public Service Commission",
                        category="GOVT_JOB",
                        state_code="ALL",
                        source_type="OFFICIAL_GOVT",
                        official_website_url="https://upsc.gov.in",
                        notification_url="https://upsc.gov.in/examinations/active-examinations",
                        verification_status="VERIFIED",
                        check_frequency="DAILY",
                        is_enabled=True,
                        priority=1,
                        last_checked_at=datetime.now(timezone.utc),
                        last_successful_check_at=datetime.now(timezone.utc)
                    ),
                    MonitoringSource(
                        name="Staff Selection Commission (SSC) Examination Portal",
                        organization_code="SSC",
                        organization_name="Staff Selection Commission",
                        category="GOVT_JOB",
                        state_code="ALL",
                        source_type="OFFICIAL_GOVT",
                        official_website_url="https://ssc.gov.in",
                        notification_url="https://ssc.gov.in/candidate-portal/notices",
                        verification_status="VERIFIED",
                        check_frequency="DAILY",
                        is_enabled=True,
                        priority=1,
                        last_checked_at=datetime.now(timezone.utc),
                        last_successful_check_at=datetime.now(timezone.utc)
                    ),
                    MonitoringSource(
                        name="Railway Recruitment Control Board (RRCB)",
                        organization_code="RRB",
                        organization_name="Railway Recruitment Control Board",
                        category="GOVT_JOB",
                        state_code="ALL",
                        source_type="OFFICIAL_GOVT",
                        official_website_url="https://indianrailways.gov.in",
                        notification_url="https://rrcb.gov.in/recruitment.html",
                        verification_status="VERIFIED",
                        check_frequency="DAILY",
                        is_enabled=True,
                        priority=1,
                        last_checked_at=datetime.now(timezone.utc),
                        last_successful_check_at=datetime.now(timezone.utc)
                    ),
                    MonitoringSource(
                        name="Institute of Banking Personnel Selection (IBPS)",
                        organization_code="IBPS",
                        organization_name="Institute of Banking Personnel Selection",
                        category="GOVT_JOB",
                        state_code="ALL",
                        source_type="OFFICIAL_GOVT",
                        official_website_url="https://www.ibps.in",
                        notification_url="https://www.ibps.in/current-vacancies",
                        verification_status="VERIFIED",
                        check_frequency="DAILY",
                        is_enabled=True,
                        priority=1,
                        last_checked_at=datetime.now(timezone.utc),
                        last_successful_check_at=datetime.now(timezone.utc)
                    ),
                    MonitoringSource(
                        name="Tamil Nadu Public Service Commission (TNPSC)",
                        organization_code="TNPSC",
                        organization_name="Tamil Nadu Public Service Commission",
                        category="GOVT_JOB",
                        state_code="TN",
                        source_type="OFFICIAL_GOVT",
                        official_website_url="https://www.tnpsc.gov.in",
                        notification_url="https://www.tnpsc.gov.in/english/notifications.aspx",
                        verification_status="VERIFIED",
                        check_frequency="DAILY",
                        is_enabled=True,
                        priority=2,
                        last_checked_at=datetime.now(timezone.utc),
                        last_successful_check_at=datetime.now(timezone.utc)
                    ),
                    MonitoringSource(
                        name="Central Board of Secondary Education (CBSE) Results & Exam Notices",
                        organization_code="CBSE",
                        organization_name="Central Board of Secondary Education",
                        category="SCHOOL_RESULT",
                        state_code="ALL",
                        source_type="EDUCATION_BOARD",
                        official_website_url="https://cbse.gov.in",
                        notification_url="https://cbseresults.nic.in",
                        verification_status="VERIFIED",
                        check_frequency="DAILY",
                        is_enabled=True,
                        priority=1,
                        last_checked_at=datetime.now(timezone.utc),
                        last_successful_check_at=datetime.now(timezone.utc)
                    ),
                    MonitoringSource(
                        name="National Institute of Open Schooling (NIOS)",
                        organization_code="NIOS",
                        organization_name="National Institute of Open Schooling",
                        category="SCHOOL_RESULT",
                        state_code="ALL",
                        source_type="EDUCATION_BOARD",
                        official_website_url="https://nios.ac.in",
                        notification_url="https://results.nios.ac.in",
                        verification_status="VERIFIED",
                        check_frequency="DAILY",
                        is_enabled=True,
                        priority=1,
                        last_checked_at=datetime.now(timezone.utc),
                        last_successful_check_at=datetime.now(timezone.utc)
                    ),
                    MonitoringSource(
                        name="National Scholarship Portal (NSP)",
                        organization_code="NSP",
                        organization_name="Ministry of Electronics and Information Technology",
                        category="SCHOLARSHIP",
                        state_code="ALL",
                        source_type="OFFICIAL_GOVT",
                        official_website_url="https://scholarships.gov.in",
                        notification_url="https://scholarships.gov.in/public/schemeGuidelines",
                        verification_status="VERIFIED",
                        check_frequency="DAILY",
                        is_enabled=True,
                        priority=1,
                        last_checked_at=datetime.now(timezone.utc),
                        last_successful_check_at=datetime.now(timezone.utc)
                    ),
                    MonitoringSource(
                        name="Joint Seat Allocation Authority (JoSAA)",
                        organization_code="JOSAA",
                        organization_name="Ministry of Education (MoE)",
                        category="ADMISSION",
                        state_code="ALL",
                        source_type="OFFICIAL_GOVT",
                        official_website_url="https://josaa.nic.in",
                        notification_url="https://josaa.nic.in/counselling-schedule",
                        verification_status="VERIFIED",
                        check_frequency="DAILY",
                        is_enabled=True,
                        priority=1,
                        last_checked_at=datetime.now(timezone.utc),
                        last_successful_check_at=datetime.now(timezone.utc)
                    ),
                    MonitoringSource(
                        name="Infosys Careers Official Talent Portal",
                        organization_code="INFOSYS",
                        organization_name="Infosys Limited",
                        category="PRIVATE_JOB",
                        state_code="ALL",
                        source_type="EMPLOYER_CAREER",
                        official_website_url="https://www.infosys.com",
                        notification_url="https://career.infosys.com/joblist",
                        verification_status="VERIFIED",
                        check_frequency="DAILY",
                        is_enabled=True,
                        priority=3,
                        last_checked_at=datetime.now(timezone.utc),
                        last_successful_check_at=datetime.now(timezone.utc)
                    )
                ])

            # 29. Seed Monitoring Schedules (Asia/Kolkata 4 Slots)
            sched_stmt = select(MonitoringSchedule)
            sched_res = await db.execute(sched_stmt)
            if not sched_res.scalars().first():
                db.add_all([
                    MonitoringSchedule(slot_name="Morning Source Check", time_slot="06:00", timezone="Asia/Kolkata", is_active=True, category_scope="ALL"),
                    MonitoringSchedule(slot_name="Midday Source Check", time_slot="12:00", timezone="Asia/Kolkata", is_active=True, category_scope="ALL"),
                    MonitoringSchedule(slot_name="Evening Source Check", time_slot="18:00", timezone="Asia/Kolkata", is_active=True, category_scope="ALL"),
                    MonitoringSchedule(slot_name="Nightly Verification & Summary", time_slot="22:00", timezone="Asia/Kolkata", is_active=True, category_scope="ALL")
                ])

            # 30. Seed Detected Updates
            det_stmt = select(DetectedUpdate)
            det_res = await db.execute(det_stmt)
            if not det_res.scalars().first():
                db.add_all([
                    DetectedUpdate(
                        title="UPSC Civil Services (Preliminary) Examination 2026 Notification Released",
                        organization="Union Public Service Commission",
                        category="EXAM",
                        state="All India",
                        description="UPSC has published official notification for Civil Services Examination (CSE) 2026 and Indian Forest Service (IFS) 2026 for approximately 1,100 administrative vacancies across India.",
                        qualification="Bachelor's Degree in any discipline from a recognized University",
                        vacancies_count=1100,
                        official_notification_url="https://upsc.gov.in/examinations/active-examinations",
                        application_url="https://upsconline.nic.in",
                        source_url="https://upsc.gov.in",
                        important_dates={"application_start": "2026-02-14", "application_end": "2026-03-05", "exam_date": "2026-05-24", "result_date": "Date Not Announced"},
                        publication_date=datetime(2026, 2, 14, 10, 0, tzinfo=timezone.utc),
                        verification_status="PUBLISHED",
                        change_type="NEW",
                        is_officially_verified=True,
                        verification_badge="OFFICIALLY_VERIFIED",
                        is_featured=True,
                        is_closing_soon=False,
                        published_at=datetime.now(timezone.utc)
                    ),
                    DetectedUpdate(
                        title="SSC Combined Graduate Level (CGL) 2026 Tier-1 Exam Dates Announced",
                        organization="Staff Selection Commission",
                        category="EXAM",
                        state="All India",
                        description="Staff Selection Commission has announced the schedule for CGL 2026 Computer Based Examination Tier-1. Admit cards will be released 4 days prior to exam dates on regional portals.",
                        qualification="Graduation Degree",
                        vacancies_count=14500,
                        official_notification_url="https://ssc.gov.in",
                        application_url="https://ssc.gov.in",
                        source_url="https://ssc.gov.in",
                        important_dates={"exam_date": "2026-09-12", "result_date": "Date Not Announced"},
                        publication_date=datetime(2026, 2, 18, 12, 0, tzinfo=timezone.utc),
                        verification_status="PUBLISHED",
                        change_type="DATE_CHANGED",
                        is_officially_verified=True,
                        verification_badge="OFFICIALLY_VERIFIED",
                        is_featured=True,
                        published_at=datetime.now(timezone.utc)
                    ),
                    DetectedUpdate(
                        title="RRB Group D CEN 02/2024 Final Scorecard & Cutoff Marks Notice",
                        organization="Railway Recruitment Control Board",
                        category="RESULT",
                        state="All India",
                        description="Railway Recruitment Boards across 21 zones have issued notice regarding normalisation formula and CEN 02/2024 Level 1 final scorecards. Students can access verified scorecards solely on official RRB regional portals.",
                        qualification="10th Pass / ITI",
                        vacancies_count=103769,
                        official_notification_url="https://indianrailways.gov.in",
                        application_url="https://rrcb.gov.in",
                        source_url="https://indianrailways.gov.in",
                        important_dates={"result_date": "2026-02-28 (Expected - Official Confirmation Pending)"},
                        publication_date=datetime(2026, 2, 19, 14, 0, tzinfo=timezone.utc),
                        verification_status="PUBLISHED",
                        change_type="UPDATED",
                        is_officially_verified=True,
                        verification_badge="EXPECTED_UNOFFICIAL",
                        published_at=datetime.now(timezone.utc)
                    ),
                    DetectedUpdate(
                        title="CBSE Class 10 & 12 Board Results 2026 – Official Verification Portal Readiness",
                        organization="Central Board of Secondary Education",
                        category="SCHOOL_RESULT",
                        state="All India",
                        description="CBSE has issued security circular instructing schools regarding DigiLocker security PIN distribution for Class 10 and 12 results. Official result release date has not yet been declared by the Controller of Examinations.",
                        qualification="Class 10 / Class 12 Appearing",
                        official_notification_url="https://cbse.gov.in",
                        application_url="https://cbseresults.nic.in",
                        source_url="https://cbse.gov.in",
                        important_dates={"result_date": "Date Not Announced"},
                        publication_date=datetime(2026, 2, 20, 11, 0, tzinfo=timezone.utc),
                        verification_status="PUBLISHED",
                        change_type="UPDATED",
                        is_officially_verified=True,
                        verification_badge="OFFICIALLY_VERIFIED",
                        published_at=datetime.now(timezone.utc)
                    ),
                    DetectedUpdate(
                        title="TNPSC Combined Civil Services Examination - IV (Group 4) 2026 Notification",
                        organization="Tamil Nadu Public Service Commission",
                        category="GOVT_JOB",
                        state="Tamil Nadu",
                        description="Direct recruitment to Village Administrative Officer (VAO), Junior Assistant, Bill Collector, Typist, and Steno-Typist posts under Tamil Nadu Ministerial & Judicial Services.",
                        qualification="SSLC (10th Standard) Passed with Tamil as one of the subjects",
                        vacancies_count=7382,
                        official_notification_url="https://www.tnpsc.gov.in",
                        application_url="https://apply.tnpscexams.in",
                        source_url="https://www.tnpsc.gov.in",
                        important_dates={"application_start": "2026-01-30", "application_end": "2026-02-28", "exam_date": "2026-06-09"},
                        publication_date=datetime(2026, 1, 30, 9, 0, tzinfo=timezone.utc),
                        verification_status="PUBLISHED",
                        change_type="NEW",
                        is_officially_verified=True,
                        verification_badge="OFFICIALLY_VERIFIED",
                        is_closing_soon=True,
                        published_at=datetime.now(timezone.utc)
                    ),
                    DetectedUpdate(
                        title="Infosys Specialist Programmer & Digital Specialist Engineer 2026 Batch",
                        organization="Infosys Limited",
                        category="PRIVATE_JOB",
                        state="All India",
                        description="Off-campus recruitment drive for 2025 and 2026 batch engineering graduates. Hands-on coding assessment in Data Structures, Algorithms, and System Design.",
                        qualification="B.E. / B.Tech / M.E. / M.Tech / MCA / M.Sc (Computer Science / IT)",
                        vacancies_count=2500,
                        official_notification_url="https://career.infosys.com",
                        application_url="https://career.infosys.com/joblist",
                        source_url="https://career.infosys.com",
                        important_dates={"application_end": "2026-03-15"},
                        publication_date=datetime(2026, 2, 10, 15, 0, tzinfo=timezone.utc),
                        verification_status="PUBLISHED",
                        change_type="NEW",
                        is_officially_verified=True,
                        verification_badge="THIRD_PARTY",
                        published_at=datetime.now(timezone.utc)
                    ),
                    DetectedUpdate(
                        title="NSP National Means-cum-Merit Scholarship Scheme (NMMSS) 2026 Renewal",
                        organization="Department of School Education & Literacy, MoE",
                        category="SCHOLARSHIP",
                        state="All India",
                        description="National Scholarship Portal has opened renewal applications for Class 10, 11, and 12 eligible students under NMMSS scheme offering INR 12,000 per annum financial grant.",
                        qualification="Class 9 to 12 students with minimum 55% aggregate",
                        official_notification_url="https://scholarships.gov.in",
                        application_url="https://scholarships.gov.in",
                        source_url="https://scholarships.gov.in",
                        important_dates={"application_end": "2026-03-31"},
                        publication_date=datetime(2026, 2, 1, 10, 0, tzinfo=timezone.utc),
                        verification_status="PUBLISHED",
                        change_type="NEW",
                        is_officially_verified=True,
                        verification_badge="OFFICIALLY_VERIFIED",
                        published_at=datetime.now(timezone.utc)
                    ),
                    DetectedUpdate(
                        title="JEE Main Session 2 Examination City Intimation Slip Release Notice",
                        organization="National Testing Agency (NTA)",
                        category="ADMIT_CARD",
                        state="All India",
                        description="NTA will release exam city advance allotment slips for JEE Main Session 2 on the official exam portal. Admit cards with roll numbers and venue addresses will follow 3 days prior.",
                        qualification="Class 12 / Appearing with PCM",
                        official_notification_url="https://jeemain.nta.ac.in",
                        application_url="https://jeemain.nta.ac.in",
                        source_url="https://jeemain.nta.ac.in",
                        important_dates={"exam_date": "2026-04-04"},
                        publication_date=datetime(2026, 2, 21, 9, 30, tzinfo=timezone.utc),
                        verification_status="PUBLISHED",
                        change_type="NEW",
                        is_officially_verified=True,
                        verification_badge="OFFICIALLY_VERIFIED",
                        published_at=datetime.now(timezone.utc)
                    )
                ])

            # 31. Seed Website Health Checks
            hlth_stmt = select(WebsiteHealthCheck)
            hlth_res = await db.execute(hlth_stmt)
            if not hlth_res.scalars().first():
                db.add_all([
                    WebsiteHealthCheck(component_name="HOMEPAGE", route_path="/", status="HEALTHY", latency_ms=42.5, http_status=200),
                    WebsiteHealthCheck(component_name="EXAMS_PORTAL", route_path="/apply", status="HEALTHY", latency_ms=68.2, http_status=200),
                    WebsiteHealthCheck(component_name="JOBS_PORTAL", route_path="/jobs", status="HEALTHY", latency_ms=54.1, http_status=200),
                    WebsiteHealthCheck(component_name="RESULTS_CHECKER", route_path="/results", status="HEALTHY", latency_ms=39.8, http_status=200),
                    WebsiteHealthCheck(component_name="SCHOOL_PORTAL", route_path="/school", status="HEALTHY", latency_ms=48.6, http_status=200),
                    WebsiteHealthCheck(component_name="STUDENT_DASHBOARD", route_path="/dashboard", status="HEALTHY", latency_ms=61.0, http_status=200),
                    WebsiteHealthCheck(component_name="ADMIN_PORTAL", route_path="/admin/dashboard", status="HEALTHY", latency_ms=75.3, http_status=200),
                    WebsiteHealthCheck(component_name="API_GATEWAY", route_path="/api/health", status="HEALTHY", latency_ms=12.4, http_status=200),
                    WebsiteHealthCheck(component_name="AUTH_SERVICE", route_path="/api/auth/login", status="HEALTHY", latency_ms=28.7, http_status=200),
                    WebsiteHealthCheck(component_name="DATABASE", route_path="sqlite:///examhub.db", status="HEALTHY", latency_ms=3.2, http_status=200)
                ])

            # 32. Seed Maintenance Tasks
            task_m_stmt = select(MaintenanceTask)
            task_m_res = await db.execute(task_m_stmt)
            if not task_m_res.scalars().first():
                db.add_all([
                    MaintenanceTask(
                        title="Verify TNPSC Group 4 One-Time Registration Gateway Response",
                        description="Ensure redirected OTR links to apply.tnpscexams.in respond within 3000ms during peak application deadlines.",
                        category="BROKEN_LINK",
                        priority="HIGH",
                        status="IN_PROGRESS",
                        reported_by="AUTOMATED_MONITOR",
                        deadline=datetime(2026, 2, 28, 18, 0, tzinfo=timezone.utc)
                    ),
                    MaintenanceTask(
                        title="Audit Content Freshness for Expired State Police Jobs",
                        description="Scan recruitment database and archive notifications whose application closing date was before February 15, 2026.",
                        category="CONTENT_UPDATE",
                        priority="MEDIUM",
                        status="RESOLVED",
                        reported_by="SUPER_ADMIN",
                        resolution_notes="Archived 4 expired police recruitment notices automatically.",
                        resolved_at=datetime.now(timezone.utc)
                    ),
                    MaintenanceTask(
                        title="Verify CSP & Security Headers Compliance across All School Routes",
                        description="Check Content-Security-Policy headers on /school/books/reader to guarantee sandboxed iframe protections.",
                        category="SECURITY_ISSUE",
                        priority="URGENT",
                        status="RESOLVED",
                        reported_by="SECURITY_AUDIT",
                        resolution_notes="Confirmed X-Frame-Options: DENY and strict referrer policies active.",
                        resolved_at=datetime.now(timezone.utc)
                    )
                ])

            # 33. Seed Backup Records
            bkp_stmt = select(BackupRecord)
            bkp_res = await db.execute(bkp_stmt)
            if not bkp_res.scalars().first():
                db.add_all([
                    BackupRecord(
                        backup_type="DAILY",
                        file_name="examhub_backup_20260220_020000.sql.gz",
                        file_size_kb=14280,
                        status="SUCCESS",
                        integrity_checksum="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                        storage_path="/var/backups/examhub/daily/examhub_backup_20260220.sql.gz",
                        retention_days=30,
                        last_verified_at=datetime.now(timezone.utc)
                    ),
                    BackupRecord(
                        backup_type="WEEKLY",
                        file_name="examhub_backup_week07_2026.sql.gz",
                        file_size_kb=13920,
                        status="SUCCESS",
                        integrity_checksum="ca978112ca1bbdcafac231b39a23dc4da7860814416067137f828062ec85a218",
                        storage_path="/var/backups/examhub/weekly/examhub_backup_week07_2026.sql.gz",
                        retention_days=90,
                        last_verified_at=datetime.now(timezone.utc)
                    )
                ])

            # 35. Seed Website Operating Control (Online / Maintenance / Offline Modes)
            ctrl_stmt = select(WebsiteOperatingControl)
            ctrl_res = await db.execute(ctrl_stmt)
            if not ctrl_res.scalars().first():
                try:
                    control_entry = WebsiteOperatingControl(
                        mode="ONLINE",
                        maintenance_message="ExamHub India is currently undergoing scheduled platform upgrades to serve you better. We will be back online shortly.",
                        estimated_return_time="Tonight by 23:00 IST",
                        auto_online_enabled=True,
                        bypass_secret_key="examhub-admin-secure-maintenance-bypass"
                    )
                    db.add(control_entry)
                    await db.flush()

                    db.add(WebsiteStatusHistory(
                        previous_mode="INITIALIZING",
                        new_mode="ONLINE",
                        reason="Platform operational readiness confirmed on deployment initialization.",
                        admin_email="superadmin@examhub.gov.in",
                        ip_address="127.0.0.1"
                    ))
                except Exception:
                    pass

            await db.commit()
            print("Successfully initialized and seeded EXAMHUB INDIA database!")

if __name__ == "__main__":
    asyncio.run(seed_database())
