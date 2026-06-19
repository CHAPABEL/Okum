import { API_BASE_URL } from "./config";
import { AdminStats, Chat, Commit, Message, Repository, User } from "./types";

function parseApiErrorBody(text: string): string {
  if (!text) return "Запрос не выполнен";
  const trimmed = text.trimStart();
  if (trimmed.startsWith("<!DOCTYPE") || trimmed.startsWith("<html")) {
    return "Сервер вернул HTML вместо JSON. Откройте сайт через http://IP (порт 80), не :3000. Проверьте NEXT_PUBLIC_API_BASE_URL= в .env.";
  }
  try {
    const data = JSON.parse(text) as { detail?: unknown };
    const d = data.detail;
    if (typeof d === "string") return d;
    if (Array.isArray(d) && d[0] && typeof (d[0] as { msg?: string }).msg === "string") {
      return (d[0] as { msg: string }).msg;
    }
  } catch {
    /* not JSON */
  }
  return text.length > 400 ? `${text.slice(0, 400)}…` : text;
}

async function fetchApi(input: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(input, init);
  } catch {
    throw new Error(
      "Нет связи с API. Откройте сайт через http://IP (порт 80, без :3000) и проверьте, что backend запущен на сервере.",
    );
  }
}

async function request<T>(path: string, token: string, options?: RequestInit): Promise<T> {
  const response = await fetchApi(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(parseApiErrorBody(await response.text()));
  return (await response.json()) as T;
}

export async function getGithubLoginUrl(): Promise<string> {
  const response = await fetchApi(`${API_BASE_URL}/auth/github`, { cache: "no-store" });
  if (!response.ok) throw new Error("Не удалось получить ссылку GitHub");
  const data = (await response.json()) as { url: string };
  return data.url;
}

async function postJsonNoAuth<T>(path: string, body: unknown): Promise<T> {
  const response = await fetchApi(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(parseApiErrorBody(await response.text()));
  const text = await response.text();
  if (!text) return {} as T;
  return JSON.parse(text) as T;
}

export async function registerEmail(email: string, password: string): Promise<{ token: string; user: User }> {
  return postJsonNoAuth("/auth/register", { email, password });
}

export async function loginEmail(email: string, password: string): Promise<{ token: string; user: User }> {
  return postJsonNoAuth("/auth/login", { email, password });
}

// --- Email OTP auth (disabled) ---
// export async function startEmailRegister(email: string, password: string): Promise<void> {
//   await postJsonNoAuth<{ ok: true }>("/auth/register/start", { email, password });
// }
//
// export async function verifyEmailRegister(email: string, code: string): Promise<{ token: string; user: User }> {
//   return postJsonNoAuth("/auth/register/verify", { email, code });
// }
//
// export async function startEmailLogin(email: string, password: string): Promise<void> {
//   await postJsonNoAuth<{ ok: true }>("/auth/login/start", { email, password });
// }
//
// export async function verifyEmailLogin(email: string, code: string): Promise<{ token: string; user: User }> {
//   return postJsonNoAuth("/auth/login/verify", { email, code });
// }

export async function loginAdmin(login: string, password: string): Promise<{ token: string; user: User }> {
  const response = await fetchApi(`${API_BASE_URL}/auth/admin-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ login, password }),
  });
  if (!response.ok) {
    throw new Error(parseApiErrorBody(await response.text()) || "Не удалось выполнить вход администратора");
  }
  return (await response.json()) as { token: string; user: User };
}

export function getMe(token: string): Promise<User> {
  return request<User>("/user/me", token);
}

export function updateUsername(token: string, username: string): Promise<User> {
  return request<User>("/user/me/username", token, {
    method: "PATCH",
    body: JSON.stringify({ username }),
  });
}

export async function startEmailChange(token: string, newEmail: string): Promise<void> {
  await request<{ ok: true }>("/user/me/email/start", token, {
    method: "POST",
    body: JSON.stringify({ new_email: newEmail }),
  });
}

export function verifyEmailChange(token: string, email: string, code: string): Promise<User> {
  return request<User>("/user/me/email/verify", token, {
    method: "POST",
    body: JSON.stringify({ email, code }),
  });
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

export function deleteMessage(token: string, chatId: number, messageId: number): Promise<{ ok: true }> {
  return request<{ ok: true }>(`/chats/${chatId}/messages/${messageId}`, token, { method: "DELETE" });
}

export function listParticipants(token: string, chatId: number): Promise<User[]> {
  return request<User[]>(`/chats/${chatId}/participants`, token);
}

export function addChatParticipants(token: string, chatId: number, participantIds: number[]): Promise<{ ok: true }> {
  return request<{ ok: true }>(`/chats/${chatId}/participants`, token, {
    method: "POST",
    body: JSON.stringify({ participant_ids: participantIds }),
  });
}

export function listCommits(token: string, chatId: number): Promise<Commit[]> {
  return request<Commit[]>(`/chats/${chatId}/commits`, token);
}

export function getAdminStats(token: string): Promise<AdminStats> {
  return request<AdminStats>("/user/admin/stats", token);
}

export function listAdminUsers(token: string): Promise<User[]> {
  return request<User[]>("/user/admin/users", token);
}

export function searchAdminUsers(token: string, q: string): Promise<User[]> {
  return request<User[]>(`/user/admin/users/search?q=${encodeURIComponent(q)}`, token);
}

export function deleteAdminUser(token: string, userId: number): Promise<{ ok: true }> {
  return request<{ ok: true }>(`/user/admin/users/${userId}`, token, { method: "DELETE" });
}
