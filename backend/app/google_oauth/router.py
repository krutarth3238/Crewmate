import os
import hmac
import hashlib
from fastapi import APIRouter, Depends, Request
from fastapi.responses import RedirectResponse
from google_auth_oauthlib.flow import Flow
from sqlalchemy.ext.asyncio import AsyncSession
from cryptography.fernet import Fernet
import base64

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
if settings.ENV == "development":
    os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"
    os.environ["OAUTHLIB_RELAX_TOKEN_SCOPE"] = "1"

def _get_fernet():
    key = settings.TOKEN_ENCRYPTION_KEY.encode('utf-8')
    key = base64.urlsafe_b64encode(key.ljust(32)[:32])
    return Fernet(key)

def sign_state(user_id: int, verifier: str, secret: str) -> str:
    msg = f"{user_id}:{verifier}".encode()
    sig = hmac.new(secret.encode(), msg, hashlib.sha256).hexdigest()
    return f"{user_id}:{verifier}:{sig}"

def verify_state(state: str, secret: str) -> tuple[int, str]:
    parts = state.split(":")
    if len(parts) != 3:
        raise ValueError("Invalid state")
    user_id_str, verifier, sig = parts
    msg = f"{user_id_str}:{verifier}".encode()
    expected_sig = hmac.new(secret.encode(), msg, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(sig, expected_sig):
        raise ValueError("Signature mismatch")
    return int(user_id_str), verifier


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
    
    custom_state = sign_state(user.id, flow.code_verifier, settings.OAUTH_STATE_SECRET)

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
    if settings.ENV == "development":
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
        user_id, code_verifier = verify_state(state, settings.OAUTH_STATE_SECRET)
    except ValueError:
        return RedirectResponse(url=settings.FRONTEND_ORIGIN)

    flow = Flow.from_client_secrets_file(
        "credentials.json",
        scopes=GOOGLE_SCOPES,
        redirect_uri=settings.GOOGLE_REDIRECT_URI,
    )
    if code_verifier and code_verifier != "None":
        flow.code_verifier = code_verifier

    # Reconstruct the full URL to pass into fetch_token
    auth_response = str(request.url)
    flow.fetch_token(authorization_response=auth_response)

    credentials = flow.credentials

    # Update the user record
    user = await db.get(User, user_id)
    if user:
        fernet = _get_fernet()
        if credentials.refresh_token:
            user.google_refresh_token = fernet.encrypt(credentials.refresh_token.encode()).decode()
        if credentials.token:
            user.google_access_token = fernet.encrypt(credentials.token.encode()).decode()
        user.google_token_expiry = credentials.expiry
        user.google_connected = True
        await db.commit()

    # Redirect back to the frontend main app
    return RedirectResponse(url=settings.FRONTEND_ORIGIN)
