"""Server-side Firebase Authentication identity verification and account linking."""

from __future__ import annotations

import asyncio
from typing import Any

IDENTITY_COLLECTION = "examhub_auth_identities"


def _firebase_app() -> Any:
    from app.firebase_admin_client import get_firebase_admin_app

    return get_firebase_admin_app()


def _firestore_client() -> Any:
    from firebase_admin import firestore

    return firestore.client(app=_firebase_app())


def _verify_token_sync(id_token: str) -> dict[str, Any]:
    from firebase_admin import auth

    return auth.verify_id_token(id_token, check_revoked=True, app=_firebase_app())


async def verify_firebase_id_token(id_token: str) -> dict[str, Any]:
    return await asyncio.to_thread(_verify_token_sync, id_token)


def _read_identity_sync(uid: str) -> dict[str, Any] | None:
    snapshot = _firestore_client().collection(IDENTITY_COLLECTION).document(uid).get()
    return snapshot.to_dict() if snapshot.exists else None


async def read_firebase_identity(uid: str) -> dict[str, Any] | None:
    return await asyncio.to_thread(_read_identity_sync, uid)


def _has_linked_identity_sync(email: str, account_type: str) -> bool:
    matches = (
        _firestore_client()
        .collection(IDENTITY_COLLECTION)
        .where("email", "==", email)
        .stream()
    )
    return any((document.to_dict() or {}).get("accountType") == account_type for document in matches)


async def has_linked_firebase_identity(email: str, account_type: str) -> bool:
    return await asyncio.to_thread(_has_linked_identity_sync, email, account_type)


def _write_identity_sync(uid: str, email: str, account_type: str, account_id: int) -> None:
    ref = _firestore_client().collection(IDENTITY_COLLECTION).document(uid)
    existing = ref.get()
    identity = {
        "uid": uid,
        "email": email,
        "accountType": account_type,
        "accountId": account_id,
    }
    if existing.exists:
        current = existing.to_dict() or {}
        if any(current.get(field) != identity[field] for field in ("email", "accountType", "accountId")):
            raise ValueError("Firebase identity is already linked to a different ExamHub account")
        return
    ref.set(identity)


async def write_firebase_identity(uid: str, email: str, account_type: str, account_id: int) -> None:
    await asyncio.to_thread(_write_identity_sync, uid, email, account_type, account_id)
