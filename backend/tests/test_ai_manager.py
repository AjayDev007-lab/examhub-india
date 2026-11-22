import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_ai_manager_telemetry_status():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.get("/api/admin/ai/manager/status")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "ONLINE"
        assert data["manager_name"] == "ExamHub India Autonomous AI Administrator"
        assert data["health_score"] >= 90
        assert data["smart_link_guardian"] == "ACTIVE"
        assert data["whatsapp_integration"] == "ONLINE"

@pytest.mark.asyncio
async def test_ai_manager_command_execution():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1. Health command
        health_resp = await client.post("/api/admin/ai/manager/command", json={"prompt": "check website health"})
        assert health_resp.status_code == 200
        assert "Platform Health Cockpit" in health_resp.json()["reply"]

        # 2. Job command
        job_resp = await client.post("/api/admin/ai/manager/command", json={"prompt": "find fresh IT jobs"})
        assert job_resp.status_code == 200
        assert "IT Job Discovery" in job_resp.json()["reply"]

@pytest.mark.asyncio
async def test_ai_manager_scan_trigger():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        scan_resp = await client.post("/api/admin/ai/manager/scan", json={"scan_type": "LINK_GUARDIAN"})
        assert scan_resp.status_code == 200
        assert scan_resp.json()["status"] == "COMPLETED"
        assert scan_resp.json()["scan_type"] == "LINK_GUARDIAN"
