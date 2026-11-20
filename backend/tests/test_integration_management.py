import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.services.crypto_service import encrypt_secret, decrypt_secret, mask_secret
from app.services.connectivity_service import validate_target_url
from app.config import settings

@pytest.fixture(scope="session")
def anyio_backend():
    return "asyncio"

def test_crypto_service():
    secret = "secret_api_key_for_govt_portal_2026_xyz"
    encrypted = encrypt_secret(secret)
    assert encrypted != secret
    assert len(encrypted) > 20

    decrypted = decrypt_secret(encrypted)
    assert decrypted == secret

    masked = mask_secret(secret)
    assert masked.startswith("secr")
    assert masked.endswith("_xyz")
    assert "••••••••" in masked
    assert secret not in masked

def test_url_validation_and_ssrf():
    # Valid URLs
    ok, _ = validate_target_url("https://upsc.gov.in")
    assert ok is True
    ok, _ = validate_target_url("http://nta.ac.in/api/v1")
    assert ok is True

    # Invalid schemes
    bad_scheme, msg = validate_target_url("file:///etc/passwd")
    assert bad_scheme is False

    bad_scheme2, _ = validate_target_url("gopher://evil.com")
    assert bad_scheme2 is False

    # Prohibited SSRF metadata endpoint
    bad_meta, msg = validate_target_url("http://169.254.169.254/latest/meta-data")
    assert bad_meta is False
    assert "SSRF" in msg or "prohibited" in msg

@pytest.mark.asyncio
async def test_admin_institution_integration_crud_and_approval():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1. Admin login
        login_res = await client.post("/api/admin/login", json={
            "email": settings.SUPERADMIN_EMAIL,
            "password": settings.SUPERADMIN_PASSWORD
        })
        assert login_res.status_code == 200
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        import uuid
        test_code = f"KEA-{uuid.uuid4().hex[:6].upper()}"

        # 2. Register new institution with API integration & encrypted secret
        payload = {
            "name": "Karnataka Examination Authority",
            "code": test_code,
            "category_id": 2, # State Govt
            "state_id": None,
            "official_website": "https://cetonline.karnataka.gov.in",
            "result_portal_url": "https://cetonline.karnataka.gov.in/results",
            "hall_ticket_portal_url": "https://cetonline.karnataka.gov.in/admit",
            "id_card_portal_url": None,
            "supports_results": True,
            "supports_hall_tickets": True,
            "supports_id_cards": False,
            "results_retrieval_mode": "OFFICIAL_API",
            "hall_tickets_retrieval_mode": "OFFICIAL_REDIRECT",
            "id_cards_retrieval_mode": "MANUAL_UPLOAD",
            "approval_status": "PENDING_APPROVAL",
            "api_endpoint_url": "https://cetonline.karnataka.gov.in/api/v1/auth",
            "auth_method": "API_KEY",
            "api_credentials": "kea_production_token_supersecret_8819"
        }
        create_res = await client.post("/api/admin/institutions", json=payload, headers=headers)
        assert create_res.status_code == 201
        created = create_res.json()
        org_id = created["id"]
        assert created["code"] == test_code
        assert created["approval_status"] == "PENDING_APPROVAL"
        assert created["has_api_credentials"] is True
        assert created["masked_credentials"] is not None
        assert "supersecret" not in created["masked_credentials"] # Plaintext never exposed!

        # 3. List institutions
        list_res = await client.get("/api/admin/institutions?query=Karnataka", headers=headers)
        assert list_res.status_code == 200
        items = list_res.json()
        assert any(i["id"] == org_id for i in items)

        # 4. Approve institution
        app_res = await client.put(f"/api/admin/institutions/{org_id}/approval", json={
            "approval_status": "APPROVED",
            "reason": "Official board credentials verified and MOU validated"
        }, headers=headers)
        assert app_res.status_code == 200
        assert app_res.json()["approval_status"] == "APPROVED"

        # 5. Test connectivity probe
        conn_res = await client.post(f"/api/admin/institutions/{org_id}/test-connection", json={
            "target_url": "https://httpbin.org/status/200"
        }, headers=headers)
        assert conn_res.status_code == 200
        conn_data = conn_res.json()
        assert "latency_ms" in conn_data
        assert "health_status" in conn_data

        # 6. Check logs history
        logs_res = await client.get(f"/api/admin/institutions/{org_id}/logs", headers=headers)
        assert logs_res.status_code == 200
        logs = logs_res.json()
        assert len(logs) >= 1
        assert logs[0]["action"] == "CONNECTIVITY_TEST"

        # 7. Public student transparency endpoint
        pub_res = await client.get(f"/api/institutions/{org_id}/integration-status")
        assert pub_res.status_code == 200
        pub_data = pub_res.json()
        assert pub_data["name"] == "Karnataka Examination Authority"
        assert pub_data["results_retrieval_mode"] == "OFFICIAL_API"
        assert pub_data["hall_tickets_retrieval_mode"] == "OFFICIAL_REDIRECT"
        assert pub_data["supports_id_cards"] is False

        # 8. Soft delete institution
        del_res = await client.delete(f"/api/admin/institutions/{org_id}", headers=headers)
        assert del_res.status_code == 200
        assert "successfully deleted" in del_res.json()["message"]
