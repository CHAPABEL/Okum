"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { SquarePen, Trash2 } from "lucide-react";
import { CommitTimeline } from "@/components/commits/CommitTimeline";

import {
  createChat,
  createPersonalChat,
  deleteChat,
  deleteMessage,
  getGithubLoginUrl,
  getMe,
  getRepositories,
  githubStatus,
  listChats,
  listCommits,
  listMessages,
  listParticipants,
  searchUsers,
} from "@/lib/api";
import { getToken, setToken } from "@/lib/auth";
import { API_BASE_URL } from "@/lib/config";
import { Chat, Commit, Message, Repository, User } from "@/lib/types";

type SidebarMode = "projects" | "personal";
type PersonalChat = { id: string; user: User };
type ContextMenuState =
  | {
      x: number;
      y: number;
      type: "message";
      message: Message;
    }
  | {
      x: number;
      y: number;
      type: "chat";
      chat: Chat;
    }
  | null;

export function ChatWorkspace() {
  const [token, setLocalToken] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [personalChats, setPersonalChats] = useState<PersonalChat[]>([]);
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [activePersonalChatId, setActivePersonalChatId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<SidebarMode>("projects");
  const [isRightPanelVisible, setIsRightPanelVisible] = useState(true);
  const [chatSearchQuery, setChatSearchQuery] = useState("");

  const [messages, setMessages] = useState<Message[]>([]);
  const [commits, setCommits] = useState<Commit[]>([]);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [participantsByChat, setParticipantsByChat] = useState<Record<number, User[]>>({});
  const [lastMessageByChat, setLastMessageByChat] = useState<Record<number, string>>({});

  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [githubConnected, setGithubConnected] = useState(false);
  const [githubBindUrl, setGithubBindUrl] = useState("");

  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [showPersonalModal, setShowPersonalModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isClosingCreateModal, setIsClosingCreateModal] = useState(false);
  const [isClosingPersonalModal, setIsClosingPersonalModal] = useState(false);
  const [isClosingDeleteModal, setIsClosingDeleteModal] = useState(false);
  const [userQuery, setUserQuery] = useState("");
  const [userResults, setUserResults] = useState<User[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [selectedRepoId, setSelectedRepoId] = useState("");
  const [includeProject, setIncludeProject] = useState(true);
  const [chatTitleInput, setChatTitleInput] = useState("");
  const [createChatValidationError, setCreateChatValidationError] = useState("");
  const [deleteTargetId, setDeleteTargetId] = useState<string>("");
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const MODAL_ANIM_MS = 240;

  const closeCreateModal = () => {
    setIsClosingCreateModal(true);
    window.setTimeout(() => {
      setShowCreateProjectModal(false);
      setIsClosingCreateModal(false);
    }, MODAL_ANIM_MS);
  };

  const closePersonalModal = () => {
    setIsClosingPersonalModal(true);
    window.setTimeout(() => {
      setShowPersonalModal(false);
      setIsClosingPersonalModal(false);
    }, MODAL_ANIM_MS);
  };

  const closeDeleteModal = () => {
    setIsClosingDeleteModal(true);
    window.setTimeout(() => {
      setShowDeleteModal(false);
      setIsClosingDeleteModal(false);
    }, MODAL_ANIM_MS);
  };

  useEffect(() => {
    const url = new URL(window.location.href);
    const tokenFromQuery = url.searchParams.get("token");
    if (tokenFromQuery) {
      setToken(tokenFromQuery);
      setLocalToken(tokenFromQuery);
      window.history.replaceState({}, "", "/chat");
      return;
    }
    setLocalToken(getToken());
  }, []);

  useEffect(() => {
    if (!token) return;
    const boot = async () => {
      try {
        setLoading(true);
        const [me, userChats, repos, ghStatus] = await Promise.all([
          getMe(token),
          listChats(token),
          getRepositories(token),
          githubStatus(token),
        ]);
        setUser(me);
        setChats(userChats);
        setRepositories(repos);
        setGithubConnected(ghStatus.connected);
        setSelectedRepoId(repos[0]?.github_repo_id ?? "");
        setActiveChatId(userChats[0]?.id ?? null);

        if (!ghStatus.connected) {
          setGithubBindUrl(await getGithubLoginUrl());
        }

        const personal = userChats
          .filter((item) => item.repository?.full_name?.startsWith("personal/"))
          .map((item) => ({
            id: String(item.id),
            user: { id: -item.id, username: item.title, email: "", avatar_url: null },
          }));
        setPersonalChats(personal);

        const messageResults = await Promise.all(
          userChats.map(async (chat) => {
            try {
              const chatMessages = await listMessages(token, chat.id);
              return [chat.id, chatMessages.at(-1)?.content?.trim() ?? ""] as const;
            } catch {
              return [chat.id, ""] as const;
            }
          }),
        );
        setLastMessageByChat(Object.fromEntries(messageResults));
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (message.includes("401") || message.toLowerCase().includes("unauthorized")) {
          window.location.href = "/";
          return;
        }
        setError("Failed to load workspace.");
      } finally {
        setLoading(false);
      }
    };
    void boot();
  }, [token]);

  useEffect(() => {
    if (!token || !activeChatId) return;
    const loadData = async () => {
      const [msgs, commitsData, participants] = await Promise.all([
        listMessages(token, activeChatId),
        listCommits(token, activeChatId),
        listParticipants(token, activeChatId),
      ]);
      setMessages(msgs);
      setCommits(commitsData);
      setParticipantsByChat((prev) => ({ ...prev, [activeChatId]: participants }));
      setLastMessageByChat((prev) => ({ ...prev, [activeChatId]: msgs.at(-1)?.content?.trim() ?? prev[activeChatId] ?? "" }));
    };
    void loadData();
  }, [activeChatId, token]);

  useEffect(() => {
    if (!contextMenu) return;
    const close = () => setContextMenu(null);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("click", close);
    window.addEventListener("scroll", close, true);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("click", close);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [contextMenu]);

  useEffect(() => {
    if (!token || userQuery.trim().length < 2 || (!showCreateProjectModal && !showPersonalModal)) {
      setUserResults([]);
      return;
    }
    const timer = window.setTimeout(async () => {
      try {
        setUserResults(await searchUsers(token, userQuery.trim()));
      } catch {
        setUserResults([]);
      }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [showCreateProjectModal, showPersonalModal, token, userQuery]);

  useEffect(() => {
    if (!token || !activeChatId) return;
    const socket = new WebSocket(`${API_BASE_URL.replace("http", "ws")}/ws/chat/${activeChatId}?token=${token}`);
    socketRef.current = socket;
    socket.onmessage = (event) => {
      const payload = JSON.parse(event.data) as Message;
      setMessages((prev) => [...prev, payload]);
      setLastMessageByChat((prev) => ({ ...prev, [payload.chat_id]: payload.content }));
    };
    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, [activeChatId, token]);

  const filteredProjectChats = useMemo(() => {
    const q = chatSearchQuery.trim().toLowerCase();
    if (!q) return chats;
    return chats.filter((chat) => {
      const title = chat.title.toLowerCase();
      const repo = (chat.repository?.full_name ?? "").toLowerCase();
      return title.includes(q) || repo.includes(q);
    });
  }, [chatSearchQuery, chats]);

  const filteredPersonalChats = useMemo(() => {
    const q = chatSearchQuery.trim().toLowerCase();
    if (!q) return personalChats;
    return personalChats.filter((chat) => chat.user.username.toLowerCase().includes(q) || chat.user.email.toLowerCase().includes(q));
  }, [chatSearchQuery, personalChats]);

  const activeChat = chats.find((chat) => chat.id === activeChatId) ?? null;
  const activeParticipants = activeChatId ? participantsByChat[activeChatId] ?? [] : [];
  const createChatUserRows = Math.max(userResults.length, 1);
  const createChatUsersHeight = createChatUserRows * 62;

  const initials = (value: string) => value.split(" ").filter(Boolean).map((part) => part[0]?.toUpperCase()).join("").slice(0, 2);
  const shorten = (value: string, max = 15) => (value.length > max ? `${value.slice(0, max)}...` : value);
  const formatPreview = (chat: Chat) => {
    const latest = lastMessageByChat[chat.id] ?? "";
    if (!latest) return "Нет сообщений";
    return latest.length > 42 ? `${latest.slice(0, 42)}...` : latest;
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !activeChatId || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
    socketRef.current.send(JSON.stringify({ content: newMessage }));
    setNewMessage("");
  };

  const onCreateProjectChat = async () => {
    if (!token) return;
    if (!chatTitleInput.trim() && selectedUserIds.length === 0) {
      setCreateChatValidationError("Введите название или пользователя");
      return;
    }
    if (includeProject && (!selectedRepoId || !githubConnected)) return;
    setCreateChatValidationError("");
    const selectedRepo = repositories.find((item) => item.github_repo_id === selectedRepoId);
    const fallbackTitle = chatTitleInput.trim() || selectedRepo?.full_name.split("/").at(-1) || "chat";
    const repo = includeProject && selectedRepo
      ? selectedRepo
      : {
          github_repo_id: `no-project:${Date.now()}`,
          full_name: `chat/${fallbackTitle}`,
          html_url: "#",
          default_branch: "none",
        };
    const title = fallbackTitle;
    const created = await createChat(token, { title, ...repo, participant_ids: selectedUserIds });
    const fresh = await listChats(token);
    setChats(fresh);
    setActiveChatId(created.id);
    setShowCreateProjectModal(false);
    setSelectedUserIds([]);
    setUserQuery("");
    setChatTitleInput("");
    setIncludeProject(true);
  };

  const startPersonalChat = async (targetUser: User) => {
    if (!token) return;
    const chat = await createPersonalChat(token, targetUser.id);
    setPersonalChats((prev) => (prev.some((item) => item.id === String(chat.id)) ? prev : [{ id: String(chat.id), user: targetUser }, ...prev]));
    setChats((prev) => (prev.some((item) => item.id === chat.id) ? prev : [chat, ...prev]));
    setActiveTab("personal");
    setActivePersonalChatId(String(chat.id));
    setActiveChatId(chat.id);
    closePersonalModal();
    setUserQuery("");
  };

  const onDeleteChat = async () => {
    const id = Number(deleteTargetId);
    if (!id || !token) return;
    await deleteChat(token, id);
    setChats((prev) => prev.filter((chat) => chat.id !== id));
    setPersonalChats((prev) => prev.filter((chat) => Number(chat.id) !== id));
    closeDeleteModal();
    setDeleteTargetId("");
    if (activeChatId === id) setActiveChatId(null);
  };

  const onDeleteMessage = async (message: Message) => {
    if (!token || !activeChatId) return;
    try {
      await deleteMessage(token, activeChatId, message.id);
      setMessages((prev) => prev.filter((item) => item.id !== message.id));
    } catch {
      setError("Не удалось удалить сообщение");
    }
  };

  if (!token) return <main className="center-screen"><div className="panel">Auth token missing. Login first.</div></main>;
  if (loading) return <main className="center-screen"><div className="chat-loader" /></main>;

  return (
    <main className="chat-layout messenger-shell">
      <aside className="col left messenger-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo" aria-label="Messages logo">
            <svg width="98" height="97" viewBox="0 0 98 97" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M6.66957 4.5H88.2656L74.1277 23.4231H30.906M6.66957 4.5L30.906 23.4231M6.66957 4.5L6.26562 28.8032L29.0883 45.5L6.66957 65.1652L29.0883 86.5V67.2059L54.3346 45.5L30.906 23.4231"
                stroke="currentColor"
                strokeWidth="9"
              />
            </svg>
          </div>
          <div className="sidebar-header-actions">
            <button className="compose-icon-btn" onClick={() => (activeTab === "projects" ? setShowCreateProjectModal(true) : setShowPersonalModal(true))}>
              <SquarePen size={20} />
            </button>
            <button className="compose-icon-btn danger" onClick={() => { setDeleteTargetId(String(activeChatId ?? "")); setShowDeleteModal(true); }}>
              <Trash2 size={20} />
            </button>
          </div>
        </div>
        <div className="sidebar-search">
          <input placeholder="Search conversations..." value={chatSearchQuery} onChange={(e) => setChatSearchQuery(e.target.value)} />
        </div>
        <div className="tabs-inline">
          <button className={`tab-pill ${activeTab === "projects" ? "active" : ""}`} onClick={() => setActiveTab("projects")}>Projects</button>
          <button className={`tab-pill ${activeTab === "personal" ? "active" : ""}`} onClick={() => setActiveTab("personal")}>Personal</button>
        </div>
        <div className="conversation-list">
          {activeTab === "projects" && filteredProjectChats.map((chat) => (
            <button
              className={`conversation-item ${chat.id === activeChatId ? "active" : ""}`}
              key={chat.id}
              onClick={() => setActiveChatId(chat.id)}
              onContextMenu={(event) => {
                event.preventDefault();
                setContextMenu({ x: event.clientX, y: event.clientY, type: "chat", chat });
              }}
            >
              <div className="conversation-left">
                <span className="conversation-avatar">{initials(chat.title)}</span>
                <div className="conversation-meta">
                  <strong>{shorten(chat.title, 15)}</strong>
                  <p>{formatPreview(chat)}</p>
                </div>
              </div>
            </button>
          ))}
          {activeTab === "projects" && filteredProjectChats.length === 0 && <p className="muted small">Таких чатов нет</p>}

          {activeTab === "personal" && filteredPersonalChats.map((chat) => (
            <button
              className={`conversation-item ${chat.id === activePersonalChatId ? "active" : ""}`}
              key={chat.id}
              onClick={() => { setActivePersonalChatId(chat.id); setActiveChatId(Number(chat.id)); }}
            >
              <div className="conversation-left">
                <span className="conversation-avatar">{initials(chat.user.username)}</span>
                <div className="conversation-meta">
                  <strong>{shorten(chat.user.username, 15)}</strong>
                  <p>{lastMessageByChat[Number(chat.id)] ?? "Start personal conversation"}</p>
                </div>
              </div>
            </button>
          ))}
          {activeTab === "personal" && filteredPersonalChats.length === 0 && <p className="muted small">Таких чатов нет</p>}

          {activeTab === "projects" && !githubConnected && (
            <a href={githubBindUrl} className="github-bind-banner">
              <svg viewBox="0 0 16 16" width="28" height="28" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38v-1.32c-2.22.48-2.69-1.07-2.69-1.07-.36-.92-.89-1.16-.89-1.16-.73-.5.05-.49.05-.49.8.06 1.22.82 1.22.82.72 1.2 1.87.86 2.33.66.07-.52.28-.86.5-1.06-1.77-.2-3.63-.88-3.63-3.95 0-.88.31-1.6.82-2.16-.08-.2-.36-1 .08-2.08 0 0 .67-.22 2.2.82a7.48 7.48 0 0 1 4 0c1.52-1.04 2.2-.82 2.2-.82.44 1.08.16 1.88.08 2.08.5.56.82 1.28.82 2.16 0 3.08-1.86 3.74-3.64 3.94.28.24.54.72.54 1.46v2.16c0 .21.14.46.55.38A8 8 0 0 0 16 8c0-4.42-3.58-8-8-8Z" /></svg>
              <span>Привязать GitHub</span>
            </a>
          )}
        </div>
        <div className="sidebar-bottom-actions">
          <Link href="/settings" className="compose-icon-btn settings-link" title="Settings">
            <svg
              xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </Link>
        </div>
      </aside>

      <section className="col center messenger-center">
        <header className="chat-topbar">
          <div>
            <h2>{activeChat?.title ?? "No chat selected"}</h2>
            <p>● Active now</p>
          </div>
          <div className="topbar-icons">
            <button type="button" className="icon-btn" onClick={() => (activeTab === "projects" ? setShowCreateProjectModal(true) : setShowPersonalModal(true))}>+</button>
            <button type="button" className="icon-btn" onClick={() => setIsRightPanelVisible((prev) => !prev)} title={isRightPanelVisible ? "Hide right panel" : "Show right panel"}>
              <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><path d="M3 3h10v10H3zM2 2v12h12V2z" /></svg>
            </button>
          </div>
        </header>

        <div className="messages thread">
          {messages.map((message) => (
            <article
              key={message.id}
              className={`message-bubble ${message.user_id === user?.id ? "own" : ""}`}
              onContextMenu={(event) => {
                event.preventDefault();
                setContextMenu({ x: event.clientX, y: event.clientY, type: "message", message });
              }}
            >
              <p>{message.content}</p>
              <time>{new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</time>
            </article>
          ))}
        </div>
        <footer className="composer chat-composer">
          <input className="field" placeholder="Write message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} />
          <button className="send-orb" onClick={sendMessage}>➤</button>
        </footer>
      </section>

      <aside className={`col right messenger-profile ${isRightPanelVisible ? "panel-open" : "panel-closed"}`}>
          <div className="profile-card">
            <span className="profile-avatar">{initials(user?.username ?? "U")}</span>
            <h3>{user?.username ?? "User"}</h3>
            <p>Senior Backend Engineer</p>
          </div>
          <div className="activity-card">
            <div className="activity-head"><h4>RECENT ACTIVITY</h4></div>
            <div className="activity-list">
            <CommitTimeline commits={commits.slice(0, 12)} branchName={activeChat?.repository?.default_branch ?? "main"} />
            </div>
            <div className="participants-box">
              <h4>PARTICIPANTS</h4>
              {activeParticipants.map((member) => (
                <div key={member.id} className="participant-row">
                  <span className="conversation-avatar">{initials(member.username)}</span>
                  <div><strong>{member.username}</strong><p>{member.email}</p></div>
                </div>
              ))}
            </div>
          </div>
        </aside>

      {showCreateProjectModal && (
        <div className={`modal-overlay ${isClosingCreateModal ? "closing" : ""}`} onClick={closeCreateModal}>
          <div className="add-user-modal create-chat-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-container create-chat-form">
              <p className="modal-title">Создать чат</p>
              <input
                className={`field modal-project-select ${createChatValidationError ? "error-field" : ""}`}
                placeholder="Название чата..."
                value={chatTitleInput}
                onChange={(e) => {
                  setChatTitleInput(e.target.value);
                  if (createChatValidationError) setCreateChatValidationError("");
                }}
              />
              <div className={`sidebar-search modal-search ${createChatValidationError ? "error-field" : ""}`}>
                <input
                  placeholder="Поиск пользователей..."
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                />
              </div>
              <div className="modal-container users create-chat-users" style={{ height: `${createChatUsersHeight}px` }}>
                {userResults.map((foundUser) => {
                  const selected = selectedUserIds.includes(foundUser.id);
                  return (
                    <button
                      key={foundUser.id}
                      className={`add-user-item ${selected ? "selected" : ""}`}
                      onClick={() =>
                        setSelectedUserIds((prev) =>
                          prev.includes(foundUser.id)
                            ? prev.filter((id) => id !== foundUser.id)
                            : [...prev, foundUser.id],
                        )
                      }
                    >
                      <span className="conversation-avatar">{initials(foundUser.username)}</span>
                      <div>
                        <strong>{foundUser.username}</strong>
                        <p>{foundUser.email}</p>
                      </div>
                      <span className={`user-pick-check ${selected ? "active" : ""}`}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      </span>
                    </button>
                  );
                })}
                {userResults.length === 0 && userQuery.trim().length < 2 && (
                  <p className="muted small create-chat-empty">Выберите пользователя</p>
                )}
                {userResults.length === 0 && userQuery.trim().length >= 2 && (
                  <p className="muted small create-chat-empty">Нет таких пользователей</p>
                )}
              </div>
              {createChatValidationError && <p className="create-chat-validation">{createChatValidationError}</p>}
              <button
                className={`project-toggle ${includeProject ? "active" : ""}`}
                onClick={() => setIncludeProject((prev) => !prev)}
              >
                <span>Добавить проект</span>
                <span className={`user-pick-check ${includeProject ? "active" : ""}`}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </span>
              </button>
              {includeProject && (
                <select className="field modal-project-select" value={selectedRepoId} onChange={(e) => setSelectedRepoId(e.target.value)}>
                  {repositories.map((repo) => (
                    <option key={repo.github_repo_id} value={repo.github_repo_id}>
                      {repo.full_name}
                    </option>
                  ))}
                </select>
              )}
              <div className="create-chat-actions">
                <button
                  className="btn primary create-chat-btn"
                  onClick={onCreateProjectChat}
                  disabled={includeProject && (!selectedRepoId || !githubConnected)}
                >
                  Создать
                </button>
                <button
                  className="btn ghost create-chat-btn"
                  onClick={() => {
                    closeCreateModal();
                    setSelectedUserIds([]);
                    setUserQuery("");
                    setChatTitleInput("");
                    setCreateChatValidationError("");
                    setIncludeProject(true);
                  }}
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPersonalModal && (
        <div className={`modal-overlay ${isClosingPersonalModal ? "closing" : ""}`} onClick={closePersonalModal}>
          <div className="add-user-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-container">
              <p className="modal-title">Личные сообщения</p>
              <input className="field" placeholder="Search user by username/email..." value={userQuery} onChange={(e) => setUserQuery(e.target.value)} />
            </div>
            <div className="modal-container users">
              {userResults.map((foundUser) => (
                <button key={foundUser.id} className="add-user-item" onClick={() => startPersonalChat(foundUser)}>
                  <span className="conversation-avatar">{initials(foundUser.username)}</span>
                  <div><strong>{foundUser.username}</strong><p>{foundUser.email}</p></div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className={`modal-overlay ${isClosingDeleteModal ? "closing" : ""}`} onClick={closeDeleteModal}>
          <div className="add-user-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-container">
              <p className="modal-title">Удалить чат</p>
              <select className="field" value={deleteTargetId} onChange={(e) => setDeleteTargetId(e.target.value)}>
                {chats.map((chat) => <option key={chat.id} value={String(chat.id)}>{chat.title}</option>)}
              </select>
              <button className="btn danger" onClick={onDeleteChat} disabled={!deleteTargetId}>Удалить</button>
            </div>
          </div>
        </div>
      )}
      {contextMenu && (
        <div
          className="context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(event) => event.stopPropagation()}
        >
          <button
            className="context-menu-item"
            onClick={async () => {
              if (contextMenu.type === "message") {
                await navigator.clipboard.writeText(contextMenu.message.content);
              } else {
                await navigator.clipboard.writeText(contextMenu.chat.title);
              }
              setContextMenu(null);
            }}
          >
            Копировать
          </button>
          <button
            className="context-menu-item danger"
            onClick={async () => {
              if (contextMenu.type === "message") {
                await onDeleteMessage(contextMenu.message);
              } else {
                if (!token) return;
                await deleteChat(token, contextMenu.chat.id);
                setChats((prev) => prev.filter((chat) => chat.id !== contextMenu.chat.id));
                if (activeChatId === contextMenu.chat.id) setActiveChatId(null);
              }
              setContextMenu(null);
            }}
          >
            Удалить
          </button>
        </div>
      )}
      {error && <div className="error-banner">{error}</div>}
    </main>
  );
}
