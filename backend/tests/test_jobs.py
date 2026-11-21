import pytest
import pytest_asyncio
import uuid
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest_asyncio.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

@pytest.mark.asyncio
async def test_list_jobs_and_default_pagination(client: AsyncClient):
    resp = await client.get("/api/jobs?limit=50")
    assert resp.status_code == 200
    data = resp.json()
    assert "jobs" in data
    assert "total" in data
    assert data["total"] > 0
    assert len(data["jobs"]) > 0

    # Verify fields on returned job
    sample = data["jobs"][0]
    assert "title" in sample
    assert "organization_name" in sample
    assert "slug" in sample
    assert "sector" in sample
    assert "last_date_to_apply" in sample
    assert "official_apply_url" in sample

@pytest.mark.asyncio
async def test_filter_jobs_by_sector(client: AsyncClient):
    resp = await client.get("/api/jobs?sector=CENTRAL_GOVT")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["jobs"]) > 0
    for job in data["jobs"]:
        assert job["sector"] == "CENTRAL_GOVT"

@pytest.mark.asyncio
async def test_filter_jobs_by_category(client: AsyncClient):
    resp = await client.get("/api/jobs?category=BANKING")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["jobs"]) > 0
    for job in data["jobs"]:
        assert job["category"] == "BANKING"

@pytest.mark.asyncio
async def test_filter_jobs_by_qualification(client: AsyncClient):
    resp = await client.get("/api/jobs?qualification=GRADUATION")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["jobs"]) > 0
    for job in data["jobs"]:
        assert "graduation" in job["qualification"].lower()

@pytest.mark.asyncio
async def test_search_jobs(client: AsyncClient):
    resp = await client.get("/api/jobs?search=upsc")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["jobs"]) > 0
    assert any("upsc" in (j["slug"] + j["title"] + j["organization_name"]).lower() for j in data["jobs"])

@pytest.mark.asyncio
async def test_get_single_job_by_slug(client: AsyncClient):
    # Retrieve job by slug
    list_resp = await client.get("/api/jobs?limit=1")
    job = list_resp.json()["jobs"][0]
    slug = job["slug"]

    resp = await client.get(f"/api/jobs/{slug}")
    assert resp.status_code == 200
    data = resp.json()
    assert data["slug"] == slug
    assert data["title"] == job["title"]
    assert "selection_stages" in data

@pytest.mark.asyncio
async def test_job_save_toggle(client: AsyncClient):
    list_resp = await client.get("/api/jobs?limit=1")
    job_id = list_resp.json()["jobs"][0]["id"]
    test_user_id = 99991

    # First toggle: Save
    save_resp = await client.post(f"/api/jobs/{job_id}/save?user_id={test_user_id}")
    assert save_resp.status_code == 200
    save_data = save_resp.json()
    assert save_data["saved"] is True

    # Check student saved list
    saved_list_resp = await client.get(f"/api/jobs/student/saved?user_id={test_user_id}")
    assert saved_list_resp.status_code == 200
    saved_jobs = saved_list_resp.json().get("saved_jobs", [])
    assert any(j["id"] == job_id for j in saved_jobs)

    # Second toggle: Unsave
    unsave_resp = await client.post(f"/api/jobs/{job_id}/save?user_id={test_user_id}")
    assert unsave_resp.status_code == 200
    unsave_data = unsave_resp.json()
    assert unsave_data["saved"] is False

@pytest.mark.asyncio
async def test_job_application_tracking(client: AsyncClient):
    list_resp = await client.get("/api/jobs?limit=1")
    job_id = list_resp.json()["jobs"][0]["id"]
    test_user_id = 99992

    # Track application redirect
    apply_resp = await client.post(
        f"/api/jobs/{job_id}/apply?user_id={test_user_id}",
        json={"application_status": "REDIRECTED_TO_PORTAL", "notes": "Applied on official UPSC portal"}
    )
    assert apply_resp.status_code == 200
    data = apply_resp.json()
    assert data["tracked"] is True
    assert "official_url" in data

    # Verify in student applied tracker
    tracker_resp = await client.get(f"/api/jobs/student/applied?user_id={test_user_id}")
    assert tracker_resp.status_code == 200
    applied_list = tracker_resp.json().get("applications", [])
    assert any(app["job_id"] == job_id for app in applied_list)

@pytest.mark.asyncio
async def test_job_report_issue(client: AsyncClient):
    list_resp = await client.get("/api/jobs?limit=1")
    job_id = list_resp.json()["jobs"][0]["id"]

    report_resp = await client.post(
        f"/api/jobs/{job_id}/report",
        json={
            "report_type": "DEADLINE_EXTENDED",
            "description": "The commission announced a 5-day extension on the official portal.",
            "reporter_email": "candidate@example.gov.in"
        }
    )
    assert report_resp.status_code == 200
    data = report_resp.json()
    assert data["success"] is True

@pytest.mark.asyncio
async def test_job_sources_directory(client: AsyncClient):
    resp = await client.get("/api/jobs/sources/directory")
    assert resp.status_code == 200
    data = resp.json()
    assert "sources" in data
    assert len(data["sources"]) > 0
    codes = [s["code"] for s in data["sources"]]
    assert "UPSC" in codes
    assert "SSC" in codes
    assert "RRB" in codes

@pytest.mark.asyncio
async def test_admin_create_and_update_job(client: AsyncClient):
    admin_login = await client.post(
        "/api/admin/login",
        json={"email": "superadmin@examhub.gov.in", "password": "SuperAdmin@ExamHub2026!"}
    )
    assert admin_login.status_code == 200
    admin_token = admin_login.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    unique_slug = f"test-isro-scientist-{uuid.uuid4().hex[:6]}"
    new_job_payload = {
        "title": "ISRO Scientist/Engineer 'SC' Recruitment 2025",
        "organization_name": "Indian Space Research Organisation (ISRO)",
        "slug": unique_slug,
        "sector": "CENTRAL_GOVT",
        "category": "ENGINEERING",
        "work_mode": "ON_SITE",
        "total_vacancies": 85,
        "location": "Bengaluru / Sriharikota",
        "qualification": "GRADUATION",
        "qualification_description": "First Class B.E. / B.Tech in Mechanical, Electronics or Computer Science",
        "age_limit": "18 - 28 years",
        "pay_scale": "Level 10 (₹56,100 - ₹1,77,500)",
        "application_fee": "₹250 (Exempted for Women/SC/ST)",
        "last_date_to_apply": "2025-10-31T23:59:59",
        "official_apply_url": "https://www.isro.gov.in/Careers.html",
        "official_notification_pdf_url": "https://www.isro.gov.in/media_isro/pdf/advt2025.pdf",
        "source_name": "ISRO ICRB Central Portal",
        "selection_stages": ["Written Test (ICRB)", "Personal Interview"],
        "status": "PUBLISHED"
    }

    create_resp = await client.post("/api/jobs", json=new_job_payload, headers=admin_headers)
    assert create_resp.status_code == 200
    created = create_resp.json()
    assert created["slug"] == unique_slug
    assert created["total_vacancies"] == 85

    # Update status to DRAFT
    job_id = created["id"]
    update_resp = await client.put(f"/api/jobs/{job_id}", json={"status": "DRAFT"}, headers=admin_headers)
    assert update_resp.status_code == 200
    updated = update_resp.json()
    assert updated["status"] == "DRAFT"
