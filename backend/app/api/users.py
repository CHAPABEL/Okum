from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.api.deps import get_admin_user, get_current_user, get_github_oauth_account
from app.db.session import get_db
from app.models.models import Message, User
from app.schemas.schemas import UserOut
from app.services.github import fetch_repositories

router = APIRouter()


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return UserOut.model_validate(current_user)


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
    return [UserOut.model_validate(item) for item in users]


@router.get("/admin/stats")
def admin_stats(_: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    users_count = db.query(func.count(User.id)).scalar() or 0
    messages_count = db.query(func.count(Message.id)).scalar() or 0
    return {"users_count": int(users_count), "messages_count": int(messages_count)}


@router.get("/admin/users", response_model=list[UserOut])
def admin_users(_: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    users = db.query(User).order_by(User.created_at.desc()).all()
    return [UserOut.model_validate(item) for item in users]


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
