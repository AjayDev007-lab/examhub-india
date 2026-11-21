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
async def test_monitoring_dashboard_stats(client: AsyncClient):
    res = await client.get("/api/admin/daily-updates/stats")
    assert res.status_code == 200
    data = res.json()
    assert "sources" in data
    assert "updates" in data
    assert "last_run" in data
    assert data["sources"]["total"] >= 1

@pytest.mark.asyncio
async def test_list_and_create_monitoring_source(client: AsyncClient):
    # 1. List
    res = await client.get("/api/admin/daily-updates/sources")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] >= 1
    
    # 2. Create new source
    new_source = {
        "name": "Karnataka Public Service Commission (KPSC) Recruitment",
        "organization_code": "KPSC",
        "organization_name": "Karnataka Public Service Commission",
        "category": "GOVT_JOB",
        "state_code": "KA",
        "source_type": "OFFICIAL_GOVT",
        "official_website_url": "https://kpsc.kar.nic.in",
        "notification_url": "https://kpsc.kar.nic.in/notifications",
        "check_frequency": "DAILY",
        "is_enabled": True,
        "priority": 2
    }
    create_res = await client.post("/api/admin/daily-updates/sources", json=new_source)
    assert create_res.status_code == 200
    c_data = create_res.json()
    assert c_data["success"] is True

@pytest.mark.asyncio
async def test_detected_updates_and_verification_pipeline(client: AsyncClient):
    # 1. List admin detected updates
    res = await client.get("/api/admin/daily-updates/updates")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] >= 1
    first_update = data["updates"][0]
    
    # 2. Verify / Approve action
    verify_res = await client.post(
        f"/api/admin/daily-updates/updates/{first_update['id']}/verify",
        json={
            "action": "PUBLISH",
            "verification_badge": "OFFICIALLY_VERIFIED",
            "notes": "Verified against official gazette notification."
        }
    )
    assert verify_res.status_code == 200
    assert verify_res.json()["status"] == "PUBLISHED"

@pytest.mark.asyncio
async def test_public_student_updates_feed(client: AsyncClient):
    res = await client.get("/api/updates")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] >= 1
    for u in data["updates"]:
        assert "title" in u
        assert "verification_badge" in u
        assert "official_notification_url" in u

@pytest.mark.asyncio
async def test_maintenance_cockpit_and_tasks(client: AsyncClient):
    # 1. Maintenance Dashboard
    dash_res = await client.get("/api/admin/maintenance/dashboard")
    assert dash_res.status_code == 200
    dash_data = dash_res.json()
    assert dash_data["status"] == "HEALTHY"
    assert len(dash_data["components"]) >= 5

    # 2. List Tasks
    task_res = await client.get("/api/admin/maintenance/tasks")
    assert task_res.status_code == 200
    assert task_res.json()["total"] >= 1

    # 3. Create Task
    create_task_res = await client.post("/api/admin/maintenance/tasks", json={
        "title": "Automated SSL Certificate Renewal Check",
        "description": "Verify SSL certificate expiry on results.examhub.gov.in subdomains",
        "category": "SECURITY_ISSUE",
        "priority": "HIGH"
    })
    assert create_task_res.status_code == 200
    new_task_id = create_task_res.json()["task_id"]

    # 4. Update task status
    update_task_res = await client.put(f"/api/admin/maintenance/tasks/{new_task_id}/status", json={
        "status": "RESOLVED",
        "resolution_notes": "SSL renewal verified valid for 365 days."
    })
    assert update_task_res.status_code == 200
    assert update_task_res.json()["status"] == "RESOLVED"

@pytest.mark.asyncio
async def test_maintenance_backups_and_daily_report(client: AsyncClient):
    # 1. List backups
    bkp_res = await client.get("/api/admin/maintenance/backups")
    assert bkp_res.status_code == 200
    assert bkp_res.json()["total"] >= 1

    # 2. Create manual snapshot
    create_bkp_res = await client.post("/api/admin/maintenance/backups", json={"backup_type": "MANUAL"})
    assert create_bkp_res.status_code == 200
    assert create_bkp_res.json()["success"] is True

    # 3. Get 20-Point Daily Admin Report
    rep_res = await client.get("/api/admin/maintenance/daily-report")
    assert rep_res.status_code == 200
    rep_data = rep_res.json()
    assert "summary_20_points" in rep_data
    assert rep_data["summary_20_points"]["1_sources_checked"] >= 1
