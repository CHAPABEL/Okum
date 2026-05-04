from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.config import settings
from app.core.security import create_access_token, hash_password, verify_password
from app.models.models import OAuthAccount, User
from app.schemas.schemas import AuthOut, EmailAuthIn, UserOut
from app.services.github import exchange_code_for_token, fetch_user

router = APIRouter()


@router.get("/github")
def github_login():
    scope = "read:user user:email repo"
    url = (
        "https://github.com/login/oauth/authorize"
        f"?client_id={settings.github_client_id}&redirect_uri={settings.github_redirect_uri}&scope={scope}"
    )
    return {"url": url}


@router.get("/callback")
async def github_callback(code: str, db: Session = Depends(get_db)):
    access_token = await exchange_code_for_token(code)
    gh_user = await fetch_user(access_token)

    user = db.query(User).filter(User.email == gh_user["email"]).first()
    if not user:
        user = User(
            email=gh_user["email"],
            username=gh_user["username"],
            avatar_url=gh_user["avatar_url"],
            password_hash="",
        )
        db.add(user)
        db.flush()

    oauth = (
        db.query(OAuthAccount)
        .filter(
            OAuthAccount.user_id == user.id,
            OAuthAccount.provider == "github",
        )
        .first()
    )
    if not oauth:
        oauth = OAuthAccount(
            user_id=user.id,
            provider="github",
            provider_user_id=gh_user["provider_user_id"],
            access_token=access_token,
        )
        db.add(oauth)
    else:
        oauth.access_token = access_token
        oauth.provider_user_id = gh_user["provider_user_id"]

    db.commit()
    token = create_access_token(user.id)
    return RedirectResponse(url=f"{settings.frontend_url}/chat?token={token}")


@router.post("/register", response_model=AuthOut)
def register(payload: EmailAuthIn, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already used")
    username = payload.email.split("@")[0]
    user = User(email=payload.email, username=username, avatar_url=None, password_hash=hash_password(payload.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return AuthOut(token=create_access_token(user.id), user=UserOut.model_validate(user))


@router.post("/login", response_model=AuthOut)
def login(payload: EmailAuthIn, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not user.password_hash or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return AuthOut(token=create_access_token(user.id), user=UserOut.model_validate(user))
