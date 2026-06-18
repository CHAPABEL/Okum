import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.config import settings
from app.core.security import (
    create_access_token,
    hash_email_otp,
    hash_password,
    verify_email_otp,
    verify_password,
)
from app.models.models import EmailAuthChallenge, OAuthAccount, User
from app.schemas.schemas import AdminAuthIn, AuthOut, EmailAuthIn, EmailVerifyIn
from app.services.email_delivery import send_verification_email_background
from app.services.github import exchange_code_for_token, fetch_user
from app.services.user_profile import pending_username, user_to_out

router = APIRouter()

_OTP_TTL = timedelta(minutes=15)


def _normalize_email(email: str) -> str:
    return email.strip().lower()


def _normalize_otp(code: str) -> str:
    return "".join(c for c in code if c.isdigit())


def _user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(func.lower(User.email) == _normalize_email(email)).first()


@router.get("/github")
def github_login():
    if not settings.github_client_id.strip() or not settings.github_client_secret.strip():
        raise HTTPException(
            status_code=503,
            detail="GitHub OAuth is not configured: set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in .env",
        )
    scope = "read:user user:email repo"
    url = (
        "https://github.com/login/oauth/authorize"
        f"?client_id={settings.github_client_id}&redirect_uri={settings.github_redirect_uri}&scope={scope}"
    )
    return {"url": url}


@router.get("/callback")
async def github_callback(code: str, db: Session = Depends(get_db)):
    try:
        access_token = await exchange_code_for_token(code)
    except RuntimeError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
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


@router.post("/register/start")
def register_start(payload: EmailAuthIn, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    email_norm = _normalize_email(payload.email)
    if len(payload.password) < 8:
        raise HTTPException(status_code=400, detail="Пароль простой")
    if _user_by_email(db, payload.email):
        raise HTTPException(status_code=400, detail="Этот адрес уже зарегистрирован")
    db.query(EmailAuthChallenge).filter(
        EmailAuthChallenge.email == email_norm,
        EmailAuthChallenge.purpose == "register",
    ).delete(synchronize_session=False)
    code = f"{secrets.randbelow(1_000_000):06d}"
    challenge = EmailAuthChallenge(
        email=email_norm,
        purpose="register",
        user_id=None,
        password_hash=hash_password(payload.password),
        code_hash=hash_email_otp(email_norm, code),
        expires_at=datetime.now(timezone.utc) + _OTP_TTL,
    )
    db.add(challenge)
    db.commit()
    background_tasks.add_task(send_verification_email_background, payload.email.strip(), code)
    return {"ok": True}


@router.post("/register/verify", response_model=AuthOut)
def register_verify(payload: EmailVerifyIn, db: Session = Depends(get_db)):
    email_norm = _normalize_email(payload.email)
    code = _normalize_otp(payload.code)
    if len(code) != 6:
        raise HTTPException(status_code=400, detail="Введите 6 цифр кода")
    challenge = (
        db.query(EmailAuthChallenge)
        .filter(EmailAuthChallenge.email == email_norm, EmailAuthChallenge.purpose == "register")
        .first()
    )
    if not challenge or challenge.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Неверный или просроченный код")
    if not verify_email_otp(email_norm, code, challenge.code_hash):
        raise HTTPException(status_code=400, detail="Неверный или просроченный код")
    if _user_by_email(db, payload.email):
        db.delete(challenge)
        db.commit()
        raise HTTPException(status_code=400, detail="Этот адрес уже зарегистрирован")
    ph = challenge.password_hash
    if not ph:
        db.delete(challenge)
        db.commit()
        raise HTTPException(status_code=400, detail="Неверный или просроченный код")
    user = User(email=email_norm, username=pending_username(), avatar_url=None, password_hash=ph)
    db.delete(challenge)
    db.add(user)
    db.commit()
    db.refresh(user)
    return AuthOut(token=create_access_token(user.id), user=user_to_out(user))


@router.post("/login/start")
def login_start(payload: EmailAuthIn, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    email_norm = _normalize_email(payload.email)
    user = _user_by_email(db, payload.email)
    if not user:
        raise HTTPException(status_code=401, detail="Неверный email или пароль")
    if not user.password_hash:
        raise HTTPException(
            status_code=400,
            detail="Для этого аккаунта доступен только вход через GitHub",
        )
    if not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Неверный email или пароль")
    db.query(EmailAuthChallenge).filter(
        EmailAuthChallenge.email == email_norm,
        EmailAuthChallenge.purpose == "login",
    ).delete(synchronize_session=False)
    code = f"{secrets.randbelow(1_000_000):06d}"
    challenge = EmailAuthChallenge(
        email=email_norm,
        purpose="login",
        user_id=user.id,
        password_hash=None,
        code_hash=hash_email_otp(email_norm, code),
        expires_at=datetime.now(timezone.utc) + _OTP_TTL,
    )
    db.add(challenge)
    db.commit()
    background_tasks.add_task(send_verification_email_background, payload.email.strip(), code)
    return {"ok": True}


@router.post("/login/verify", response_model=AuthOut)
def login_verify(payload: EmailVerifyIn, db: Session = Depends(get_db)):
    email_norm = _normalize_email(payload.email)
    code = _normalize_otp(payload.code)
    if len(code) != 6:
        raise HTTPException(status_code=400, detail="Введите 6 цифр кода")
    challenge = (
        db.query(EmailAuthChallenge)
        .filter(EmailAuthChallenge.email == email_norm, EmailAuthChallenge.purpose == "login")
        .first()
    )
    if not challenge or challenge.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Неверный или просроченный код")
    if not challenge.user_id or not verify_email_otp(email_norm, code, challenge.code_hash):
        raise HTTPException(status_code=400, detail="Неверный или просроченный код")
    user = db.get(User, challenge.user_id)
    if not user:
        db.delete(challenge)
        db.commit()
        raise HTTPException(status_code=400, detail="Неверный или просроченный код")
    db.delete(challenge)
    db.commit()
    return AuthOut(token=create_access_token(user.id), user=user_to_out(user))


@router.post("/admin-login", response_model=AuthOut)
def admin_login(payload: AdminAuthIn, db: Session = Depends(get_db)):
    expected_login = settings.admin_login.strip()
    expected_password = settings.admin_password.strip()
    if payload.login != expected_login or payload.password != expected_password:
        raise HTTPException(status_code=401, detail="Invalid admin credentials")

    admin_email = settings.admin_email.strip().lower() or "admin@flow.local"
    user = db.query(User).filter(User.email == admin_email).first()
    if not user:
        user = User(
            email=admin_email,
            username=expected_login or "admin",
            avatar_url=None,
            password_hash=hash_password(expected_password or "admin"),
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    return AuthOut(token=create_access_token(user.id), user=user_to_out(user))
