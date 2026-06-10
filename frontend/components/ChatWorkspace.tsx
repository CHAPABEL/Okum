"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronLeft, Search, SquarePen, X } from "lucide-react";
import { CommitTimeline } from "@/components/commits/CommitTimeline";

import {
  addChatParticipants,
  createChat,
  createPersonalChat,
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
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [mobileView, setMobileView] = useState<"list" | "chat" | "right">("list");
  const [authChecked, setAuthChecked] = useState(false);
  const [token, setLocalToken] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
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
  const [isClosingCreateModal, setIsClosingCreateModal] = useState(false);
  const [isClosingPersonalModal, setIsClosingPersonalModal] = useState(false);
  const [showAddParticipantsModal, setShowAddParticipantsModal] = useState(false);
  const [isClosingAddParticipantsModal, setIsClosingAddParticipantsModal] = useState(false);
  const [participantSearchQuery, setParticipantSearchQuery] = useState("");
  const [participantSearchResults, setParticipantSearchResults] = useState<User[]>([]);
  const [userQuery, setUserQuery] = useState("");
  const [userResults, setUserResults] = useState<User[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [selectedRepoId, setSelectedRepoId] = useState("");
  const [includeProject, setIncludeProject] = useState(true);
  const [chatTitleInput, setChatTitleInput] = useState("");
  const [createChatValidationError, setCreateChatValidationError] = useState("");
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(null);
  const [activitySectionOpen, setActivitySectionOpen] = useState(true);
  const [participantsSectionOpen, setParticipantsSectionOpen] = useState(true);
  const [exitingMessageIds, setExitingMessageIds] = useState<number[]>([]);

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

  const closeAddParticipantsModal = useCallback(() => {
    setIsClosingAddParticipantsModal(true);
    window.setTimeout(() => {
      setShowAddParticipantsModal(false);
      setIsClosingAddParticipantsModal(false);
      setParticipantSearchQuery("");
      setParticipantSearchResults([]);
    }, MODAL_ANIM_MS);
  }, []);

  useEffect(() => {
    const syncMobile = () => {
      const mobile = window.innerWidth <= 900;
      setIsMobile(mobile);
      if (!mobile) {
        setMobileView("chat");
      } else if (!activeChatId) {
        setMobileView("list");
      }
    };
    syncMobile();
    window.addEventListener("resize", syncMobile);
    return () => window.removeEventListener("resize", syncMobile);
  }, [activeChatId]);

  useEffect(() => {
    const url = new URL(window.location.href);
    const tokenFromQuery = url.searchParams.get("token");
    if (tokenFromQuery) {
      setToken(tokenFromQuery);
      setLocalToken(tokenFromQuery);
      window.history.replaceState({}, "", "/chat");
      setAuthChecked(true);
      return;
    }
    setLocalToken(getToken());
    setAuthChecked(true);
  }, []);

  useEffect(() => {
    if (!authChecked) return;
    if (!token) {
      router.replace("/login");
    }
  }, [authChecked, token, router]);

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
        if (me.needs_username) {
          router.replace("/register");
          return;
        }
        setUser(me);
        setChats(userChats);
        setRepositories(repos);
        setGithubConnected(ghStatus.connected);
        setSelectedRepoId(repos[0]?.github_repo_id ?? "");
        setActiveChatId(null);

        if (!ghStatus.connected) {
          setGithubBindUrl(await getGithubLoginUrl());
        }

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
          router.replace("/");
          return;
        }
        setError("Не удалось загрузить рабочее пространство.");
      } finally {
        setLoading(false);
      }
    };
    void boot();
  }, [token]);

  useEffect(() => {
    setExitingMessageIds([]);
  }, [activeChatId]);

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
    if (!token || !showAddParticipantsModal || participantSearchQuery.trim().length < 2) {
      setParticipantSearchResults([]);
      return;
    }
    const timer = window.setTimeout(async () => {
      try {
        setParticipantSearchResults(await searchUsers(token, participantSearchQuery.trim()));
      } catch {
        setParticipantSearchResults([]);
      }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [token, showAddParticipantsModal, participantSearchQuery]);

  useEffect(() => {
    if (!showAddParticipantsModal) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeAddParticipantsModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showAddParticipantsModal, closeAddParticipantsModal]);

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
    const githubProjectChats = chats.filter((chat) => {
      const repoId = chat.repository?.github_repo_id ?? "";
      const repoFullName = chat.repository?.full_name ?? "";
      return Boolean(repoId) && !repoId.startsWith("no-project:") && !repoFullName.startsWith("personal/");
    });
    if (!q) return githubProjectChats;
    return githubProjectChats.filter((chat) => {
      const title = chat.title.toLowerCase();
      const repo = (chat.repository?.full_name ?? "").toLowerCase();
      return title.includes(q) || repo.includes(q);
    });
  }, [chatSearchQuery, chats]);

  const filteredPersonalChats = useMemo(() => {
    const q = chatSearchQuery.trim().toLowerCase();
    const nonProjectChats = chats.filter((chat) => {
      const repoId = chat.repository?.github_repo_id ?? "";
      const repoFullName = chat.repository?.full_name ?? "";
      return repoId.startsWith("no-project:") || repoFullName.startsWith("personal/");
    });
    if (!q) return nonProjectChats;
    return nonProjectChats.filter((chat) => {
      const title = chat.title.toLowerCase();
      const repo = (chat.repository?.full_name ?? "").toLowerCase();
      return title.includes(q) || repo.includes(q);
    });
  }, [chatSearchQuery, chats]);

  const activeChat = chats.find((chat) => chat.id === activeChatId) ?? null;
  const hasActiveChat = activeChatId !== null;
  const activeParticipants = activeChatId ? participantsByChat[activeChatId] ?? [] : [];
  const rightPanelOpen = hasActiveChat && (isMobile ? mobileView === "right" : isRightPanelVisible);

  const handleAddParticipant = async (target: User) => {
    if (!token || !activeChatId) return;
    if (activeParticipants.some((p) => p.id === target.id)) return;
    try {
      await addChatParticipants(token, activeChatId, [target.id]);
      const list = await listParticipants(token, activeChatId);
      setParticipantsByChat((prev) => ({ ...prev, [activeChatId]: list }));
    } catch {
      setError("Не удалось добавить участника");
    }
  };
  const initials = (value: string) => value.split(" ").filter(Boolean).map((part) => part[0]?.toUpperCase()).join("").slice(0, 2);
  const shorten = (value: string, max = 15) => (value.length > max ? `${value.slice(0, max)}...` : value);
  const getMessageAuthorName = (message: Message) => {
    const author = activeParticipants.find((member) => member.id === message.user_id);
    return author?.username ?? "Неизвестный пользователь";
  };
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
    const fallbackTitle = chatTitleInput.trim() || selectedRepo?.full_name.split("/").at(-1) || "чат";
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
    if (!includeProject) {
      setActiveTab("personal");
      if (isMobile) setMobileView("chat");
    }
    setShowCreateProjectModal(false);
    setSelectedUserIds([]);
    setUserQuery("");
    setChatTitleInput("");
    setIncludeProject(true);
  };

  const startPersonalChat = async (targetUser: User) => {
    if (!token) return;
    const chat = await createPersonalChat(token, targetUser.id);
    setChats((prev) => (prev.some((item) => item.id === chat.id) ? prev : [chat, ...prev]));
    setActiveTab("personal");
    setActiveChatId(chat.id);
    closePersonalModal();
    setUserQuery("");
  };

  const onDeleteMessage = async (message: Message) => {
    if (!token || !activeChatId) return;
    try {
      await deleteMessage(token, activeChatId, message.id);
      setExitingMessageIds((prev) => (prev.includes(message.id) ? prev : [...prev, message.id]));
      window.setTimeout(() => {
        setMessages((prev) => prev.filter((item) => item.id !== message.id));
        setExitingMessageIds((prev) => prev.filter((id) => id !== message.id));
      }, 320);
    } catch {
      setError("Не удалось удалить сообщение");
    }
  };

  if (!authChecked || !token) return <main className="center-screen"><div className="chat-loader" /></main>;
  if (loading) return <main className="center-screen"><div className="chat-loader" /></main>;

  return (
    <main className="chat-layout messenger-shell">
      <aside className={`col left messenger-sidebar ${isMobile && mobileView !== "list" ? "mobile-hidden" : ""}`}>
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
          </div>
        </div>
        <div className="sidebar-search">
          <input placeholder="Поиск чатов..." value={chatSearchQuery} onChange={(e) => setChatSearchQuery(e.target.value)} />
        </div>
        <div className="tabs-inline">
          <button className={`tab-pill ${activeTab === "projects" ? "active" : ""}`} onClick={() => setActiveTab("projects")}>Проекты</button>
          <button className={`tab-pill ${activeTab === "personal" ? "active" : ""}`} onClick={() => setActiveTab("personal")}>Личные</button>
        </div>
        <div className="conversation-list">
          {activeTab === "projects" && filteredProjectChats.map((chat) => (
            <button
              className={`conversation-item ${chat.id === activeChatId ? "active" : ""}`}
              key={chat.id}
              onClick={() => {
                setActiveChatId(chat.id);
                if (isMobile) setMobileView("chat");
              }}
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
              className={`conversation-item ${chat.id === activeChatId ? "active" : ""}`}
              key={chat.id}
              onClick={() => {
                setActiveChatId(chat.id);
                if (isMobile) setMobileView("chat");
              }}
            >
              <div className="conversation-left">
                <span className="conversation-avatar">{initials(chat.title)}</span>
                <div className="conversation-meta">
                  <strong>{shorten(chat.title, 15)}</strong>
                  <p>{lastMessageByChat[chat.id] ?? "Начните личный диалог"}</p>
                </div>
              </div>
            </button>
          ))}
          {activeTab === "personal" && filteredPersonalChats.length === 0 && <p className="muted small">Таких чатов нет</p>}
        </div>
        <div className="sidebar-bottom-actions">
          {!githubConnected && githubBindUrl && (
            <a href={githubBindUrl} className="github-bind-compact" aria-label="Авторизация GitHub">
              <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38v-1.32c-2.22.48-2.69-1.07-2.69-1.07-.36-.92-.89-1.16-.89-1.16-.73-.5.05-.49.05-.49.8.06 1.22.82 1.22.82.72 1.2 1.87.86 2.33.66.07-.52.28-.86.5-1.06-1.77-.2-3.63-.88-3.63-3.95 0-.88.31-1.6.82-2.16-.08-.2-.36-1 .08-2.08 0 0 .67-.22 2.2.82a7.48 7.48 0 0 1 4 0c1.52-1.04 2.2-.82 2.2-.82.44 1.08.16 1.88.08 2.08.5.56.82 1.28.82 2.16 0 3.08-1.86 3.74-3.64 3.94.28.24.54.72.54 1.46v2.16c0 .21.14.46.55.38A8 8 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
              </svg>
              <span className="github-bind-compact-label">Авторизация GitHub</span>
            </a>
          )}
          <Link href="/settings" className="compose-icon-btn settings-link" title="Настройки">
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

      {!hasActiveChat ? (
        <section className={`messenger-empty ${isMobile ? "mobile-hidden" : ""}`}>
          <div className="messenger-empty-content">
            <svg viewBox="0 0 96 96" fill="none" aria-hidden="true">
              <rect x="12" y="20" width="56" height="40" rx="10" stroke="currentColor" strokeWidth="3" />
              <path d="M28 60L20 76V60H12" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
              <rect x="36" y="32" width="56" height="40" rx="10" stroke="currentColor" strokeWidth="3" opacity="0.55" />
              <circle cx="52" cy="52" r="3" fill="currentColor" />
              <circle cx="64" cy="52" r="3" fill="currentColor" />
              <circle cx="76" cy="52" r="3" fill="currentColor" />
            </svg>
            <h2>Чат не выбран</h2>
            <p className="muted small">Выберите чат в списке слева</p>
          </div>
        </section>
      ) : (
        <div className="messenger-chat-area messenger-chat-area-enter" key={activeChatId}>
      <section className={`col center messenger-center ${isMobile && mobileView !== "chat" ? "mobile-hidden" : ""}`}>
        <header className="chat-topbar">
          <div className="chat-topbar-title-row">
            {isMobile && (
              <div className="chat-topbar-arrow-wrap">
                <button
                  type="button"
                  className="mobile-top-arrow"
                  onClick={() => setMobileView("list")}
                  title="К списку чатов"
                >
                  <ChevronLeft size={18} />
                </button>
              </div>
            )}
            <div className="chat-topbar-text-wrap">
              <h2>{activeChat?.title ?? "Чат не выбран"}</h2>
            </div>
          </div>
          <div className="topbar-icons">
            <button
              type="button"
              className="icon-btn"
              title={activeChatId ? "Добавить участников" : "Выберите чат"}
              disabled={!activeChatId}
              onClick={() => {
                if (!activeChatId) return;
                setShowAddParticipantsModal(true);
              }}
            >
              +
            </button>
            {!isMobile && (
              <button type="button" className="icon-btn" onClick={() => setIsRightPanelVisible((prev) => !prev)} title={isRightPanelVisible ? "Скрыть правую панель" : "Показать правую панель"}>
                <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><path d="M3 3h10v10H3zM2 2v12h12V2z" /></svg>
              </button>
            )}
            {isMobile && (
              <button
                type="button"
                className="icon-btn mobile-right-toggle"
                onClick={() => {
                  setIsRightPanelVisible(true);
                  setMobileView("right");
                }}
                title="Показать правую панель"
              >
                →
              </button>
            )}
          </div>
        </header>

        <div className="messages thread">
          {messages.map((message) => {
            const isOwn = message.user_id === user?.id;
            return (
              <div key={message.id} className={`message-item ${isOwn ? "own" : ""}`}>
                {!isOwn && <span className="message-author">{getMessageAuthorName(message)}</span>}
                <article
                  className={`message-bubble ${isOwn ? "own" : ""} ${exitingMessageIds.includes(message.id) ? "message-exiting" : ""}`}
                  onContextMenu={(event) => {
                    event.preventDefault();
                    setContextMenu({ x: event.clientX, y: event.clientY, type: "message", message });
                  }}
                >
                  <p>{message.content}</p>
                  <time>{new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</time>
                </article>
              </div>
            );
          })}
        </div>
        <footer className="composer chat-composer">
          <input className="field" placeholder="Напишите сообщение..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} />
          <button className="send-orb" onClick={sendMessage}>➤</button>
        </footer>
      </section>

      <aside className={`col right messenger-profile panel-enter ${rightPanelOpen ? "panel-open" : "panel-closed"} ${isMobile && mobileView !== "right" ? "mobile-hidden" : ""} ${isMobile && mobileView === "right" ? "mobile-right-active" : ""}`}>
          <div className="profile-card">
            {isMobile && (
              <button
                type="button"
                className="mobile-top-arrow mobile-top-arrow-right"
                onClick={() => setMobileView("chat")}
                title="Назад к чату"
              >
                <ChevronLeft size={18} />
              </button>
            )}
            <span className="profile-avatar">{initials(user?.username ?? "U")}</span>
            <h3>{user?.username ?? "Пользователь"}</h3>
            <p>Участник команды</p>
          </div>
          <div className="activity-card">
            <div className={`profile-sidebar-section ${activitySectionOpen ? "" : "collapsed"}`}>
              <div className="activity-head">
                <h4>ПОСЛЕДНЯЯ АКТИВНОСТЬ</h4>
                <button
                  type="button"
                  className="section-toggle-btn"
                  aria-expanded={activitySectionOpen}
                  aria-label={activitySectionOpen ? "Свернуть активность" : "Развернуть активность"}
                  onClick={() => setActivitySectionOpen((v) => !v)}
                >
                  <span className="section-toggle-icon-wrap">
                    <Check size={14} strokeWidth={2.5} />
                  </span>
                </button>
              </div>
              <div className="profile-section-collapse">
                <div className="profile-section-collapse-inner">
                  <div className="activity-list">
                    <CommitTimeline commits={commits.slice(0, 12)} branchName={activeChat?.repository?.default_branch ?? "main"} />
                  </div>
                </div>
              </div>
            </div>
            <div className={`participants-box profile-sidebar-section ${participantsSectionOpen ? "" : "collapsed"}`}>
              <div className="participants-head">
                <h4>УЧАСТНИКИ</h4>
                <button
                  type="button"
                  className="section-toggle-btn"
                  aria-expanded={participantsSectionOpen}
                  aria-label={participantsSectionOpen ? "Свернуть участников" : "Развернуть участников"}
                  onClick={() => setParticipantsSectionOpen((v) => !v)}
                >
                  <span className="section-toggle-icon-wrap">
                    <Check size={14} strokeWidth={2.5} />
                  </span>
                </button>
              </div>
              <div className="profile-section-collapse">
                <div className="profile-section-collapse-inner">
                  <div className="participants-list-inner">
                    {activeParticipants.map((member) => (
                      <div key={member.id} className="participant-row">
                        <span className="conversation-avatar">{initials(member.username)}</span>
                        <div><strong>{member.username}</strong><p>{member.email}</p></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>
        </div>
      )}

      {showAddParticipantsModal && (
        <div className={`modal-overlay ${isClosingAddParticipantsModal ? "closing" : ""}`} onClick={closeAddParticipantsModal}>
          <div className="add-user-modal theme-modal add-participants-modal" onClick={(e) => e.stopPropagation()}>
            <p className="modal-title">Добавить участников</p>
            <p className="muted small modal-subtitle">Поиск по имени или email — минимум 2 символа</p>
            <div className="sidebar-search modal-search">
              <input
                placeholder="Поиск пользователей..."
                value={participantSearchQuery}
                onChange={(e) => setParticipantSearchQuery(e.target.value)}
              />
            </div>
            <div className="modal-container users">
              {participantSearchResults
                .filter((u) => !activeParticipants.some((p) => p.id === u.id))
                .map((foundUser) => (
                  <button key={foundUser.id} type="button" className="add-user-item" onClick={() => void handleAddParticipant(foundUser)}>
                    <span className="conversation-avatar">{initials(foundUser.username)}</span>
                    <div>
                      <strong>{foundUser.username}</strong>
                      <p>{foundUser.email}</p>
                    </div>
                  </button>
                ))}
              {participantSearchQuery.trim().length < 2 && (
                <p className="muted small add-participants-hint">Введите запрос для поиска</p>
              )}
              {participantSearchQuery.trim().length >= 2 && participantSearchResults.filter((u) => !activeParticipants.some((p) => p.id === u.id)).length === 0 && (
                <p className="muted small add-participants-hint">Нет пользователей или все уже в чате</p>
              )}
            </div>
            <div className="create-chat-actions">
              <button type="button" className="btn primary create-chat-btn" onClick={closeAddParticipantsModal}>
                Готово
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreateProjectModal && (
        <div className={`modal-overlay ${isClosingCreateModal ? "closing" : ""}`} onClick={closeCreateModal}>
          <div className="add-user-modal theme-modal create-chat-modal" onClick={(e) => e.stopPropagation()}>
            <header className="create-chat-header">
              <div className="create-chat-header-text">
                <p className="create-chat-eyebrow">Новый чат</p>
                <h2 className="create-chat-title">Проектный чат</h2>
                <p className="create-chat-subtitle">Название, участники и репозиторий GitHub</p>
              </div>
              <button
                type="button"
                className="create-chat-close"
                aria-label="Закрыть"
                onClick={() => {
                  closeCreateModal();
                  setSelectedUserIds([]);
                  setUserQuery("");
                  setChatTitleInput("");
                  setCreateChatValidationError("");
                  setIncludeProject(true);
                }}
              >
                <X size={18} />
              </button>
            </header>

            <div className="create-chat-body">
              <section className="create-chat-section">
                <label className="create-chat-label">Название чата</label>
                <input
                  className={`field create-chat-input ${createChatValidationError ? "error-field" : ""}`}
                  placeholder="Например, Backend API"
                  value={chatTitleInput}
                  onChange={(e) => {
                    setChatTitleInput(e.target.value);
                    if (createChatValidationError) setCreateChatValidationError("");
                  }}
                />
              </section>

              <section className="create-chat-section create-chat-section-grow">
                <div className="create-chat-section-head">
                  <label className="create-chat-label">Участники</label>
                  {selectedUserIds.length > 0 && (
                    <span className="create-chat-pill">{selectedUserIds.length} выбрано</span>
                  )}
                </div>
                <div className={`create-chat-search ${createChatValidationError ? "error-field" : ""}`}>
                  <Search size={16} aria-hidden="true" />
                  <input
                    placeholder="Поиск по имени или почте (от 2 символов)"
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                  />
                </div>
                <div className="create-chat-users">
                  {userResults.map((foundUser) => {
                    const selected = selectedUserIds.includes(foundUser.id);
                    return (
                      <button
                        key={foundUser.id}
                        type="button"
                        className={`create-chat-user-row ${selected ? "selected" : ""}`}
                        onClick={() =>
                          setSelectedUserIds((prev) =>
                            prev.includes(foundUser.id)
                              ? prev.filter((id) => id !== foundUser.id)
                              : [...prev, foundUser.id],
                          )
                        }
                      >
                        <span className="conversation-avatar">{initials(foundUser.username)}</span>
                        <div className="create-chat-user-meta">
                          <strong>{foundUser.username}</strong>
                          <p>{foundUser.email}</p>
                        </div>
                        <span className={`user-pick-check ${selected ? "active" : ""}`}>
                          <Check size={14} strokeWidth={2.5} />
                        </span>
                      </button>
                    );
                  })}
                  {userResults.length === 0 && userQuery.trim().length < 2 && (
                    <p className="create-chat-empty">Начните вводить имя или email</p>
                  )}
                  {userResults.length === 0 && userQuery.trim().length >= 2 && (
                    <p className="create-chat-empty">Пользователи не найдены</p>
                  )}
                </div>
              </section>

              <section className="create-chat-section">
                <button
                  type="button"
                  className={`create-chat-toggle ${includeProject ? "active" : ""}`}
                  onClick={() => setIncludeProject((prev) => !prev)}
                >
                  <span className="create-chat-toggle-text">
                    <strong>Привязать GitHub-репозиторий</strong>
                    <small>Коммиты и активность проекта в правой панели</small>
                  </span>
                  <span className={`create-chat-switch ${includeProject ? "on" : ""}`} aria-hidden="true" />
                </button>
                {includeProject && (
                  <select
                    className="field create-chat-input create-chat-repo-select"
                    value={selectedRepoId}
                    onChange={(e) => setSelectedRepoId(e.target.value)}
                  >
                    {repositories.map((repo) => (
                      <option key={repo.github_repo_id} value={repo.github_repo_id}>
                        {repo.full_name}
                      </option>
                    ))}
                  </select>
                )}
                {includeProject && !githubConnected && (
                  <p className="create-chat-hint">Сначала привяжите GitHub в левой панели</p>
                )}
              </section>

              {createChatValidationError && <p className="create-chat-validation">{createChatValidationError}</p>}
            </div>

            <footer className="create-chat-footer">
              <button
                type="button"
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
              <button
                type="button"
                className="btn primary create-chat-btn"
                onClick={() => void onCreateProjectChat()}
                disabled={includeProject && (!selectedRepoId || !githubConnected)}
              >
                Создать чат
              </button>
            </footer>
          </div>
        </div>
      )}

      {showPersonalModal && (
        <div className={`modal-overlay ${isClosingPersonalModal ? "closing" : ""}`} onClick={closePersonalModal}>
          <div className="add-user-modal theme-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-container">
              <p className="modal-title">Личные сообщения</p>
              <input className="field" placeholder="Поиск пользователя по имени или почте..." value={userQuery} onChange={(e) => setUserQuery(e.target.value)} />
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
          {contextMenu.type === "message" && (
            <button
              className="context-menu-item danger"
              onClick={async () => {
                const msg = contextMenu.message;
                setContextMenu(null);
                await onDeleteMessage(msg);
              }}
            >
              Удалить
            </button>
          )}
        </div>
      )}
      {error && <div className="error-banner">{error}</div>}
    </main>
  );
}
