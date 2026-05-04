from collections import defaultdict

from fastapi import WebSocket


class ChatConnectionManager:
    def __init__(self) -> None:
        self.connections: dict[int, list[WebSocket]] = defaultdict(list)

    async def connect(self, chat_id: int, websocket: WebSocket) -> None:
        await websocket.accept()
        self.connections[chat_id].append(websocket)

    def disconnect(self, chat_id: int, websocket: WebSocket) -> None:
        if chat_id in self.connections and websocket in self.connections[chat_id]:
            self.connections[chat_id].remove(websocket)
        if chat_id in self.connections and not self.connections[chat_id]:
            del self.connections[chat_id]

    async def broadcast(self, chat_id: int, payload: dict) -> None:
        for connection in self.connections.get(chat_id, []):
            await connection.send_json(payload)


ws_manager = ChatConnectionManager()
