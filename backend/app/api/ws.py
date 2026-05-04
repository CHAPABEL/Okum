from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.db.session import SessionLocal
from app.models.models import Chat, ChatParticipant, Message
from app.services.ws_manager import ws_manager

router = APIRouter()


@router.websocket("/ws/chat/{chat_id}")
async def chat_socket(websocket: WebSocket, chat_id: int):
    token = websocket.query_params.get("token", "")
    try:
        user_id = decode_access_token(token)
    except Exception:  # noqa: BLE001
        await websocket.close(code=1008, reason="Invalid token")
        return

    db: Session = SessionLocal()
    chat = db.query(Chat).filter(Chat.id == chat_id).first()
    participation = (
        db.query(ChatParticipant).filter(ChatParticipant.chat_id == chat_id, ChatParticipant.user_id == user_id).first()
    )
    has_access = bool(chat and (chat.user_id == user_id or participation))
    if not has_access:
        await websocket.close(code=1008, reason="Access denied")
        db.close()
        return

    await ws_manager.connect(chat_id, websocket)
    try:
        while True:
            data = await websocket.receive_json()
            content = str(data.get("content", "")).strip()
            if not content:
                continue
            message = Message(chat_id=chat_id, user_id=user_id, content=content)
            db.add(message)
            db.commit()
            db.refresh(message)
            await ws_manager.broadcast(
                chat_id,
                {
                    "id": message.id,
                    "chat_id": message.chat_id,
                    "user_id": message.user_id,
                    "content": message.content,
                    "created_at": message.created_at.isoformat(),
                },
            )
    except WebSocketDisconnect:
        ws_manager.disconnect(chat_id, websocket)
    finally:
        db.close()
