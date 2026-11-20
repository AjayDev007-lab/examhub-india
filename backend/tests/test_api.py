import pytest
import asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.database import AsyncSessionLocal
from app.models.models import User, Examination, ExamResult

@pytest.fixture(scope="session")
def anyio_backend():
    return "asyncio"

@pytest.mark.asyncio
async def test_health_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.get("/api/health")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "healthy"
        assert data["platform"] == "EXAMHUB INDIA"

@pytest.mark.asyncio
async def test_list_states_and_categories():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.get("/api/states")
        assert resp.status_code == 200
        states = resp.json()
        assert len(states) >= 36 # 28 States + 8 UTs

        cat_resp = await client.get("/api/categories")
        assert cat_resp.status_code == 200
        cats = cat_resp.json()
        assert len(cats) >= 5

@pytest.mark.asyncio
async def test_examination_search():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Search NEET
        resp = await client.get("/api/exams/search?q=NEET")
        assert resp.status_code == 200
        exams = resp.json()
        assert len(exams) >= 1
        assert "NEET" in exams[0]["name"]

        # Search UPSC
        resp2 = await client.get("/api/exams/search?q=Civil Services")
        assert resp2.status_code == 200
        assert len(resp2.json()) >= 1

@pytest.mark.asyncio
async def test_student_registration_and_login():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        test_email = "newstudent_test@examhub.in"
        # 1. Register
        reg_payload = {
            "full_name": "Test Student Candidate",
            "email": test_email,
            "mobile": "9812345678",
            "password": "Password@ExamHub2026!",
            "password_confirm": "Password@ExamHub2026!"
        }
        reg_resp = await client.post("/api/auth/register", json=reg_payload)
        assert reg_resp.status_code in [201, 409] # 201 created or 409 if exists

        # 2. Login
        login_resp = await client.post("/api/auth/login", json={
            "email": test_email,
            "password": "Password@ExamHub2026!"
        })
        assert login_resp.status_code == 200
        token_data = login_resp.json()
        assert "access_token" in token_data
        token = token_data["access_token"]

        # 3. Access /api/auth/me
        me_resp = await client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert me_resp.status_code == 200
        assert me_resp.json()["email"] == test_email

@pytest.mark.asyncio
async def test_otp_flow():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        send_resp = await client.post("/api/auth/send-otp", json={"mobile": "9876543210"})
        assert send_resp.status_code == 200
        data = send_resp.json()
        assert data["success"] is True
        otp = data["debug_demo_otp"]

        verify_resp = await client.post("/api/auth/verify-otp", json={
            "mobile": "9876543210",
            "otp": otp
        })
        assert verify_resp.status_code == 200
        assert "access_token" in verify_resp.json()

@pytest.mark.asyncio
async def test_check_result_and_pdf_scorecard():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Search exam to get id
        exam_resp = await client.get("/api/exams/search?q=NEET")
        exams = exam_resp.json()
        assert len(exams) > 0
        exam_id = exams[0]["id"]

        # Check result
        check_resp = await client.post("/api/results/check", json={
            "examination_id": exam_id,
            "roll_number": "2604108821",
            "date_of_birth": "2007-08-14"
        })
        assert check_resp.status_code == 200
        result = check_resp.json()
        assert result["student_identifier_roll"] == "2604108821"
        assert result["qualifying_status"] == "QUALIFIED"
        assert result["has_scorecard"] is True
        assert "Physics" in str(result["subject_marks"])

        # Download scorecard PDF
        dl_resp = await client.get(f"/api/results/{result['id']}/download")
        assert dl_resp.status_code == 200
        assert dl_resp.headers["content-type"] == "application/pdf"
        assert len(dl_resp.content) > 1000

@pytest.mark.asyncio
async def test_hall_ticket_retrieval():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        exam_resp = await client.get("/api/exams/search?q=Civil Services")
        exams = exam_resp.json()
        assert len(exams) > 0
        exam_id = exams[0]["id"]

        ticket_resp = await client.post("/api/hall-tickets/check", json={
            "examination_id": exam_id,
            "application_number": "UPSC998877",
            "date_of_birth": "1999-11-20"
        })
        assert ticket_resp.status_code == 200
        ticket = ticket_resp.json()
        assert ticket["is_available"] is True
        assert "exam_center_name" in ticket
        assert "instructions" in ticket

        dl_resp = await client.get(f"/api/hall-tickets/{exam_id}/download?app_num=UPSC998877")
        assert dl_resp.status_code == 200
        assert dl_resp.headers["content-type"] == "application/pdf"

@pytest.mark.asyncio
async def test_student_id_card_retrieval():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        orgs_resp = await client.get("/api/organizations?query=Delhi")
        orgs = orgs_resp.json()
        assert len(orgs) > 0
        org_id = orgs[0]["id"]

        id_resp = await client.post("/api/id-cards/check", json={
            "organization_id": org_id,
            "student_enrollment_no": "22DUCS0084",
            "admission_year": 2022
        })
        assert id_resp.status_code == 200
        id_data = id_resp.json()
        assert id_data["enrollment_number"] == "22DUCS0084"
        assert "valid_upto" in id_data

@pytest.mark.asyncio
async def test_admin_portal_login_and_dashboard():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Admin Login
        login_resp = await client.post("/api/admin/login", json={
            "email": "superadmin@examhub.gov.in",
            "password": "SuperAdmin@ExamHub2026!"
        })
        assert login_resp.status_code == 200
        admin_token = login_resp.json()["access_token"]

        # Admin Dashboard
        dash_resp = await client.get("/api/admin/dashboard", headers={"Authorization": f"Bearer {admin_token}"})
        assert dash_resp.status_code == 200
        stats = dash_resp.json()
        assert stats["total_organizations"] >= 10
        assert stats["total_examinations"] >= 8

        # Integration status
        integ_resp = await client.get("/api/admin/integrations", headers={"Authorization": f"Bearer {admin_token}"})
        assert integ_resp.status_code == 200
        adapters = integ_resp.json()
        assert len(adapters) >= 5

@pytest.mark.asyncio
async def test_student_data_isolation():
    """Verify that Student A cannot download or view Student B's documents."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1. Login Student A
        login_a = await client.post("/api/auth/login", json={
            "email": "student@examhub.in",
            "password": "Student@ExamHub2026!"
        })
        token_a = login_a.json()["access_token"]

        # Check result as Student A to add to A's documents
        exam_resp = await client.get("/api/exams/search?q=NEET")
        exam_id = exam_resp.json()[0]["id"]
        res_a = await client.post(
            "/api/results/check",
            json={"examination_id": exam_id, "roll_number": "2604108821"},
            headers={"Authorization": f"Bearer {token_a}"}
        )
        doc_id = res_a.json()["document_id"]
        assert doc_id is not None

        # 2. Login Student B
        login_b = await client.post("/api/auth/login", json={
            "email": "newstudent_test@examhub.in",
            "password": "Password@ExamHub2026!"
        })
        token_b = login_b.json()["access_token"]

        # 3. Student B attempts to download Student A's document
        unauth_resp = await client.get(
            f"/api/documents/{doc_id}/download",
            headers={"Authorization": f"Bearer {token_b}"}
        )
        assert unauth_resp.status_code == 404 # Forbidden / Not Found for isolation
