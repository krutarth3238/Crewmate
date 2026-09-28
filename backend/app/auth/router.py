"""
POST /api/auth/sync  — verifies the Firebase ID token and upserts the local `users` row.
GET  /api/users/me   — current user + their workspaces.

Login/registration/logout/refresh themselves are NOT backend endpoints — the Firebase
client SDK handles all of that directly from the frontend (blueprint §7/§9).
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.schemas import SyncUserRequest, UserResponse, UserWithWorkspaces, WorkspaceSummary
from app.database import get_db
from app.middleware.auth_guard import get_current_firebase_claims, get_current_user
from app.models.user import User
from app.models.workspace import Workspace

router = APIRouter(tags=["auth"])


@router.post("/api/auth/sync", response_model=UserResponse)
async def sync_user(
    body: SyncUserRequest,
    claims: dict = Depends(get_current_firebase_claims),
    db: AsyncSession = Depends(get_db),
) -> User:
    result = await db.execute(select(User).where(User.firebase_uid == claims["uid"]))
    user = result.scalar_one_or_none()

    if user is not None:
        return user  # repeat login — just fetch, don't overwrite founder_name

    email = claims.get("email")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"error": {"code": "INVALID_INPUT", "message": "Firebase account has no email on record.", "field": "email"}},
        )
    if not body.founder_name:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"error": {"code": "INVALID_INPUT", "message": "founder_name is required on first sync.", "field": "founder_name"}},
        )

    user = User(firebase_uid=claims["uid"], email=email, founder_name=body.founder_name)
    db.add(user)
    try:
        await db.commit()
    except Exception as exc:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"error": {"code": "ALREADY_EXISTS", "message": "An account already exists for this email."}},
        ) from exc
    await db.refresh(user)
    return user


@router.get("/api/users/me", response_model=UserWithWorkspaces)
async def get_me(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> UserWithWorkspaces:
    result = await db.execute(select(Workspace).where(Workspace.owner_user_id == user.id))
    workspaces = result.scalars().all()
    return UserWithWorkspaces(
        user=UserResponse.model_validate(user),
        workspaces=[WorkspaceSummary.model_validate(w) for w in workspaces],
    )
