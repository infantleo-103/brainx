from typing import List, Dict
from fastapi import WebSocket
from collections import defaultdict

class ConnectionManager:
    def __init__(self):
        # chat_id -> List[WebSocket]
        self.active_connections: Dict[int, List[WebSocket]] = defaultdict(list)

    async def connect(self, websocket: WebSocket, chat_id: int):
        await websocket.accept()
        self.active_connections[chat_id].append(websocket)

    def disconnect(self, websocket: WebSocket, chat_id: int):
        if chat_id in self.active_connections:
            if websocket in self.active_connections[chat_id]:
                self.active_connections[chat_id].remove(websocket)
            if not self.active_connections[chat_id]:
                del self.active_connections[chat_id]

    async def broadcast(self, message: dict, chat_id: int):
        if chat_id in self.active_connections:
            # We iterate over a copy of the list to avoid modification issues if a disconnect happens immediately
            # though async disconnect logic should handle it.
            # Using simple loop for now
            for connection in self.active_connections[chat_id]:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    # In case of broken pipe etc, we might want to log or cleanup
                    print(f"Error broadcasting to socket: {e}")

manager = ConnectionManager()
