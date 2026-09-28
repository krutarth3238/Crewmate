"""
The auth dependency injected into every protected router.

Deliberately does NOT auto-create a `users` row on every request — only
POST /api/auth/sync does that (blueprint §7/§13). Any other protected route hit by a
verified-but-never-synced Firebase user gets a clear 401 telling the frontend to sync
first, rather than silently fabricating a user record mid-request.
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.firebase_admin import verify_id_token
from app.database import get_db
from app.models.user import User

bearer_scheme = HTTPBearer(auto_error=True)
optional_bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_firebase_claims(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> dict:
    return verify_id_token(credentials.credentials)


async def get_optional_firebase_claims(
    credentials: HTTPAuthorizationCredentials | None = Depends(optional_bearer_scheme),
) -> dict | None:
    """
    Same verification as get_current_firebase_claims, but returns None instead of 401
    when no Authorization header is present at all. Used only by POST /api/agent/execute,
    which must serve both authenticated calls and the anonymous public landing-page demo
    from a single endpoint. Routed through a real dependency (rather than the router
    hand-parsing HTTPBearer itself) so it's overridable in tests the same way every other
    protected route is.
    """
    if credentials is None:
        return None
    return verify_id_token(credentials.credentials)


async def get_current_user(
    claims: dict = Depends(get_current_firebase_claims),
    db: AsyncSession = Depends(get_db),
) -> User:
    result = await db.execute(select(User).where(User.firebase_uid == claims["uid"]))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "error": {
                    "code": "UNAUTHENTICATED",
                    "message": "No local account for this session yet — call /api/auth/sync first.",
                }
            },
        )
    return user


def forbidden(message: str = "You do not have access to this resource.") -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail={"error": {"code": "FORBIDDEN", "message": message}},
    )


def not_found(message: str = "Resource not found.") -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail={"error": {"code": "NOT_FOUND", "message": message}},
    )
