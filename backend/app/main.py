
from datetime import datetime, timezone
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.auth.routes.auth_routes import router as auth_router
from backend.app.auth.routes.user_routes import router as user_router

# ARGUS-X application
app = FastAPI(
    title="ARGUS-X API",
    description="AI-Powered Identity Continuity and Recovery Platform",
    version="1.0.0"
)

# Connect authentication routes
app.include_router(auth_router)
app.include_router(user_router)

# Desktop and mobile frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root endpoint
@app.get("/")
def home():
    return {
        "project": "ARGUS-X",
        "message": "Identity Continuity Platform API",
        "status": "running"
    }

# Health check
@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "ARGUS-X Backend",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

# System information
@app.get("/api/system/status")
def system_status():
    return {
        "platform": "ARGUS-X",
        "backend": "online",
        "database": "not_configured",
        "ai_engine": "not_connected",
        "monitoring": "not_started",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
