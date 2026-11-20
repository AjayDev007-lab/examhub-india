import pytest
import pytest_asyncio
import random
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest_asyncio.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

@pytest.mark.asyncio
async def test_list_official_websites(client: AsyncClient):
    # Fetch public directory
    resp = await client.get("/api/directory/websites?limit=50")
    assert resp.status_code == 200
    data = resp.json()
    assert "websites" in data
    assert "total" in data
    assert data["total"] > 0

    # Ensure key national portals are present
    names = [w["name"] for w in data["websites"]]
    assert any("National Portal" in n or "UPSC" in n for n in names)

@pytest.mark.asyncio
async def test_filter_official_websites_by_category(client: AsyncClient):
    resp = await client.get("/api/directory/websites?category_type=CENTRAL_RECRUITMENT")
    assert resp.status_code == 200
    data = resp.json()
    for w in data["websites"]:
        assert w["category_type"] == "CENTRAL_RECRUITMENT"

@pytest.mark.asyncio
async def test_search_official_websites(client: AsyncClient):
    resp = await client.get("/api/directory/websites?search=upsc")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["websites"]) > 0
    assert any("UPSC" in (w["code"] or "") or "UPSC" in w["name"] for w in data["websites"])

@pytest.mark.asyncio
async def test_get_single_website_and_verify(client: AsyncClient):
    # Get first website
    list_resp = await client.get("/api/directory/websites?limit=1")
    web_id = list_resp.json()["websites"][0]["id"]

    # Get single
    resp = await client.get(f"/api/directory/websites/{web_id}")
    assert resp.status_code == 200
    assert resp.json()["id"] == web_id

    # Run verification ping probe
    verify_resp = await client.post(f"/api/directory/websites/{web_id}/verify")
    assert verify_resp.status_code == 200
    res_data = verify_resp.json()
    assert res_data["website_id"] == web_id
    assert "status_code" in res_data
    assert "latency_ms" in res_data

@pytest.mark.asyncio
async def test_broken_link_report_and_admin_workflow(client: AsyncClient):
    # Get a website
    list_resp = await client.get("/api/directory/websites?limit=1")
    web_id = list_resp.json()["websites"][0]["id"]

    # 1. Visitor submits report
    report_data = {
        "website_id": web_id,
        "reporter_name": "Test Student",
        "reporter_email": "student@example.com",
        "reported_issue": "HTTP_404",
        "details": "Exam notification link returned 404 on government server."
    }
    rep_resp = await client.post("/api/directory/reports", json=report_data)
    assert rep_resp.status_code == 200
    report_id = rep_resp.json()["report_id"]

    # 2. Login as admin
    admin_login = await client.post(
        "/api/admin/login",
        json={"email": "superadmin@examhub.gov.in", "password": "SuperAdmin@ExamHub2026!"}
    )
    admin_token = admin_login.json()["access_token"]
    headers = {"Authorization": f"Bearer {admin_token}"}

    # 3. Admin lists reports
    admin_rep_list = await client.get("/api/admin/directory/reports", headers=headers)
    assert admin_rep_list.status_code == 200
    reports = admin_rep_list.json()["reports"]
    assert any(r["id"] == report_id for r in reports)

    # 4. Admin updates report
    patch_resp = await client.patch(
        f"/api/admin/directory/reports/{report_id}",
        json={"status": "RESOLVED", "admin_notes": "URL verified with NIC team."},
        headers=headers
    )
    assert patch_resp.status_code == 200
    assert patch_resp.json()["status"] == "RESOLVED"

@pytest.mark.asyncio
async def test_student_favourite_website(client: AsyncClient):
    # Login as demo student
    login_resp = await client.post(
        "/api/auth/login",
        json={"email": "student@examhub.in", "password": "Student@ExamHub2026!"}
    )
    student_token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {student_token}"}

    list_resp = await client.get("/api/directory/websites?limit=1")
    web_id = list_resp.json()["websites"][0]["id"]

    # Toggle bookmark on
    fav_resp1 = await client.post(f"/api/directory/websites/{web_id}/favourite", headers=headers)
    assert fav_resp1.status_code == 200

    # Check favourites list
    my_favs = await client.get("/api/directory/favourites", headers=headers)
    assert my_favs.status_code == 200

    # Toggle bookmark off
    fav_resp2 = await client.post(f"/api/directory/websites/{web_id}/favourite", headers=headers)
    assert fav_resp2.status_code == 200

@pytest.mark.asyncio
async def test_admin_create_and_update_website(client: AsyncClient):
    admin_login = await client.post(
        "/api/admin/login",
        json={"email": "superadmin@examhub.gov.in", "password": "SuperAdmin@ExamHub2026!"}
    )
    admin_token = admin_login.json()["access_token"]
    headers = {"Authorization": f"Bearer {admin_token}"}

    rnd = random.randint(1000, 9999)
    new_site = {
        "name": f"Indian Space Recruitment Board {rnd}",
        "code": f"ISRO-{rnd}",
        "category_type": "CENTRAL_RECRUITMENT",
        "official_url": f"https://isro{rnd}.gov.in/",
        "domain": f"isro{rnd}.gov.in",
        "description": "Recruitment board for scientist and technical posts.",
        "verification_source": "Department of Space / NIC",
        "is_featured": False
    }

    create_resp = await client.post("/api/admin/directory/websites", json=new_site, headers=headers)
    assert create_resp.status_code == 200
    created_id = create_resp.json()["website"]["id"]

    # Update website
    update_resp = await client.put(
        f"/api/admin/directory/websites/{created_id}",
        json={"is_featured": True, "description": "Updated official remit."},
        headers=headers
    )
    assert update_resp.status_code == 200

    # Verify update
    get_resp = await client.get(f"/api/directory/websites/{created_id}")
    assert get_resp.status_code == 200
    assert get_resp.json()["is_featured"] is True
