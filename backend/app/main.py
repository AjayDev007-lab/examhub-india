import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, Response, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import settings
from app.database import (
    engine,
    Base,
    snapshot_store,
    restore_firestore_snapshot,
    set_snapshot_writes_enabled,
    publish_firestore_snapshot,
    check_firestore_snapshot,
    firestore_snapshot_status,
    get_db,
)
from sqlalchemy import text
from app.initial_data import seed_database
from app.routers import (
    auth, exams, results, hall_tickets, id_cards, documents, notifications,
    admin, admin_institutions, directory, jobs, student_exams, job_alerts, analytics,
    daily_updates, maintenance, website_control, ai_manager, student_school_profile,
    student_applications, scholarships, countdowns, it_jobs, rrb_results, universities,
    school_content, faculty, security_admin
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    lock_owner = await snapshot_store.acquire_request_lock() if snapshot_store else None
    try:
        if snapshot_store:
            await restore_firestore_snapshot()
            set_snapshot_writes_enabled(False)
        try:
            await seed_database()
        finally:
            if snapshot_store:
                set_snapshot_writes_enabled(True)
        if snapshot_store:
            await publish_firestore_snapshot()
    finally:
        if snapshot_store and lock_owner:
            await snapshot_store.release_request_lock(lock_owner)
    yield
    await engine.dispose()

app = FastAPI(
    title=settings.APP_NAME,
    description="Centralized All-India Examination Results, Hall Tickets and Student ID Cards Portal",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.FRONTEND_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security Headers Middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response: Response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    if settings.APP_ENV.lower() == "production":
        response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains; preload"
    return response

# Include Routers
app.include_router(auth.router)
app.include_router(exams.router)
app.include_router(results.router)
app.include_router(hall_tickets.router)
app.include_router(id_cards.router)
app.include_router(documents.router)
app.include_router(notifications.router)
app.include_router(admin.router)
app.include_router(admin_institutions.router)
app.include_router(admin_institutions.public_router)
app.include_router(directory.router)
app.include_router(directory.admin_router)
app.include_router(jobs.router)
app.include_router(student_exams.router)
app.include_router(job_alerts.router)
app.include_router(student_school_profile.router)
app.include_router(student_applications.router)
app.include_router(scholarships.router)
app.include_router(countdowns.public_router)
app.include_router(countdowns.admin_router)
app.include_router(it_jobs.router)
app.include_router(rrb_results.router)
app.include_router(universities.universities_router)
app.include_router(universities.papers_router)
app.include_router(school_content.router)
app.include_router(faculty.router)
app.include_router(security_admin.router)
app.include_router(analytics.router)
app.include_router(daily_updates.router)
app.include_router(maintenance.router)
app.include_router(website_control.router)
app.include_router(ai_manager.router)
app.include_router(ai_manager.settings_router)

@app.get("/api/health")
async def health_check(db=Depends(get_db)):
    try:
        await db.execute(text("SELECT 1"))
        await check_firestore_snapshot()
        persistence = firestore_snapshot_status()
        if not persistence["healthy"]:
            raise RuntimeError(str(persistence["error"] or "Firestore persistence is unavailable"))
    except Exception as exc:
        raise HTTPException(status_code=503, detail="Database persistence check failed") from exc

    return {
        "status": "healthy",
        "platform": settings.APP_NAME,
        "environment": settings.APP_ENV,
        "database": "connected",
        "persistent_storage": "firestore-sqlite-snapshot" if snapshot_store else "configured-database",
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
