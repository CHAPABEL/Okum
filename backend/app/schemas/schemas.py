from datetime import datetime

from pydantic import BaseModel, ConfigDict


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    username: str
    avatar_url: str | None
    needs_username: bool = False


class UsernameUpdateIn(BaseModel):
    username: str


class EmailChangeStartIn(BaseModel):
    new_email: str


class RepositoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    html_url: str
    default_branch: str


class ChatOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    created_at: datetime
    repository: RepositoryOut | None = None


class MessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    chat_id: int
    user_id: int
    content: str
    created_at: datetime


class CommitOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    sha: str
    author_name: str
    message: str
    html_url: str
    committed_at: datetime


class ChatCreateIn(BaseModel):
    title: str
    github_repo_id: str
    full_name: str
    html_url: str
    default_branch: str = "main"
    participant_ids: list[int] = []


class ChatDeleteIn(BaseModel):
    chat_id: int


class PersonalChatCreateIn(BaseModel):
    target_user_id: int


class AddParticipantsIn(BaseModel):
    participant_ids: list[int]


class EmailAuthIn(BaseModel):
    email: str
    password: str


class EmailVerifyIn(BaseModel):
    email: str
    code: str


class AdminAuthIn(BaseModel):
    login: str
    password: str


class AuthOut(BaseModel):
    token: str
    user: UserOut
