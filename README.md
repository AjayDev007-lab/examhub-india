# EXAMHUB INDIA
### All India Examination Results, Hall Tickets & Student ID Cards
**Tagline:** *All Your Examination Documents and Results in One Place.*

---

## 1. System Vision & Architecture

EXAMHUB INDIA is a secure, high-performance, centralized educational examination platform designed for Indian students across all 28 states and 8 union territories. The platform provides verified, authorized pathways to retrieve:
1. **Examination Results & Scorecards** (Central Government, State PSCs, National Entrance Boards, Universities, and Autonomous Colleges)
2. **Hall Tickets / Admit Cards** (with venue address, shift times, barcode, and candidate instructions)
3. **Student ID Cards** (institution-issued digital identity credentials and verified personal vault storage)

### Tech Stack
- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS, Framer Motion, Lucide Icons.
- **Backend:** Python FastAPI, REST API Architecture, SQLAlchemy 2.0, Pydantic v2, PyMuPDF.
- **Database:** MySQL 8 in production / SQLite fallback for development and test execution.
- **Security:** Argon2id password hashing, JWT Bearer tokens, student-to-student document access isolation, DPDP data protection compliance, tamper-evident audit logging.

---

## 2. Directory Structure

```
├── backend/
│   ├── app/
│   │   ├── adapters/            # Modular portal adapters (UPSC, SSC, NTA, RRB, TNPSC, Universities)
│   │   │   ├── base.py          # BasePortalAdapter standard interface
│   │   │   ├── upsc.py          # Union Public Service Commission Adapter
│   │   │   ├── ssc.py           # Staff Selection Commission Adapter
│   │   │   ├── nta.py           # National Testing Agency (NEET UG, JEE Main, CUET)
│   │   │   ├── rrb.py           # Railway Recruitment Boards Adapter
│   │   │   ├── tnpsc.py         # Tamil Nadu Public Service Commission Adapter
│   │   │   ├── university.py    # Central / State University & Autonomous College Adapters
│   │   │   └── registry.py      # Adapter health and routing registry
│   │   ├── auth/                # Argon2id hashing, JWT, OTP validation, RBAC
│   │   ├── models/              # SQLAlchemy 2.0 schema for all 26 required database tables
│   │   ├── routers/             # REST APIs for Auth, Exams, Results, Hall Tickets, ID Cards, Docs, Admin
│   │   ├── schemas/             # Pydantic v2 validation models
│   │   ├── services/            # PyMuPDF PDF generation, audit logger, notification dispatcher
│   │   ├── config.py            # Environment configuration
│   │   ├── database.py          # Asynchronous engine & session factory
│   │   ├── initial_data.py      # Seed data: 36 States/UTs, Categories, Orgs, Exams, SuperAdmin
│   │   └── main.py              # FastAPI application entrypoint with security middlewares
│   ├── tests/
│   │   └── test_api.py          # Pytest automated test suite (10 test suites covering all workflows)
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx         # Public Homepage with global search, stats & service cards
│   │   │   ├── results/         # Examination Result Checker engine
│   │   │   ├── hall-tickets/    # Hall Ticket download engine
│   │   │   ├── id-cards/        # Student ID Card retrieval & upload engine
│   │   │   ├── directory/       # All-India 36 States/UTs Examination Directory
│   │   │   ├── auth/login/      # Student Login (Password + Mobile OTP)
│   │   │   ├── auth/register/   # Student Registration
│   │   │   ├── dashboard/       # 14-section Student Dashboard & Document Library
│   │   │   ├── admin/login/     # Separate Admin Portal Login
│   │   │   └── admin/dashboard/ # Separate Admin Console (Org/Exam management, health monitor, audit)
│   │   ├── components/          # Navbar, Footer, UI Cards
│   │   └── lib/                 # API client wrapper
│   ├── package.json
│   ├── tsconfig.json
│   └── tailwind.config.js
├── storage/                     # Encrypted local storage for scorecards, admit cards, and previews
├── Dockerfile                   # Production Backend Container
├── docker-compose.yml           # Multi-container orchestration (FastAPI + Next.js + MySQL 8 + Redis)
└── README.md
```

---

## 3. The 26 Database Tables

1. `users`: Student accounts with Argon2id password hash, active status, and verification flags.
2. `admin_roles`: Hierarchy (`SUPER_ADMIN`, `ADMIN`, `SUPPORT_STAFF`).
3. `admin_permissions`: Granular permissions mapped to roles.
4. `admin_users`: Administrative personnel credentials and last login tracking.
5. `states`: All 28 Indian States & 8 Union Territories with state codes.
6. `organization_categories`: Central Govt, State PSC, Entrance Board, University, etc.
7. `organizations`: Integrated institutions (UPSC, SSC, NTA, RRB, TNPSC, DU, etc.).
8. `examinations`: Competitive, entrance, and semester exams.
9. `exam_schedules`: Timetable dates, hall ticket release dates, and result dates.
10. `exam_results`: Official marks, percentage, rank, grade, and qualifying status.
11. `result_sources`: Official portals, NIC services, and verified announcement origins.
12. `result_integrations`: Modular adapter links and response health.
13. `result_announcements`: Official gazette notices, circulars, and merit list releases.
14. `portal_integrations`: Status tracking of automated APIs and redirects.
15. `integration_logs`: Real-time latency and status codes for each adapter.
16. `document_types`: Result Scorecards, Hall Tickets, Student ID Cards, Certificates.
17. `student_documents`: Student's personal vault with encrypted tokens and MIME metadata.
18. `result_documents`: Mapping between verified exam results and archived student documents.
19. `student_result_requests`: History of lookups performed by candidates.
20. `document_downloads`: Download access audit trail (IP address, user agent, timestamp).
21. `notifications`: In-app alerts for newly declared results and approaching exams.
22. `notification_preferences`: Student email and notification toggles.
23. `support_tickets`: Helpdesk inquiries regarding marksheets and portal access.
24. `audit_logs`: Tamper-evident system activity log.
25. `user_sessions`: Active session tokens with instant revocation support.
26. `system_settings`: Platform retention policies, registration toggles, and metadata.

---

## 4. Quick Start & Execution

### Backend
1. **Navigate to backend and install requirements:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```
2. **Seed the database (Populates 36 States/UTs, Organizations, Examinations, Admin):**
   ```bash
   python -m app.initial_data
   ```
3. **Start the FastAPI backend server:**
   ```bash
   uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```
   API Documentation is live at: `http://127.0.0.1:8000/docs`

### Running Backend Tests
```bash
cd backend
pytest tests/test_api.py -v
```
*All 10 tests verify registration, login, OTP flow, exam search, result checking, scorecard PDF generation, hall tickets, ID cards, student data isolation, and admin RBAC.*

### Frontend
1. **Navigate to frontend and install dependencies:**
   ```bash
   cd frontend
   pnpm install
   ```
2. **Build for production:**
   ```bash
   pnpm run build
   ```
3. **Start local development or production server:**
   ```bash
   pnpm run dev
   # or
   pnpm start
   ```
   Website will be live at: `http://localhost:3000`

---

## 5. Production Setup

The application does not ship with production credentials. Configure unique values from `.env.example` before starting the services. Production startup requires a strong `SECRET_KEY`, administrator credentials, an HTTPS frontend origin, and SMTP credentials for account recovery. Mobile OTP sign-in remains unavailable until an SMS provider is integrated.

For Vercel, set the project Root Directory to `frontend`. Configure `BACKEND_URL` as a server-only variable pointing to the FastAPI service, and set `SECRET_KEY` to the same random key used by FastAPI. Do not set `NEXT_PUBLIC_API_URL`; API requests are handled by the Next.js server routes.

For Docker Compose, copy `.env.example` to `.env`, replace every placeholder with unique values, and use a URL-encoded database password in `DATABASE_URL`. MySQL and Redis are kept on the private Compose network.

---

## 6. Security & Anti-Fraud Compliance

- **No Synthetic Documents:** Scorecards and admit cards represent verified institutional records.
- **Student Data Isolation:** Students can only view and download documents they own. Unauthorized attempts return `404/403`.
- **Admin Access Safeguards:** Administrators have zero access to student plain passwords, OTPs, or private session tokens.
- **DPDP Act Ready:** Private document encryption, signed short-lived download tokens, and student-driven account deletion controls.
