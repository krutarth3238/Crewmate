"""
Firebase Admin SDK init + ID token verification.

Blueprint §9 callout: this is the backend half of a two-sided setup. The frontend must
install the `firebase` client SDK and sign users in there; this module only ever
*verifies* the ID token that signing-in produces. It never issues or refreshes tokens.
"""
import json
import logging
from functools import lru_cache

import firebase_admin
from fastapi import HTTPException, status
from firebase_admin import auth as firebase_auth
from firebase_admin import credentials

from app.config import get_settings

logger = logging.getLogger("crewmate.auth")


@lru_cache
def get_firebase_app() -> firebase_admin.App:
    """
    Lazily initializes the Admin SDK exactly once per process, using the service-account
    JSON at FIREBASE_SERVICE_ACCOUNT_PATH (blueprint §11 — this file is the single most
    sensitive backend secret; it must never be committed or shipped to the frontend).
    Alternatively, takes a JSON string from FIREBASE_SERVICE_ACCOUNT_JSON for easy hosting.
    """
    settings = get_settings()
    if firebase_admin._apps:  # already initialized (e.g. under a test runner / reload)
        return firebase_admin.get_app()
    
    if settings.FIREBASE_SERVICE_ACCOUNT_JSON:
        cert_dict = json.loads(settings.FIREBASE_SERVICE_ACCOUNT_JSON)
        cred = credentials.Certificate(cert_dict)
    else:
        cred = credentials.Certificate(settings.FIREBASE_SERVICE_ACCOUNT_PATH)
        
    return firebase_admin.initialize_app(cred)


def verify_id_token(id_token: str) -> dict:
    """
    Verifies a Firebase ID token and returns its decoded claims (contains at least
    'uid' and, for password/email accounts, 'email'). Raises 401 on any failure —
    expired, malformed, revoked, or wrong project.
    """
    try:
        app = get_firebase_app()
        return firebase_auth.verify_id_token(id_token, app=app, check_revoked=False)
    except Exception as exc:  # firebase_admin raises several distinct exception types here
        logger.warning("Firebase ID token verification failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": {"code": "UNAUTHENTICATED", "message": "Invalid or expired session token."}},
        ) from exc
