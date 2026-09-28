"""
FastAPI app instance — router registration, CORS, and the two health-check routes.
"""
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.agent.router import router as agent_router
from app.auth.router import router as auth_router
from app.config import get_settings
from app.database import init_models
from app.missions.router import router as missions_router
from app.quests.router import router as quests_router
from app.skills.router import router as skills_router
from app.teammates.router import router as teammates_router
from app.workspaces.router import router as workspaces_router
from app.google_oauth.router import router as google_oauth_router

logging.basicConfig(level=logging.INFO)
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Auto-create tables on startup (dev convenience — real migrations go through Alembic)."""
    await init_models()
    yield


app = FastAPI(
    title="Crewmate API",
    description="Backend for Crewmate — the gamified AI co-founder console.",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    if isinstance(exc.detail, dict) and "error" in exc.detail:
        payload = exc.detail
    else:
        payload = {"error": {"code": "ERROR", "message": str(exc.detail)}}
    return JSONResponse(status_code=exc.status_code, content=payload)



@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}

@app.get("/_health")
async def health_underscore() -> dict:
    return {"status": "ok"}


app.include_router(auth_router)
app.include_router(workspaces_router)
app.include_router(teammates_router)
app.include_router(missions_router)
app.include_router(skills_router)
app.include_router(quests_router)
app.include_router(agent_router)
app.include_router(google_oauth_router)
