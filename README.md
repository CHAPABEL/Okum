# FLOW

Fullstack messenger workspace:
- Frontend: Next.js App Router
- Backend: FastAPI + SQLAlchemy + PostgreSQL
- Real-time chat: WebSocket
- Optional GitHub OAuth + repositories/commits

## Run

1. Copy `.env.example` to `.env` and fill values.
2. Start services:

```bash
docker compose up --build
```

Frontend: `http://localhost:3000`  
Backend: `http://localhost:8000`
