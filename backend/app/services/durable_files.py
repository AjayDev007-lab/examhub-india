"""Local file helpers for development; serverless file persistence is disabled."""

from __future__ import annotations

import asyncio
import os
from pathlib import Path

from fastapi import HTTPException

from app.config import settings


def durable_reference(pathname: str, legacy_path: str) -> str:
    """Return the local reference used by development-only file routes."""
    return legacy_path


async def persist_local_file(local_path: str, pathname: str, content_type: str) -> str:
    """Return a local path in development and reject ephemeral production storage."""
    if os.getenv("VERCEL") or settings.FIRESTORE_SQLITE_PERSISTENCE:
        raise HTTPException(
            status_code=503,
            detail="File storage is not enabled for this deployment.",
        )
    return str(Path(local_path).relative_to(Path(settings.STORAGE_DIR)))


async def read_stored_file(reference: str, *, legacy_path: str | None = None) -> bytes:
    """Read a local development file reference."""
    local_path = Path(settings.STORAGE_DIR) / (legacy_path or reference)
    if not local_path.is_file():
        raise FileNotFoundError(reference)
    return await asyncio.to_thread(local_path.read_bytes)
