import os
from fastapi import APIRouter, Depends, Request
from fastapi.responses import RedirectResponse
from google_auth_oauthlib.flow import Flow
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.database import get_db
from app.middleware.auth_guard import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/auth/google", tags=["Google OAuth"])
settings = get_settings()

GOOGLE_SCOPES = [
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/calendar.events",
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/documents",
    "https://www.googleapis.com/auth/presentations",
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/forms.body",
    "https://www.googleapis.com/auth/tasks",
]

# Relax OAuth requirements for local development
os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"


@router.get("/connect")
async def connect_google(user: User = Depends(get_current_user)):
    """
    Initiates the Google OAuth consent flow to get a refresh token.
    Uses the user's ID as the state parameter to tie the callback back to them.
    """
    flow = Flow.from_client_secrets_file(
        "credentials.json",
        scopes=GOOGLE_SCOPES,
        redirect_uri=settings.GOOGLE_REDIRECT_URI,
    )
    # google-auth-oauthlib forces PKCE by default, which requires us to preserve the
    # code_verifier across requests. Since our backend is stateless, we generate the 
    # verifier first, then encode it directly into the state parameter alongside the user ID.
    flow.authorization_url()
    
    custom_state = f"{user.id}:{flow.code_verifier}"

    auth_url, _ = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
        prompt="consent",
        state=custom_state,
    )
    return {"auth_url": auth_url}


@router.get("/callback")
async def google_callback(
    request: Request,
    state: str,
    error: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    import os
    os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"
    os.environ["OAUTHLIB_RELAX_TOKEN_SCOPE"] = "1"
    """
    Receives the authorization code and state from Google, exchanges it for tokens,
    and saves them to the corresponding User.
    """
    if error:
        # If the user cancelled or another error occurred, just redirect back
        # The frontend will detect that google_connected is false and show the connect view.
        return RedirectResponse(url=settings.FRONTEND_ORIGIN)

    try:
        user_id_str, code_verifier = state.split(":", 1)
        user_id = int(user_id_str)
    except ValueError:
        return RedirectResponse(url=settings.FRONTEND_ORIGIN)

    flow = Flow.from_client_secrets_file(
        "credentials.json",
        scopes=GOOGLE_SCOPES,
        redirect_uri=settings.GOOGLE_REDIRECT_URI,
    )
    flow.code_verifier = code_verifier

    # Reconstruct the full URL to pass into fetch_token
    auth_response = str(request.url)
    flow.fetch_token(authorization_response=auth_response)

    credentials = flow.credentials

    # Update the user record
    user = await db.get(User, user_id)
    if user:
        user.google_refresh_token = credentials.refresh_token
        user.google_access_token = credentials.token
        user.google_token_expiry = credentials.expiry
        user.google_connected = True
        await db.commit()

    # Redirect back to the frontend main app
    return RedirectResponse(url=settings.FRONTEND_ORIGIN)
