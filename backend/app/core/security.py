from datetime import datetime, timedelta, timezone
import hashlib
import hmac

import jwt

from app.core.config import settings

ALGORITHM = "HS256"
TOKEN_TTL_MINUTES = 60 * 24 * 7


def create_access_token(user_id: int) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=TOKEN_TTL_MINUTES)).timestamp()),
    }
    return jwt.encode(payload, settings.secret_key, algorithm=ALGORITHM)


def decode_access_token(token: str) -> int:
    payload = jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
    return int(payload["sub"])


def hash_password(password: str) -> str:
    salted = f"{settings.secret_key}:{password}".encode("utf-8")
    return hashlib.sha256(salted).hexdigest()


def verify_password(password: str, password_hash: str) -> bool:
    return hmac.compare_digest(hash_password(password), password_hash)


def hash_email_otp(email: str, code: str) -> str:
    normalized = f"{settings.secret_key}:{email.strip().lower()}:{code.strip()}"
    return hashlib.sha256(normalized.encode("utf-8")).hexdigest()


def verify_email_otp(email: str, code: str, code_hash: str) -> bool:
    return hmac.compare_digest(hash_email_otp(email, code), code_hash)
