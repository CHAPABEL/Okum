from fastapi import APIRouter, Depends
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_github_oauth_account
from app.db.session import get_db
from app.models.models import User
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
