from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_current_user, get_github_oauth_account
from app.db.session import get_db
from app.models.models import Chat, ChatParticipant, Commit, Message, Repository, User
from app.schemas.schemas import AddParticipantsIn, ChatCreateIn, ChatDeleteIn, MessageOut, PersonalChatCreateIn, UserOut
from app.services.github import fetch_repository_commits

router = APIRouter()


@router.get("/")
def list_chats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    chats = (
        db.query(Chat)
        .options(joinedload(Chat.repository))
        .outerjoin(ChatParticipant, ChatParticipant.chat_id == Chat.id)
        .filter((Chat.user_id == current_user.id) | (ChatParticipant.user_id == current_user.id))
        .order_by(Chat.created_at.desc())
        .distinct()
        .all()
    )
    return chats


@router.post("/create")
async def create_chat(payload: ChatCreateIn, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    repository = db.query(Repository).filter(Repository.github_repo_id == payload.github_repo_id).first()
    if not repository:
        repository = Repository(
            github_repo_id=payload.github_repo_id,
            full_name=payload.full_name,
            html_url=payload.html_url,
            default_branch=payload.default_branch,
        )
        db.add(repository)
        db.flush()

    participant_ids = {current_user.id, *payload.participant_ids}
    existing_chat = db.query(Chat).filter(Chat.repository_id == repository.id).order_by(Chat.created_at.asc()).first()
    if existing_chat:
        existing_participants = {
            item.user_id
            for item in db.query(ChatParticipant).filter(ChatParticipant.chat_id == existing_chat.id).all()
        }
        for user_id in participant_ids - existing_participants:
            db.add(ChatParticipant(chat_id=existing_chat.id, user_id=user_id))
        db.commit()
        db.refresh(existing_chat)
        return existing_chat

    chat = Chat(user_id=current_user.id, repository_id=repository.id, title=payload.title)
    db.add(chat)
    db.flush()

    valid_users = db.query(User).filter(User.id.in_(participant_ids)).all()
    for participant in valid_users:
        db.add(ChatParticipant(chat_id=chat.id, user_id=participant.id))
    db.commit()
    db.refresh(chat)

    account = get_github_oauth_account(db, current_user.id)
    if account:
        commits = await fetch_repository_commits(account.access_token, repository.full_name)
        db.query(Commit).filter(Commit.repository_id == repository.id).delete()
        for commit_data in commits:
            db.add(Commit(repository_id=repository.id, **commit_data))
        db.commit()
    return chat


@router.post("/create-personal")
def create_personal_chat(payload: PersonalChatCreateIn, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if payload.target_user_id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot create personal chat with self")
    target_user = db.get(User, payload.target_user_id)
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Target user not found")

    low_id, high_id = sorted([current_user.id, target_user.id])
    synthetic_repo_id = f"personal:{low_id}:{high_id}"
    repository = db.query(Repository).filter(Repository.github_repo_id == synthetic_repo_id).first()
    if not repository:
        repository = Repository(
            github_repo_id=synthetic_repo_id,
            full_name=f"personal/{low_id}-{high_id}",
            html_url="#",
            default_branch="direct",
        )
        db.add(repository)
        db.flush()

    existing_chat = db.query(Chat).filter(Chat.repository_id == repository.id).order_by(Chat.created_at.desc()).first()
    if existing_chat:
        return existing_chat

    chat = Chat(user_id=current_user.id, repository_id=repository.id, title=target_user.username)
    db.add(chat)
    db.flush()
    db.add(ChatParticipant(chat_id=chat.id, user_id=current_user.id))
    db.add(ChatParticipant(chat_id=chat.id, user_id=target_user.id))
    db.commit()
    db.refresh(chat)
    return chat


@router.post("/delete")
def delete_chat(payload: ChatDeleteIn, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    chat = db.query(Chat).filter(Chat.id == payload.chat_id).first()
    if not chat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat not found")
    participation = (
        db.query(ChatParticipant).filter(ChatParticipant.chat_id == chat.id, ChatParticipant.user_id == current_user.id).first()
    )
    if not participation and chat.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    if chat.user_id == current_user.id:
        db.delete(chat)
    else:
        db.delete(participation)
    db.commit()
    return {"ok": True}


@router.get("/{chat_id}/messages")
def list_messages(chat_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    chat = (
        db.query(Chat)
        .outerjoin(ChatParticipant, ChatParticipant.chat_id == Chat.id)
        .filter(Chat.id == chat_id)
        .filter((Chat.user_id == current_user.id) | (ChatParticipant.user_id == current_user.id))
        .first()
    )
    if not chat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat not found")
    messages = db.query(Message).filter(Message.chat_id == chat_id).order_by(Message.created_at.asc()).all()
    return [MessageOut.model_validate(msg) for msg in messages]


@router.delete("/{chat_id}/messages/{message_id}")
def delete_message(message_id: int, chat_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    chat = (
        db.query(Chat)
        .outerjoin(ChatParticipant, ChatParticipant.chat_id == Chat.id)
        .filter(Chat.id == chat_id)
        .filter((Chat.user_id == current_user.id) | (ChatParticipant.user_id == current_user.id))
        .first()
    )
    if not chat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat not found")

    message = db.query(Message).filter(Message.id == message_id, Message.chat_id == chat_id).first()
    if not message:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found")

    # Any chat participant can moderate/delete a message from this chat.
    participation = (
        db.query(ChatParticipant)
        .filter(ChatParticipant.chat_id == chat_id, ChatParticipant.user_id == current_user.id)
        .first()
    )
    if not participation and chat.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    db.delete(message)
    db.commit()
    return {"ok": True}


@router.get("/{chat_id}/participants", response_model=list[UserOut])
def list_participants(chat_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    chat = (
        db.query(Chat)
        .outerjoin(ChatParticipant, ChatParticipant.chat_id == Chat.id)
        .filter(Chat.id == chat_id)
        .filter((Chat.user_id == current_user.id) | (ChatParticipant.user_id == current_user.id))
        .first()
    )
    if not chat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat not found")
    participant_ids = {
        item.user_id for item in db.query(ChatParticipant.user_id).filter(ChatParticipant.chat_id == chat_id).all()
    }
    participant_ids.add(chat.user_id)
    participants = db.query(User).filter(User.id.in_(participant_ids)).order_by(User.username.asc()).all()
    return [UserOut.model_validate(item) for item in participants]


@router.post("/{chat_id}/participants")
def add_participants(
    chat_id: int,
    payload: AddParticipantsIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    chat = (
        db.query(Chat)
        .outerjoin(ChatParticipant, ChatParticipant.chat_id == Chat.id)
        .filter(Chat.id == chat_id)
        .filter((Chat.user_id == current_user.id) | (ChatParticipant.user_id == current_user.id))
        .first()
    )
    if not chat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat not found")
    participation = (
        db.query(ChatParticipant).filter(ChatParticipant.chat_id == chat_id, ChatParticipant.user_id == current_user.id).first()
    )
    if not participation and chat.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    existing = {row.user_id for row in db.query(ChatParticipant).filter(ChatParticipant.chat_id == chat_id).all()}
    existing.add(chat.user_id)
    for uid in payload.participant_ids:
        if uid == current_user.id:
            continue
        if uid in existing:
            continue
        target = db.get(User, uid)
        if not target:
            continue
        db.add(ChatParticipant(chat_id=chat_id, user_id=uid))
        existing.add(uid)
    db.commit()
    return {"ok": True}


@router.get("/{chat_id}/commits")
def list_commits(chat_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    chat = (
        db.query(Chat)
        .options(joinedload(Chat.repository))
        .outerjoin(ChatParticipant, ChatParticipant.chat_id == Chat.id)
        .filter(Chat.id == chat_id)
        .filter((Chat.user_id == current_user.id) | (ChatParticipant.user_id == current_user.id))
        .first()
    )
    if not chat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat not found")
    if chat.repository and chat.repository.github_repo_id.startswith("personal:"):
        return []
    commits = (
        db.query(Commit).filter(Commit.repository_id == chat.repository_id).order_by(Commit.committed_at.desc()).limit(50).all()
    )
    return commits
