import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.api.deps import get_admin_user, get_current_user, get_github_oauth_account
from app.core.security import hash_email_otp, verify_email_otp
from app.db.session import get_db
from app.models.models import EmailAuthChallenge, Message, OAuthAccount, User
from app.schemas.schemas import EmailChangeStartIn, EmailVerifyIn, UserOut, UsernameUpdateIn
from app.services.email_delivery import send_verification_email
from app.services.github import fetch_repositories
from app.services.user_profile import user_to_out, validate_username

router = APIRouter()

_OTP_TTL = timedelta(minutes=15)


def _normalize_email(email: str) -> str:
    return email.strip().lower()


def _normalize_otp(code: str) -> str:
    return "".join(c for c in code if c.isdigit())


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return user_to_out(current_user)


@router.patch("/me/username", response_model=UserOut)
def update_username(
    payload: UsernameUpdateIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        name = validate_username(payload.username)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    taken = db.query(User).filter(User.username == name, User.id != current_user.id).first()
    if taken:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Это имя уже занято")
    current_user.username = name
    db.commit()
    db.refresh(current_user)
    return user_to_out(current_user)


@router.post("/me/email/start")
def email_change_start(
    payload: EmailChangeStartIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    new_email = _normalize_email(payload.new_email)
    if new_email == current_user.email.strip().lower():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Это уже ваша почта")
    if db.query(User).filter(func.lower(User.email) == new_email).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Почта уже используется")
    db.query(EmailAuthChallenge).filter(
        EmailAuthChallenge.user_id == current_user.id,
        EmailAuthChallenge.purpose == "email_change",
    ).delete(synchronize_session=False)
    code = f"{secrets.randbelow(1_000_000):06d}"
    try:
        send_verification_email(payload.new_email.strip(), code)
    except RuntimeError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Не удалось отправить письмо. Попробуйте позже.",
        ) from exc
    challenge = EmailAuthChallenge(
        email=new_email,
        purpose="email_change",
        user_id=current_user.id,
        password_hash=None,
        code_hash=hash_email_otp(new_email, code),
        expires_at=datetime.now(timezone.utc) + _OTP_TTL,
    )
    db.add(challenge)
    db.commit()
    return {"ok": True}


@router.post("/me/email/verify", response_model=UserOut)
def email_change_verify(
    payload: EmailVerifyIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    new_email = _normalize_email(payload.email)
    code = _normalize_otp(payload.code)
    if len(code) != 6:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Введите 6 цифр кода")
    challenge = (
        db.query(EmailAuthChallenge)
        .filter(
            EmailAuthChallenge.user_id == current_user.id,
            EmailAuthChallenge.purpose == "email_change",
            EmailAuthChallenge.email == new_email,
        )
        .first()
    )
    if not challenge or challenge.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Неверный или просроченный код")
    if not verify_email_otp(new_email, code, challenge.code_hash):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Неверный или просроченный код")
    if db.query(User).filter(func.lower(User.email) == new_email, User.id != current_user.id).first():
        db.delete(challenge)
        db.commit()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Почта уже используется")
    current_user.email = new_email
    db.delete(challenge)
    db.commit()
    db.refresh(current_user)
    return user_to_out(current_user)


@router.get("/github-status")
def github_status(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return {"connected": bool(get_github_oauth_account(db, current_user.id))}


@router.get("/repositories")
async def repositories(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    account = get_github_oauth_account(db, current_user.id)
    if not account:
        return []
    return await fetch_repositories(account.access_token)


@router.get("/search", response_model=list[UserOut])
def search_users(q: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    query = q.strip()
    if len(query) < 2:
        return []
    users = (
        db.query(User)
        .filter(User.id != current_user.id)
        .filter(or_(User.username.ilike(f"%{query}%"), User.email.ilike(f"%{query}%")))
        .order_by(User.username.asc())
        .limit(20)
        .all()
    )
    return [user_to_out(item) for item in users]


@router.get("/admin/stats")
def admin_stats(_: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    users_count = db.query(func.count(User.id)).scalar() or 0
    messages_count = db.query(func.count(Message.id)).scalar() or 0
    github_users_count = (
        db.query(func.count(func.distinct(OAuthAccount.user_id)))
        .filter(OAuthAccount.provider == "github")
        .scalar()
        or 0
    )
    return {
        "users_count": int(users_count),
        "messages_count": int(messages_count),
        "github_users_count": int(github_users_count),
    }


@router.get("/admin/users", response_model=list[UserOut])
def admin_users(_: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    users = db.query(User).order_by(User.created_at.desc()).all()
    return [user_to_out(item) for item in users]


@router.get("/admin/users/search", response_model=list[UserOut])
def admin_search_users(q: str, _: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    query = q.strip()
    if not query:
        users = db.query(User).order_by(User.created_at.desc()).limit(200).all()
        return [user_to_out(item) for item in users]
    users = (
        db.query(User)
        .filter(or_(User.username.ilike(f"%{query}%"), User.email.ilike(f"%{query}%")))
        .order_by(User.created_at.desc())
        .limit(200)
        .all()
    )
    return [user_to_out(item) for item in users]


@router.delete("/admin/users/{target_user_id}")
def admin_delete_user(
    target_user_id: int,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    if target_user_id == admin_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Admin cannot delete self")
    target = db.get(User, target_user_id)
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    db.delete(target)
    db.commit()
    return {"ok": True}
