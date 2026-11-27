"""Durable SQLite snapshots stored in Cloud Firestore with a shared request lock.

This bridge keeps the existing relational API intact while moving persistence
to the Firebase project. It is intended for low-traffic serverless deployments:
each Vercel function instance restores the latest snapshot while holding a
Firestore lease, and all database requests are serialized across instances.
"""

from __future__ import annotations

import asyncio
import gzip
import hashlib
import os
import sqlite3
import tempfile
import time
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from sqlalchemy.engine import make_url

from app.config import settings

SNAPSHOT_COLLECTION = "examhub_sqlite_snapshot_state"
CHUNKS_COLLECTION = "examhub_sqlite_snapshot_chunks"
LOCK_COLLECTION = "examhub_sqlite_snapshot_state"
CHUNK_BYTES = 512 * 1024
LOCK_TTL_SECONDS = 360


class FirestoreSQLiteSnapshotStore:
    """Stores the SQLite file as compressed, versioned Firestore documents."""

    def __init__(self, database_url: str, project_id: str = "") -> None:
        parsed_url = make_url(database_url)
        if not parsed_url.drivername.startswith("sqlite"):
            raise ValueError("FIRESTORE_SQLITE_PERSISTENCE requires a SQLite DATABASE_URL")
        if not parsed_url.database or parsed_url.database == ":memory:":
            raise ValueError("Firestore-backed SQLite persistence requires a file-based database")

        database_path = Path(parsed_url.database)
        if not database_path.is_absolute():
            database_path = Path.cwd() / database_path
        self.database_path = database_path.resolve()
        self.project_id = (
            project_id
            or os.getenv("GOOGLE_CLOUD_PROJECT", "")
            or os.getenv("GCLOUD_PROJECT", "")
            or os.getenv("FIREBASE_PROJECT_ID", "")
        )

    def _client(self) -> Any:
        from firebase_admin import firestore
        from app.firebase_admin_client import get_firebase_admin_app

        app = get_firebase_admin_app()
        return firestore.client(app=app)

    def _make_local_snapshot(self) -> bytes:
        if not self.database_path.is_file():
            raise FileNotFoundError(f"SQLite database is missing: {self.database_path}")

        self.database_path.parent.mkdir(parents=True, exist_ok=True)
        fd, temporary_path = tempfile.mkstemp(prefix="examhub-snapshot-", suffix=".sqlite")
        os.close(fd)
        try:
            with sqlite3.connect(str(self.database_path), timeout=30) as source:
                with sqlite3.connect(temporary_path, timeout=30) as target:
                    source.backup(target)
            return Path(temporary_path).read_bytes()
        finally:
            try:
                os.unlink(temporary_path)
            except FileNotFoundError:
                pass

    def _restore_sync(self) -> bool:
        client = self._client()
        state_ref = client.collection(SNAPSHOT_COLLECTION).document("current")
        state_snapshot = state_ref.get()
        if not state_snapshot.exists:
            orphan = list(client.collection(CHUNKS_COLLECTION).limit(1).stream())
            if orphan:
                raise RuntimeError("Firestore has snapshot chunks but no current snapshot pointer")
            return False

        state = state_snapshot.to_dict() or {}
        slot = state.get("slot")
        chunk_count = state.get("chunkCount")
        expected_hash = state.get("sha256")
        if slot not in {"A", "B"} or not isinstance(chunk_count, int) or chunk_count < 1:
            raise RuntimeError("Firestore snapshot metadata is invalid")

        snapshots = (
            client.collection(CHUNKS_COLLECTION)
            .where("slot", "==", slot)
            .stream()
        )
        chunks = [snapshot.to_dict() or {} for snapshot in snapshots]
        if len(chunks) != chunk_count:
            raise RuntimeError("Firestore snapshot is incomplete; refusing to start with stale data")
        chunks.sort(key=lambda chunk: chunk.get("index", -1))

        compressed = bytearray()
        for expected_index, chunk in enumerate(chunks):
            if chunk.get("index") != expected_index or not isinstance(chunk.get("payload"), bytes):
                raise RuntimeError("Firestore snapshot chunk sequence is invalid")
            compressed.extend(chunk["payload"])

        database_bytes = gzip.decompress(compressed)
        actual_hash = hashlib.sha256(database_bytes).hexdigest()
        if actual_hash != expected_hash:
            raise RuntimeError("Firestore snapshot checksum mismatch")

        self.database_path.parent.mkdir(parents=True, exist_ok=True)
        temporary_path = self.database_path.with_name(f"{self.database_path.name}.restore")
        temporary_path.write_bytes(database_bytes)
        os.replace(temporary_path, self.database_path)
        return True

    def _check_sync(self) -> None:
        self._client().collection(SNAPSHOT_COLLECTION).document("current").get()

    def _snapshot_exists_sync(self) -> bool:
        return self._client().collection(SNAPSHOT_COLLECTION).document("current").get().exists

    def _try_acquire_lock_sync(self, owner: str) -> bool:
        from firebase_admin import firestore

        client = self._client()
        lock_ref = client.collection(LOCK_COLLECTION).document("request_lock")
        transaction = client.transaction()

        @firestore.transactional
        def acquire(txn: Any) -> bool:
            snapshot = lock_ref.get(transaction=txn)
            now = time.time()
            current = snapshot.to_dict() or {}
            if current.get("owner") and float(current.get("expiresAt", 0)) > now and current.get("owner") != owner:
                return False
            txn.set(lock_ref, {"owner": owner, "expiresAt": now + LOCK_TTL_SECONDS})
            return True

        return acquire(transaction)

    async def acquire_request_lock(self, timeout_seconds: float = 45) -> str:
        owner = str(uuid.uuid4())
        deadline = time.monotonic() + timeout_seconds
        while time.monotonic() < deadline:
            if await asyncio.to_thread(self._try_acquire_lock_sync, owner):
                return owner
            await asyncio.sleep(0.2)
        raise TimeoutError("Persistent database is busy; retry the request shortly.")

    def _release_lock_sync(self, owner: str) -> None:
        from firebase_admin import firestore

        client = self._client()
        lock_ref = client.collection(LOCK_COLLECTION).document("request_lock")
        transaction = client.transaction()

        @firestore.transactional
        def release(txn: Any) -> None:
            snapshot = lock_ref.get(transaction=txn)
            if snapshot.exists and (snapshot.to_dict() or {}).get("owner") == owner:
                txn.delete(lock_ref)

        release(transaction)

    async def release_request_lock(self, owner: str) -> None:
        await asyncio.to_thread(self._release_lock_sync, owner)

    def _delete_slot(self, client: Any, slot: str) -> None:
        documents = list(client.collection(CHUNKS_COLLECTION).where("slot", "==", slot).stream())
        for start in range(0, len(documents), 400):
            batch = client.batch()
            for document in documents[start : start + 400]:
                batch.delete(document.reference)
            batch.commit()

    def _publish_sync(self) -> None:
        database_bytes = self._make_local_snapshot()
        compressed = gzip.compress(database_bytes, compresslevel=6, mtime=0)
        checksum = hashlib.sha256(database_bytes).hexdigest()
        chunks = [compressed[i : i + CHUNK_BYTES] for i in range(0, len(compressed), CHUNK_BYTES)] or [b""]

        client = self._client()
        collection = client.collection(SNAPSHOT_COLLECTION)
        state_ref = collection.document("current")
        current_snapshot = state_ref.get()
        current_state = current_snapshot.to_dict() or {}
        active_slot = current_state.get("slot")
        next_slot = "B" if active_slot == "A" else "A"

        # Clear only the inactive slot. The currently pointed-to snapshot stays
        # available until every new chunk has been written and verified.
        self._delete_slot(client, next_slot)
        for start in range(0, len(chunks), 400):
            batch = client.batch()
            for index, payload in enumerate(chunks[start : start + 400], start=start):
                ref = client.collection(CHUNKS_COLLECTION).document(f"{next_slot}-{index:08d}")
                batch.set(ref, {"slot": next_slot, "index": index, "payload": payload})
            batch.commit()

        # The single pointer update makes the new snapshot active atomically.
        state_ref.set(
            {
                "slot": next_slot,
                "chunkCount": len(chunks),
                "databaseBytes": len(database_bytes),
                "compressedBytes": len(compressed),
                "sha256": checksum,
                "updatedAt": datetime.now(timezone.utc).isoformat(),
            }
        )

    async def restore(self) -> bool:
        return await asyncio.to_thread(self._restore_sync)

    async def check(self) -> None:
        await asyncio.to_thread(self._check_sync)

    async def snapshot_exists(self) -> bool:
        return await asyncio.to_thread(self._snapshot_exists_sync)

    async def publish(self) -> None:
        await asyncio.to_thread(self._publish_sync)


def firestore_sqlite_enabled() -> bool:
    return settings.FIRESTORE_SQLITE_PERSISTENCE
