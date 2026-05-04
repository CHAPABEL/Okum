import { API_BASE_URL } from "./config";
import { Chat, Commit, Message, Repository, User } from "./types";

async function request<T>(path: string, token: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(await response.text());
  return (await response.json()) as T;
}

export async function getGithubLoginUrl(): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/auth/github`, { cache: "no-store" });
  if (!response.ok) throw new Error("Failed to fetch github URL");
  const data = (await response.json()) as { url: string };
  return data.url;
}

export async function loginWithEmail(email: string, password: string): Promise<{ token: string; user: User }> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) throw new Error("Failed to login");
  return (await response.json()) as { token: string; user: User };
}

export async function registerWithEmail(email: string, password: string): Promise<{ token: string; user: User }> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) throw new Error("Failed to register");
  return (await response.json()) as { token: string; user: User };
}

export function getMe(token: string): Promise<User> {
  return request<User>("/user/me", token);
}

export function githubStatus(token: string): Promise<{ connected: boolean }> {
  return request<{ connected: boolean }>("/user/github-status", token);
}

export function getRepositories(token: string): Promise<Repository[]> {
  return request<Repository[]>("/user/repositories", token);
}

export function searchUsers(token: string, q: string): Promise<User[]> {
  return request<User[]>(`/user/search?q=${encodeURIComponent(q)}`, token);
}

export function listChats(token: string): Promise<Chat[]> {
  return request<Chat[]>("/chats/", token);
}

export function createChat(
  token: string,
  payload: {
    title: string;
    github_repo_id: string;
    full_name: string;
    html_url: string;
    default_branch: string;
    participant_ids?: number[];
  },
): Promise<Chat> {
  return request<Chat>("/chats/create", token, { method: "POST", body: JSON.stringify(payload) });
}

export function createPersonalChat(token: string, targetUserId: number): Promise<Chat> {
  return request<Chat>("/chats/create-personal", token, {
    method: "POST",
    body: JSON.stringify({ target_user_id: targetUserId }),
  });
}

export function deleteChat(token: string, chatId: number): Promise<{ ok: true }> {
  return request<{ ok: true }>("/chats/delete", token, { method: "POST", body: JSON.stringify({ chat_id: chatId }) });
}

export function listMessages(token: string, chatId: number): Promise<Message[]> {
  return request<Message[]>(`/chats/${chatId}/messages`, token);
}

export function listParticipants(token: string, chatId: number): Promise<User[]> {
  return request<User[]>(`/chats/${chatId}/participants`, token);
}

export function listCommits(token: string, chatId: number): Promise<Commit[]> {
  return request<Commit[]>(`/chats/${chatId}/commits`, token);
}
