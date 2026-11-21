import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest_asyncio.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

@pytest.mark.asyncio
async def test_public_status_endpoint(client: AsyncClient):
    res = await client.get("/api/status")
    assert res.status_code == 200
    data = res.json()
    assert "mode" in data
    assert data["mode"] in ["ONLINE", "MAINTENANCE", "OFFLINE"]
    assert "is_public_accessible" in data

@pytest.mark.asyncio
async def test_admin_website_control_flow(client: AsyncClient):
    # 1. Login as Super Admin
    login_res = await client.post("/api/admin/login", json={
        "email": "superadmin@examhub.gov.in",
        "password": "SuperAdmin@ExamHub2026!"
    })
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Get status
    status_res = await client.get("/api/admin/website-control/status", headers=headers)
    assert status_res.status_code == 200
    s_data = status_res.json()
    assert "mode" in s_data

    # 3. Transition to MAINTENANCE mode
    maint_res = await client.post("/api/admin/website-control/mode", headers=headers, json={
        "mode": "MAINTENANCE",
        "reason": "Scheduled security patch deployment",
        "maintenance_message": "Platform undergoing scheduled maintenance.",
        "estimated_return_time": "Tonight by 23:30 IST"
    })
    assert maint_res.status_code == 200
    assert maint_res.json()["current_mode"] == "MAINTENANCE"

    # Verify public status reflects MAINTENANCE
    pub_res = await client.get("/api/status")
    assert pub_res.json()["mode"] == "MAINTENANCE"
    assert pub_res.json()["is_public_accessible"] is False

    # 4. Attempt OFFLINE mode without confirmation code -> should fail with 400
    bad_offline = await client.post("/api/admin/website-control/mode", headers=headers, json={
        "mode": "OFFLINE",
        "reason": "Critical infrastructure audit"
    })
    assert bad_offline.status_code == 400

    # 5. Take OFFLINE with valid confirmation code
    good_offline = await client.post("/api/admin/website-control/mode", headers=headers, json={
        "mode": "OFFLINE",
        "reason": "Critical infrastructure audit",
        "admin_confirmation_code": "CONFIRM-OFFLINE"
    })
    assert good_offline.status_code == 200
    assert good_offline.json()["current_mode"] == "OFFLINE"

    # 6. Check Audit History
    hist_res = await client.get("/api/admin/website-control/history", headers=headers)
    assert hist_res.status_code == 200
    assert hist_res.json()["total"] >= 2

    # 7. Bring Website back ONLINE
    online_res = await client.post("/api/admin/website-control/mode", headers=headers, json={
        "mode": "ONLINE",
        "reason": "Maintenance and audit successfully completed."
    })
    assert online_res.status_code == 200
    assert online_res.json()["current_mode"] == "ONLINE"

@pytest.mark.asyncio
async def test_emergency_recovery_flow(client: AsyncClient):
    # Test invalid key
    bad_res = await client.post("/api/admin/website-control/emergency-recovery", json={
        "recovery_key": "WRONG-KEY"
    })
    assert bad_res.status_code == 403

    # Test master recovery key
    good_res = await client.post("/api/admin/website-control/emergency-recovery", json={
        "recovery_key": "EMERGENCY-SUPERADMIN-RESTORE-ONLINE-2026",
        "reason": "Emergency recovery test"
    })
    assert good_res.status_code == 200
    assert good_res.json()["new_mode"] == "ONLINE"
