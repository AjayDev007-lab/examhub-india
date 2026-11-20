import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import settings
from app.database import engine, Base
from app.initial_data import seed_database
from app.routers import auth, exams, results, hall_tickets, id_cards, documents, notifications, admin, admin_institutions

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB & reference tables on startup
    await seed_database()
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
    allow_origins=["*"], # In production, restrict to frontend domain
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

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "platform": settings.APP_NAME,
        "environment": settings.APP_ENV,
        "database": "connected"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
