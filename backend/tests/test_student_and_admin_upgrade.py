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

@pytest_asyncio.fixture
async def student_auth(client: AsyncClient):
    unique_email = f"student_{uuid.uuid4().hex[:8]}@examhub.in"
    reg_resp = await client.post("/api/auth/register", json={
        "full_name": "Test Candidate",
        "email": unique_email,
        "mobile": f"98{uuid.uuid4().int % 100000000:08d}",
        "password": "Password123!",
        "password_confirm": "Password123!"
    })
    assert reg_resp.status_code == 201
    data = reg_resp.json()
    token = data["access_token"]
    user_id = data["user"]["id"]
    return {
        "headers": {"Authorization": f"Bearer {token}"},
        "user_id": user_id,
        "email": unique_email
    }


# ============================================================================
# 1. ADMIN ANALYTICS, EXPORT, ALERTS & AUTOMATION ENGINE TESTS
# ============================================================================

@pytest.mark.asyncio
async def test_admin_analytics_overview(client: AsyncClient):
    # Test range: today
    resp_today = await client.get("/api/admin/analytics/overview?range_type=today")
    assert resp_today.status_code == 200
    data_today = resp_today.json()
    assert "metrics" in data_today
    assert "charts" in data_today
    assert "range_type" in data_today
    assert data_today["range_type"] == "today"

    # Test range: 30d
    resp_30d = await client.get("/api/admin/analytics/overview?range_type=30d")
    assert resp_30d.status_code == 200
    data_30d = resp_30d.json()
    assert data_30d["metrics"]["total_users"] >= 1
    assert data_30d["metrics"]["total_jobs"] >= 1
    assert data_30d["metrics"]["total_websites"] >= 1


@pytest.mark.asyncio
async def test_admin_analytics_csv_export(client: AsyncClient):
    resp = await client.get("/api/admin/analytics/export?format=csv")
    assert resp.status_code == 200
    assert "text/csv" in resp.headers.get("content-type", "")
    content = resp.text
    assert "ExamHub India Platform Analytics Export" in content
    assert "Metric Category,Indicator,Value" in content
    assert "Total Registered Students" in content


@pytest.mark.asyncio
async def test_admin_alerts_workflow(client: AsyncClient):
    # Fetch alerts
    resp = await client.get("/api/admin/alerts")
    assert resp.status_code == 200
    data = resp.json()
    assert "alerts" in data
    alerts = data["alerts"]
    assert len(alerts) > 0

    first_alert = alerts[0]
    alert_id = first_alert["id"]

    # Update alert status to RESOLVED
    update_resp = await client.put(f"/api/admin/alerts/{alert_id}/status", json={"status": "RESOLVED"})
    assert update_resp.status_code == 200
    updated_data = update_resp.json()
    assert updated_data["success"] is True
    assert updated_data["status"] == "RESOLVED"


@pytest.mark.asyncio
async def test_admin_automation_runner(client: AsyncClient):
    # Run recalculate reminders task
    run_resp = await client.post("/api/admin/automation/run", json={"task_name": "RECALCULATE_REMINDERS"})
    assert run_resp.status_code == 200
    res_data = run_resp.json()
    assert res_data["status"] == "COMPLETED"
    assert res_data["task_name"] == "RECALCULATE_REMINDERS"

    # Fetch automation logs
    logs_resp = await client.get("/api/admin/automation/logs")
    assert logs_resp.status_code == 200
    data = logs_resp.json()
    assert "logs" in data
    logs = data["logs"]
    assert len(logs) > 0
    assert logs[0]["task_name"] == "RECALCULATE_REMINDERS"


# ============================================================================
# 2. STUDENT EXAMINATION REGISTRATION LIFECYCLE TESTS
# ============================================================================

@pytest.mark.asyncio
async def test_student_exam_registration_and_status_transitions(client: AsyncClient, student_auth: dict):
    headers = student_auth["headers"]

    # 1. Register for an existing exam (e.g. UPSC CSE - id 1)
    reg_resp = await client.post(
        "/api/student/exams/register",
        headers=headers,
        json={
            "examination_id": 1,
            "status": "ADDED_TO_MY_EXAMS",
            "notes": "Target examination for 2026 attempt"
        }
    )
    assert reg_resp.status_code == 200 or reg_resp.status_code == 201
    reg_data = reg_resp.json()
    assert reg_data["success"] is True
    reg_id = reg_data["registration_id"]

    # 2. Transition status to APPLICATION_SUBMITTED with application number
    update_resp = await client.put(
        f"/api/student/exams/{reg_id}/status",
        headers=headers,
        json={
            "status": "APPLICATION_SUBMITTED",
            "application_number": "UPSC-2026-998811",
            "notes": "Submitted on official UPSC portal"
        }
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["success"] is True

    # 3. Transition to APPLICATION_CONFIRMED
    confirm_resp = await client.put(
        f"/api/student/exams/{reg_id}/status",
        headers=headers,
        json={
            "status": "APPLICATION_CONFIRMED",
            "application_number": "UPSC-2026-998811"
        }
    )
    assert confirm_resp.status_code == 200
    assert confirm_resp.json()["success"] is True

    # 4. List my registered exams
    list_resp = await client.get("/api/student/exams", headers=headers)
    assert list_resp.status_code == 200
    exams_list = list_resp.json()["registered_exams"]
    matched = [e for e in exams_list if e["id"] == reg_id]
    assert len(matched) == 1
    assert matched[0]["status"] == "APPLICATION_CONFIRMED"


@pytest.mark.asyncio
async def test_student_external_exam_entry(client: AsyncClient, student_auth: dict):
    headers = student_auth["headers"]

    resp = await client.post(
        "/api/student/exams/external",
        headers=headers,
        json={
            "external_exam_name": "ISRO Scientist/Engineer SC Exam",
            "external_authority": "Indian Space Research Organisation",
            "external_exam_date": "2026-08-15T09:30:00Z",
            "external_application_deadline": "2026-06-30T17:00:00Z",
            "status": "APPLICATION_SUBMITTED",
            "application_number": "ISRO-2026-4422",
            "notes": "Exam center in Bengaluru"
        }
    )
    assert resp.status_code == 200 or resp.status_code == 201
    reg_id = resp.json()["registration_id"]

    list_resp = await client.get("/api/student/exams", headers=headers)
    assert list_resp.status_code == 200
    exams_list = list_resp.json()["registered_exams"]
    matched = [e for e in exams_list if e["id"] == reg_id]
    assert len(matched) == 1
    assert matched[0]["is_external"] is True
    assert matched[0]["external_exam_name"] == "ISRO Scientist/Engineer SC Exam"
    assert matched[0]["status"] == "APPLICATION_SUBMITTED"


# ============================================================================
# 3. STUDENT CALENDAR & RFC 5545 .ICS EXPORT TESTS
# ============================================================================

@pytest.mark.asyncio
async def test_student_calendar_events_and_export(client: AsyncClient, student_auth: dict):
    headers = student_auth["headers"]

    # 1. Create a custom calendar event
    create_resp = await client.post(
        "/api/student/calendar/events",
        headers=headers,
        json={
            "title": "Mock Test 1: Full Length CSAT",
            "event_type": "CUSTOM",
            "event_date": "2026-06-01T10:00:00Z",
            "notes": "Simulate real exam hall pressure"
        }
    )
    assert create_resp.status_code == 200 or create_resp.status_code == 201
    event_id = create_resp.json()["event_id"]

    # 2. Get calendar events
    list_resp = await client.get("/api/student/calendar/events", headers=headers)
    assert list_resp.status_code == 200
    events = list_resp.json()["events"]
    assert any(ev["id"] == event_id for ev in events)

    # 3. Export RFC 5545 .ics calendar
    export_resp = await client.get("/api/student/calendar/export.ics", headers=headers)
    assert export_resp.status_code == 200
    assert "text/calendar" in export_resp.headers.get("content-type", "")
    ics_text = export_resp.text
    assert "BEGIN:VCALENDAR" in ics_text
    assert "PRODID:-//ExamHub India//Student Examination Calendar//EN" in ics_text
    assert "BEGIN:VEVENT" in ics_text
    assert "END:VCALENDAR" in ics_text


# ============================================================================
# 4. STUDENT CAREER PREFERENCES & JOB RECOMMENDATIONS ENGINE TESTS
# ============================================================================

@pytest.mark.asyncio
async def test_student_job_preferences_and_smart_recommendations(client: AsyncClient, student_auth: dict):
    headers = student_auth["headers"]

    # 1. Update preferences for Engineering / Tech / PSU target
    put_resp = await client.put(
        "/api/student/job-preferences",
        headers=headers,
        json={
            "qualification": "B.E. / B.Tech",
            "degree_department": "Computer Science & Engineering",
            "graduation_year": 2026,
            "skills": "Python, SQL, Linux, Networking, Algorithms",
            "experience_level": "FRESHER",
            "preferred_roles": "Software Engineer, Graduate Trainee, Assistant Manager IT",
            "sector_preference": "ALL",
            "job_alerts_enabled": True
        }
    )
    assert put_resp.status_code == 200
    assert put_resp.json()["success"] is True

    # 2. Verify preferences fetched
    pref_resp = await client.get("/api/student/job-preferences", headers=headers)
    assert pref_resp.status_code == 200
    pref = pref_resp.json()
    assert pref["qualification"] == "B.E. / B.Tech"
    assert "Python" in pref["skills"]

    # 3. Get recommendations
    recs_resp = await client.get("/api/student/job-recommendations", headers=headers)
    assert recs_resp.status_code == 200
    recs_data = recs_resp.json()
    assert "recommendations" in recs_data
    recs = recs_data["recommendations"]
    assert len(recs) > 0
    top_rec = recs[0]
    assert "match_percentage" in top_rec
    assert "match_reasons" in top_rec
    assert top_rec["match_percentage"] >= 0


# ============================================================================
# 5. JOB ALERT SUBSCRIPTION TESTS
# ============================================================================

@pytest.mark.asyncio
async def test_job_alert_subscriptions_lifecycle(client: AsyncClient, student_auth: dict):
    headers = student_auth["headers"]

    # 1. Subscribe to custom alert
    sub_resp = await client.post(
        "/api/student/job-alerts/subscribe",
        headers=headers,
        json={
            "keyword": "Engineer",
            "sector": "PSU",
            "frequency": "INSTANT"
        }
    )
    assert sub_resp.status_code == 200 or sub_resp.status_code == 201
    sub_id = sub_resp.json()["subscription_id"]

    # 2. List subscriptions
    list_resp = await client.get("/api/student/job-alerts", headers=headers)
    assert list_resp.status_code == 200
    subs = list_resp.json()["subscriptions"]
    assert any(s["id"] == sub_id for s in subs)

    # 3. Unsubscribe
    del_resp = await client.delete(f"/api/student/job-alerts/subscriptions/{sub_id}", headers=headers)
    assert del_resp.status_code == 200

    # 4. Verify deleted
    list_after = await client.get("/api/student/job-alerts", headers=headers)
    assert not any(s["id"] == sub_id for s in list_after.json()["subscriptions"])
