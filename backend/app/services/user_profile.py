import re
import secrets

from app.models.models import User
from app.schemas.schemas import UserOut

USERNAME_PENDING_PREFIX = "pending:"
USERNAME_RE = re.compile(r"^[a-zA-Z0-9_а-яА-ЯёЁ]{3,32}$")


def pending_username() -> str:
    return f"{USERNAME_PENDING_PREFIX}{secrets.token_hex(8)}"


def default_username_from_email(email: str, taken: set[str]) -> str:
    local = email.split("@", 1)[0]
    base = re.sub(r"[^a-zA-Z0-9_а-яА-ЯёЁ]", "_", local).strip("_")[:24]
    if len(base) < 3:
        base = "user"
    candidate = base[:32]
    n = 0
    while candidate.lower() in taken:
        n += 1
        suffix = f"_{n}"
        candidate = f"{base[: 32 - len(suffix)]}{suffix}"
    return candidate


def needs_username(user: User) -> bool:
    return user.username.startswith(USERNAME_PENDING_PREFIX)


def public_username(user: User) -> str:
    if needs_username(user):
        return ""
    return user.username


def user_to_out(user: User) -> UserOut:
    return UserOut(
        id=user.id,
        email=user.email,
        username=public_username(user),
        avatar_url=user.avatar_url,
        needs_username=needs_username(user),
    )


def validate_username(value: str) -> str:
    name = value.strip()
    if not USERNAME_RE.match(name):
        raise ValueError("Имя: от 3 до 32 символов, буквы, цифры и _")
    return name
