import pytest
import uuid
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.config import settings

@pytest.fixture(scope="session")
def anyio_backend():
    return "asyncio"

@pytest.mark.asyncio
async def test_complete_registration_flow():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        unique_email = f"student_{uuid.uuid4().hex[:8]}@examhub.in"
        unique_mobile = f"98{uuid.uuid4().int % 100000000:08d}"

        # 1. Password mismatch
        bad_resp = await client.post("/api/auth/register", json={
            "full_name": "Test Student",
            "email": unique_email,
            "mobile": unique_mobile,
            "password": "Password123!",
            "password_confirm": "DifferentPassword123!"
        })
        assert bad_resp.status_code == 400
        assert "Passwords do not match" in bad_resp.json()["detail"]

        # 2. Valid Registration
        reg_resp = await client.post("/api/auth/register", json={
            "full_name": "Test Student",
            "email": unique_email,
            "mobile": unique_mobile,
            "password": "Password123!",
            "password_confirm": "Password123!"
        })
        assert reg_resp.status_code == 201
        data = reg_resp.json()
        assert "access_token" in data
        assert data["user"]["email"] == unique_email
        assert data["user"]["mobile"] == unique_mobile
        assert data["user"]["is_verified"] is False # Not marked verified automatically

        # 3. Duplicate email prevention
        dup_resp = await client.post("/api/auth/register", json={
            "full_name": "Another Student",
            "email": unique_email,
            "mobile": f"97{uuid.uuid4().int % 100000000:08d}",
            "password": "Password123!",
            "password_confirm": "Password123!"
        })
        assert dup_resp.status_code == 409
        assert "email already exists" in dup_resp.json()["detail"]

@pytest.mark.asyncio
async def test_complete_login_and_session_flow():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1. Invalid password
        bad_login = await client.post("/api/auth/login", json={
            "email": "student@examhub.in",
            "password": "WrongPassword!"
        })
        assert bad_login.status_code == 401
        assert "Invalid email or password" in bad_login.json()["detail"]

        # 2. Valid login
        login_resp = await client.post("/api/auth/login", json={
            "email": "student@examhub.in",
            "password": "Student@ExamHub2026!"
        })
        assert login_resp.status_code == 200
        token = login_resp.json()["access_token"]
        assert token is not None

        # 3. Access authenticated /me endpoint
        me_resp = await client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert me_resp.status_code == 200
        assert me_resp.json()["email"] == "student@examhub.in"

        # 4. Logout and revoke session
        logout_resp = await client.post("/api/auth/logout", headers={"Authorization": f"Bearer {token}"})
        assert logout_resp.status_code == 200
        assert logout_resp.json()["success"] is True

@pytest.mark.asyncio
async def test_otp_authentication_flow():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        mobile = "9876543210"

        # 1. Send OTP
        send_resp = await client.post("/api/auth/send-otp", json={"mobile": mobile})
        assert send_resp.status_code == 200
        otp = send_resp.json()["debug_demo_otp"]
        assert len(otp) == 6

        # 2. Verify with wrong OTP
        wrong_resp = await client.post("/api/auth/verify-otp", json={"mobile": mobile, "otp": "000000"})
        assert wrong_resp.status_code == 400
        assert "Invalid or expired OTP" in wrong_resp.json()["detail"]

        # 3. Verify with correct OTP
        ok_resp = await client.post("/api/auth/verify-otp", json={"mobile": mobile, "otp": otp})
        assert ok_resp.status_code == 200
        token_data = ok_resp.json()
        assert "access_token" in token_data
        assert token_data["user"]["mobile"] == mobile

@pytest.mark.asyncio
async def test_forgot_and_reset_password_flow():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1. Non-enumerating request for unknown email
        unknown_resp = await client.post("/api/auth/forgot-password", json={"identifier": "unknown@notfound.in"})
        assert unknown_resp.status_code == 200
        assert unknown_resp.json()["debug_reset_token"] is None
        assert "recovery instructions have been dispatched" in unknown_resp.json()["message"]

        # 2. Request for existing user
        req_resp = await client.post("/api/auth/forgot-password", json={"identifier": "student@examhub.in"})
        assert req_resp.status_code == 200
        reset_token = req_resp.json()["debug_reset_token"]
        assert reset_token is not None

        # 3. Attempt reset with invalid token
        invalid_resp = await client.post("/api/auth/reset-password", json={
            "token": "fake_token_12345",
            "new_password": "NewStudentPass@2026!",
            "confirm_password": "NewStudentPass@2026!"
        })
        assert invalid_resp.status_code == 400
        assert "Invalid or expired" in invalid_resp.json()["detail"]

        # 4. Attempt reset with valid token and password mismatch
        mismatch_resp = await client.post("/api/auth/reset-password", json={
            "token": reset_token,
            "new_password": "NewStudentPass@2026!",
            "confirm_password": "MismatchedPassword!"
        })
        assert mismatch_resp.status_code == 400
        assert "Passwords do not match" in mismatch_resp.json()["detail"]

        # 5. Successful password reset
        ok_reset = await client.post("/api/auth/reset-password", json={
            "token": reset_token,
            "new_password": "NewStudentPass@2026!",
            "confirm_password": "NewStudentPass@2026!"
        })
        assert ok_reset.status_code == 200
        assert "Password successfully reset" in ok_reset.json()["message"]

        # 6. Reused token rejected
        reuse_resp = await client.post("/api/auth/reset-password", json={
            "token": reset_token,
            "new_password": "AnotherPassword@2026!",
            "confirm_password": "AnotherPassword@2026!"
        })
        assert reuse_resp.status_code == 400

        # 7. Login with newly set password
        new_login = await client.post("/api/auth/login", json={
            "email": "student@examhub.in",
            "password": "NewStudentPass@2026!"
        })
        assert new_login.status_code == 200

        # Reset back to original password for test consistency
        req_resp2 = await client.post("/api/auth/forgot-password", json={"identifier": "student@examhub.in"})
        token2 = req_resp2.json()["debug_reset_token"]
        await client.post("/api/auth/reset-password", json={
            "token": token2,
            "new_password": "Student@ExamHub2026!",
            "confirm_password": "Student@ExamHub2026!"
        })

@pytest.mark.asyncio
async def test_role_separation_and_unauthorized_access():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Student login
        student_res = await client.post("/api/auth/login", json={
            "email": "student@examhub.in",
            "password": "Student@ExamHub2026!"
        })
        student_token = student_res.json()["access_token"]

        # Student attempting to access admin endpoints must be rejected with 401/403
        admin_access = await client.get("/api/admin/dashboard", headers={"Authorization": f"Bearer {student_token}"})
        assert admin_access.status_code in (401, 403)

        admin_inst_access = await client.get("/api/admin/institutions", headers={"Authorization": f"Bearer {student_token}"})
        assert admin_inst_access.status_code in (401, 403)
