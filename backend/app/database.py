import os
import asyncio
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from app.config import settings
from app.firestore_sqlite import FirestoreSQLiteSnapshotStore

# Ensure storage directories exist
os.makedirs(os.path.join(settings.STORAGE_DIR, "documents"), exist_ok=True)
os.makedirs(os.path.join(settings.STORAGE_DIR, "previews"), exist_ok=True)
os.makedirs(os.path.join(settings.STORAGE_DIR, "uploads"), exist_ok=True)

# Database Engine Setup
engine_kwargs = {"echo": False}
if "sqlite" in settings.DATABASE_URL:
    engine_kwargs["connect_args"] = {"check_same_thread": False}
else:
    engine_kwargs["pool_pre_ping"] = True
    engine_kwargs["pool_size"] = 10
    engine_kwargs["max_overflow"] = 20

engine = create_async_engine(settings.DATABASE_URL, **engine_kwargs)

snapshot_store = (
    FirestoreSQLiteSnapshotStore(settings.DATABASE_URL, settings.FIREBASE_PROJECT_ID)
    if settings.FIRESTORE_SQLITE_PERSISTENCE
    else None
)
_snapshot_lock = asyncio.Lock()
_snapshot_writes_enabled = snapshot_store is None
_snapshot_error: Exception | None = None


class FirestoreSnapshotSession(AsyncSession):
    """Publishes committed SQLite changes before returning from write requests."""

    async def commit(self) -> None:
        global _snapshot_error
        if snapshot_store is None:
            await super().commit()
            return

        async with _snapshot_lock:
            await super().commit()
            if _snapshot_writes_enabled:
                try:
                    await snapshot_store.publish()
                    _snapshot_error = None
                except Exception as exc:
                    _snapshot_error = exc
                    raise RuntimeError("Database commit succeeded locally but Firestore persistence failed") from exc


async def restore_firestore_snapshot() -> bool:
    if snapshot_store is None:
        return False
    return await snapshot_store.restore()


def set_snapshot_writes_enabled(enabled: bool) -> None:
    global _snapshot_writes_enabled
    _snapshot_writes_enabled = enabled or snapshot_store is None


async def publish_firestore_snapshot() -> None:
    global _snapshot_error
    if snapshot_store is None:
        return
    async with _snapshot_lock:
        await snapshot_store.publish()
        _snapshot_error = None


async def check_firestore_snapshot() -> None:
    global _snapshot_error
    if snapshot_store is None:
        return
    try:
        await snapshot_store.check()
        _snapshot_error = None
    except Exception as exc:
        _snapshot_error = exc
        raise HTTPException(status_code=503, detail="Firestore persistence is unavailable") from exc


async def _ensure_snapshot_durable() -> None:
    global _snapshot_error
    if snapshot_store is None or _snapshot_error is None:
        return
    try:
        await publish_firestore_snapshot()
    except Exception as exc:
        _snapshot_error = exc
        raise HTTPException(
            status_code=503,
            detail="Persistent database is temporarily unavailable; please retry shortly.",
        ) from exc


def firestore_snapshot_status() -> dict[str, str | bool | None]:
    return {
        "enabled": snapshot_store is not None,
        "healthy": snapshot_store is None or _snapshot_error is None,
        "error": str(_snapshot_error)[:300] if _snapshot_error else None,
    }


AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=FirestoreSnapshotSession if snapshot_store else AsyncSession,
    expire_on_commit=False,
    autoflush=False
)

Base = declarative_base()

async def get_db():
    """Dependency that provides an asynchronous database session."""
    lock_owner = None
    try:
        if snapshot_store:
            lock_owner = await snapshot_store.acquire_request_lock()
            await engine.dispose()
            await snapshot_store.restore()
        else:
            await _ensure_snapshot_durable()

        async with AsyncSessionLocal() as session:
            try:
                yield session
            finally:
                await session.close()
    except TimeoutError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    finally:
        if snapshot_store and lock_owner:
            await snapshot_store.release_request_lock(lock_owner)
