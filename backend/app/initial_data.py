import asyncio
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import AsyncSessionLocal, engine, Base
from app.models.models import (
    State, OrganizationCategory, Organization, Examination, ExamSchedule,
    AdminRole, AdminUser, AdminPermission, DocumentType, SystemSetting,
    ResultAnnouncement, ExamResult, PortalIntegration, User
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
            support_role = AdminRole(name="SUPPORT_STAFF", description="Student assistance and verification")
            db.add_all([super_role, admin_role, support_role])
            await db.flush()

            # Seed Permissions
            db.add_all([
                AdminPermission(role_id=super_role.id, permission_name="*"),
                AdminPermission(role_id=admin_role.id, permission_name="exams:write"),
                AdminPermission(role_id=admin_role.id, permission_name="results:publish"),
                AdminPermission(role_id=admin_role.id, permission_name="integrations:manage"),
                AdminPermission(role_id=support_role.id, permission_name="support:read_write")
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
            print("Successfully initialized and seeded EXAMHUB INDIA database!")

if __name__ == "__main__":
    asyncio.run(seed_database())
