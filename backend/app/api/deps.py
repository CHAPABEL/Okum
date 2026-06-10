from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import decode_access_token
from app.db.session import get_db
from app.models.models import OAuthAccount, User


def get_current_user(authorization: str = Header(default=""), db: Session = Depends(get_db)) -> User:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    token = authorization.split(" ", 1)[1]
    try:
        user_id = decode_access_token(token)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from exc

    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


def get_github_oauth_account(db: Session, user_id: int) -> OAuthAccount | None:
    return db.query(OAuthAccount).filter(OAuthAccount.user_id == user_id, OAuthAccount.provider == "github").first()


def get_admin_user(current_user: User = Depends(get_current_user)) -> User:
    admin_email = settings.admin_email.strip().lower() or "admin@flow.local"
    if not admin_email or current_user.email.lower() != admin_email:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return current_user
