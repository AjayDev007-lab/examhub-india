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
    RRBGroupDResult, AISetting, Scholarship, PaymentTransaction, SecurityIncident
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

            # Seed SuperAdmin User
            super_admin = AdminUser(
                full_name="ExamHub Super Administrator",
                email=settings.SUPERADMIN_EMAIL,
                password_hash=hash_password(settings.SUPERADMIN_PASSWORD),
                role_id=super_role.id,
                is_active=True
            )
            db.add(super_admin)

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
            db.add_all(demo_results)

            # Seed Demo Student Account
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

            # Seed initial sample Payment Transactions for financial analytics
            pay_check = await db.execute(select(PaymentTransaction))
            if not pay_check.scalars().first():
                admin_user_res = await db.execute(select(AdminUser).where(AdminUser.email == settings.SUPERADMIN_EMAIL))
                super_admin = admin_user_res.scalars().first()
                std_user_res = await db.execute(select(User))
                first_student = std_user_res.scalars().first()
                if first_student:
                    db.add_all([
                        PaymentTransaction(
                            order_id="order_TEST_1001",
                            payment_id="pay_TEST_1001",
                            user_id=first_student.id,
                            tier="STUDENT_PRO",
                            amount=9900,
                            currency="INR",
                            status="COMPLETED",
                            hmac_signature="simulated_hmac_sha256_verified_sig_001"
                        ),
                        PaymentTransaction(
                            order_id="order_TEST_1002",
                            payment_id="pay_TEST_1002",
                            user_id=first_student.id,
                            tier="INSTITUTION_VERIFIED",
                            amount=1499900,
                            currency="INR",
                            status="COMPLETED",
                            hmac_signature="simulated_hmac_sha256_verified_sig_002"
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

            await db.commit()
            print("Successfully initialized and seeded EXAMHUB INDIA database!")

if __name__ == "__main__":
    asyncio.run(seed_database())
