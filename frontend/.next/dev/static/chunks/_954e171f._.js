(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/lib/config.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "API_BASE_URL",
    ()=>API_BASE_URL
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
const API_BASE_URL = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/api.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createChat",
    ()=>createChat,
    "createPersonalChat",
    ()=>createPersonalChat,
    "deleteChat",
    ()=>deleteChat,
    "getGithubLoginUrl",
    ()=>getGithubLoginUrl,
    "getMe",
    ()=>getMe,
    "getRepositories",
    ()=>getRepositories,
    "githubStatus",
    ()=>githubStatus,
    "listChats",
    ()=>listChats,
    "listCommits",
    ()=>listCommits,
    "listMessages",
    ()=>listMessages,
    "listParticipants",
    ()=>listParticipants,
    "loginWithEmail",
    ()=>loginWithEmail,
    "registerWithEmail",
    ()=>registerWithEmail,
    "searchUsers",
    ()=>searchUsers
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/config.ts [app-client] (ecmascript)");
;
async function request(path, token, options) {
    const response = await fetch(`${__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_BASE_URL"]}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...token ? {
                Authorization: `Bearer ${token}`
            } : {},
            ...options?.headers ?? {}
        },
        cache: "no-store"
    });
    if (!response.ok) throw new Error(await response.text());
    return await response.json();
}
async function getGithubLoginUrl() {
    const response = await fetch(`${__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_BASE_URL"]}/auth/github`, {
        cache: "no-store"
    });
    if (!response.ok) throw new Error("Failed to fetch github URL");
    const data = await response.json();
    return data.url;
}
async function loginWithEmail(email, password) {
    const response = await fetch(`${__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_BASE_URL"]}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email,
            password
        })
    });
    if (!response.ok) throw new Error("Failed to login");
    return await response.json();
}
async function registerWithEmail(email, password) {
    const response = await fetch(`${__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_BASE_URL"]}/auth/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email,
            password
        })
    });
    if (!response.ok) throw new Error("Failed to register");
    return await response.json();
}
function getMe(token) {
    return request("/user/me", token);
}
function githubStatus(token) {
    return request("/user/github-status", token);
}
function getRepositories(token) {
    return request("/user/repositories", token);
}
function searchUsers(token, q) {
    return request(`/user/search?q=${encodeURIComponent(q)}`, token);
}
function listChats(token) {
    return request("/chats/", token);
}
function createChat(token, payload) {
    return request("/chats/create", token, {
        method: "POST",
        body: JSON.stringify(payload)
    });
}
function createPersonalChat(token, targetUserId) {
    return request("/chats/create-personal", token, {
        method: "POST",
        body: JSON.stringify({
            target_user_id: targetUserId
        })
    });
}
function deleteChat(token, chatId) {
    return request("/chats/delete", token, {
        method: "POST",
        body: JSON.stringify({
            chat_id: chatId
        })
    });
}
function listMessages(token, chatId) {
    return request(`/chats/${chatId}/messages`, token);
}
function listParticipants(token, chatId) {
    return request(`/chats/${chatId}/participants`, token);
}
function listCommits(token, chatId) {
    return request(`/chats/${chatId}/commits`, token);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/auth.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "clearToken",
    ()=>clearToken,
    "getToken",
    ()=>getToken,
    "setToken",
    ()=>setToken
]);
const TOKEN_KEY = "flow_token";
function getToken() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    return localStorage.getItem(TOKEN_KEY) ?? "";
}
function setToken(token) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    localStorage.setItem(TOKEN_KEY, token);
}
function clearToken() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    localStorage.removeItem(TOKEN_KEY);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ChatWorkspace.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ChatWorkspace",
    ()=>ChatWorkspace
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/config.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
function ChatWorkspace() {
    _s();
    const [token, setLocalToken] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [chats, setChats] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [personalChats, setPersonalChats] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [activeChatId, setActiveChatId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [activePersonalChatId, setActivePersonalChatId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("projects");
    const [isRightPanelVisible, setIsRightPanelVisible] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [chatSearchQuery, setChatSearchQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [messages, setMessages] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [commits, setCommits] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [repositories, setRepositories] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [participantsByChat, setParticipantsByChat] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const [lastMessageByChat, setLastMessageByChat] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const [newMessage, setNewMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [githubConnected, setGithubConnected] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [githubBindUrl, setGithubBindUrl] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [showCreateProjectModal, setShowCreateProjectModal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showPersonalModal, setShowPersonalModal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showDeleteModal, setShowDeleteModal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [userQuery, setUserQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [userResults, setUserResults] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [selectedUserIds, setSelectedUserIds] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [selectedRepoId, setSelectedRepoId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [deleteTargetId, setDeleteTargetId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const socketRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ChatWorkspace.useEffect": ()=>{
            const url = new URL(window.location.href);
            const tokenFromQuery = url.searchParams.get("token");
            if (tokenFromQuery) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setToken"])(tokenFromQuery);
                setLocalToken(tokenFromQuery);
                window.history.replaceState({}, "", "/chat");
                return;
            }
            setLocalToken((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getToken"])());
        }
    }["ChatWorkspace.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ChatWorkspace.useEffect": ()=>{
            if (!token) return;
            const boot = {
                "ChatWorkspace.useEffect.boot": async ()=>{
                    try {
                        setLoading(true);
                        const [me, userChats, repos, ghStatus] = await Promise.all([
                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getMe"])(token),
                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["listChats"])(token),
                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getRepositories"])(token),
                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["githubStatus"])(token)
                        ]);
                        setUser(me);
                        setChats(userChats);
                        setRepositories(repos);
                        setGithubConnected(ghStatus.connected);
                        setSelectedRepoId(repos[0]?.github_repo_id ?? "");
                        setActiveChatId(userChats[0]?.id ?? null);
                        if (!ghStatus.connected) {
                            setGithubBindUrl(await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getGithubLoginUrl"])());
                        }
                        const personal = userChats.filter({
                            "ChatWorkspace.useEffect.boot.personal": (item)=>item.repository?.full_name?.startsWith("personal/")
                        }["ChatWorkspace.useEffect.boot.personal"]).map({
                            "ChatWorkspace.useEffect.boot.personal": (item)=>({
                                    id: String(item.id),
                                    user: {
                                        id: -item.id,
                                        username: item.title,
                                        email: "",
                                        avatar_url: null
                                    }
                                })
                        }["ChatWorkspace.useEffect.boot.personal"]);
                        setPersonalChats(personal);
                        const messageResults = await Promise.all(userChats.map({
                            "ChatWorkspace.useEffect.boot": async (chat)=>{
                                try {
                                    const chatMessages = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["listMessages"])(token, chat.id);
                                    return [
                                        chat.id,
                                        chatMessages.at(-1)?.content?.trim() ?? ""
                                    ];
                                } catch  {
                                    return [
                                        chat.id,
                                        ""
                                    ];
                                }
                            }
                        }["ChatWorkspace.useEffect.boot"]));
                        setLastMessageByChat(Object.fromEntries(messageResults));
                    } catch  {
                        setError("Failed to load workspace.");
                    } finally{
                        setLoading(false);
                    }
                }
            }["ChatWorkspace.useEffect.boot"];
            void boot();
        }
    }["ChatWorkspace.useEffect"], [
        token
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ChatWorkspace.useEffect": ()=>{
            if (!token || !activeChatId) return;
            const loadData = {
                "ChatWorkspace.useEffect.loadData": async ()=>{
                    const [msgs, commitsData, participants] = await Promise.all([
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["listMessages"])(token, activeChatId),
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["listCommits"])(token, activeChatId),
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["listParticipants"])(token, activeChatId)
                    ]);
                    setMessages(msgs);
                    setCommits(commitsData);
                    setParticipantsByChat({
                        "ChatWorkspace.useEffect.loadData": (prev)=>({
                                ...prev,
                                [activeChatId]: participants
                            })
                    }["ChatWorkspace.useEffect.loadData"]);
                    setLastMessageByChat({
                        "ChatWorkspace.useEffect.loadData": (prev)=>({
                                ...prev,
                                [activeChatId]: msgs.at(-1)?.content?.trim() ?? prev[activeChatId] ?? ""
                            })
                    }["ChatWorkspace.useEffect.loadData"]);
                }
            }["ChatWorkspace.useEffect.loadData"];
            void loadData();
        }
    }["ChatWorkspace.useEffect"], [
        activeChatId,
        token
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ChatWorkspace.useEffect": ()=>{
            if (!token || userQuery.trim().length < 2 || !showCreateProjectModal && !showPersonalModal) {
                setUserResults([]);
                return;
            }
            const timer = window.setTimeout({
                "ChatWorkspace.useEffect.timer": async ()=>{
                    try {
                        setUserResults(await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["searchUsers"])(token, userQuery.trim()));
                    } catch  {
                        setUserResults([]);
                    }
                }
            }["ChatWorkspace.useEffect.timer"], 250);
            return ({
                "ChatWorkspace.useEffect": ()=>window.clearTimeout(timer)
            })["ChatWorkspace.useEffect"];
        }
    }["ChatWorkspace.useEffect"], [
        showCreateProjectModal,
        showPersonalModal,
        token,
        userQuery
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ChatWorkspace.useEffect": ()=>{
            if (!token || !activeChatId) return;
            const socket = new WebSocket(`${__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_BASE_URL"].replace("http", "ws")}/ws/chat/${activeChatId}?token=${token}`);
            socketRef.current = socket;
            socket.onmessage = ({
                "ChatWorkspace.useEffect": (event)=>{
                    const payload = JSON.parse(event.data);
                    setMessages({
                        "ChatWorkspace.useEffect": (prev)=>[
                                ...prev,
                                payload
                            ]
                    }["ChatWorkspace.useEffect"]);
                    setLastMessageByChat({
                        "ChatWorkspace.useEffect": (prev)=>({
                                ...prev,
                                [payload.chat_id]: payload.content
                            })
                    }["ChatWorkspace.useEffect"]);
                }
            })["ChatWorkspace.useEffect"];
            return ({
                "ChatWorkspace.useEffect": ()=>{
                    socket.close();
                    socketRef.current = null;
                }
            })["ChatWorkspace.useEffect"];
        }
    }["ChatWorkspace.useEffect"], [
        activeChatId,
        token
    ]);
    const filteredProjectChats = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ChatWorkspace.useMemo[filteredProjectChats]": ()=>{
            const q = chatSearchQuery.trim().toLowerCase();
            if (!q) return chats;
            return chats.filter({
                "ChatWorkspace.useMemo[filteredProjectChats]": (chat)=>{
                    const title = chat.title.toLowerCase();
                    const repo = (chat.repository?.full_name ?? "").toLowerCase();
                    return title.includes(q) || repo.includes(q);
                }
            }["ChatWorkspace.useMemo[filteredProjectChats]"]);
        }
    }["ChatWorkspace.useMemo[filteredProjectChats]"], [
        chatSearchQuery,
        chats
    ]);
    const filteredPersonalChats = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ChatWorkspace.useMemo[filteredPersonalChats]": ()=>{
            const q = chatSearchQuery.trim().toLowerCase();
            if (!q) return personalChats;
            return personalChats.filter({
                "ChatWorkspace.useMemo[filteredPersonalChats]": (chat)=>chat.user.username.toLowerCase().includes(q) || chat.user.email.toLowerCase().includes(q)
            }["ChatWorkspace.useMemo[filteredPersonalChats]"]);
        }
    }["ChatWorkspace.useMemo[filteredPersonalChats]"], [
        chatSearchQuery,
        personalChats
    ]);
    const activeChat = chats.find((chat)=>chat.id === activeChatId) ?? null;
    const activeParticipants = activeChatId ? participantsByChat[activeChatId] ?? [] : [];
    const initials = (value)=>value.split(" ").filter(Boolean).map((part)=>part[0]?.toUpperCase()).join("").slice(0, 2);
    const shorten = (value, max = 15)=>value.length > max ? `${value.slice(0, max)}...` : value;
    const formatPreview = (chat)=>{
        const latest = lastMessageByChat[chat.id] ?? "";
        if (!latest) return "Нет сообщений";
        return latest.length > 42 ? `${latest.slice(0, 42)}...` : latest;
    };
    const sendMessage = ()=>{
        if (!newMessage.trim() || !activeChatId || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
        socketRef.current.send(JSON.stringify({
            content: newMessage
        }));
        setNewMessage("");
    };
    const onCreateProjectChat = async ()=>{
        if (!githubConnected || !token) return;
        const repo = repositories.find((item)=>item.github_repo_id === selectedRepoId);
        if (!repo) return;
        const title = repo.full_name.split("/").at(-1) ?? repo.full_name;
        const created = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createChat"])(token, {
            title,
            ...repo,
            participant_ids: selectedUserIds
        });
        const fresh = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["listChats"])(token);
        setChats(fresh);
        setActiveChatId(created.id);
        setShowCreateProjectModal(false);
        setSelectedUserIds([]);
        setUserQuery("");
    };
    const startPersonalChat = async (targetUser)=>{
        if (!token) return;
        const chat = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createPersonalChat"])(token, targetUser.id);
        setPersonalChats((prev)=>prev.some((item)=>item.id === String(chat.id)) ? prev : [
                {
                    id: String(chat.id),
                    user: targetUser
                },
                ...prev
            ]);
        setChats((prev)=>prev.some((item)=>item.id === chat.id) ? prev : [
                chat,
                ...prev
            ]);
        setActiveTab("personal");
        setActivePersonalChatId(String(chat.id));
        setActiveChatId(chat.id);
        setShowPersonalModal(false);
        setUserQuery("");
    };
    const onDeleteChat = async ()=>{
        const id = Number(deleteTargetId);
        if (!id || !token) return;
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deleteChat"])(token, id);
        setChats((prev)=>prev.filter((chat)=>chat.id !== id));
        setPersonalChats((prev)=>prev.filter((chat)=>Number(chat.id) !== id));
        setShowDeleteModal(false);
        setDeleteTargetId("");
        if (activeChatId === id) setActiveChatId(null);
    };
    if (!token) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "center-screen",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "panel",
            children: "Auth token missing. Login first."
        }, void 0, false, {
            fileName: "[project]/components/ChatWorkspace.tsx",
            lineNumber: 240,
            columnNumber: 54
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/ChatWorkspace.tsx",
        lineNumber: 240,
        columnNumber: 22
    }, this);
    if (loading) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "center-screen",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "chat-loader"
        }, void 0, false, {
            fileName: "[project]/components/ChatWorkspace.tsx",
            lineNumber: 241,
            columnNumber: 55
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/ChatWorkspace.tsx",
        lineNumber: 241,
        columnNumber: 23
    }, this);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "chat-layout messenger-shell",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
                className: "col left messenger-sidebar",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "sidebar-header",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                children: "Messages"
                            }, void 0, false, {
                                fileName: "[project]/components/ChatWorkspace.tsx",
                                lineNumber: 247,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "sidebar-header-actions",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: "compose-icon-btn",
                                        onClick: ()=>activeTab === "projects" ? setShowCreateProjectModal(true) : setShowPersonalModal(true),
                                        children: "+"
                                    }, void 0, false, {
                                        fileName: "[project]/components/ChatWorkspace.tsx",
                                        lineNumber: 249,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: "compose-icon-btn danger",
                                        onClick: ()=>{
                                            setDeleteTargetId(String(activeChatId ?? ""));
                                            setShowDeleteModal(true);
                                        },
                                        children: "🗑"
                                    }, void 0, false, {
                                        fileName: "[project]/components/ChatWorkspace.tsx",
                                        lineNumber: 252,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/ChatWorkspace.tsx",
                                lineNumber: 248,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/ChatWorkspace.tsx",
                        lineNumber: 246,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "sidebar-search",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            placeholder: "Search conversations...",
                            value: chatSearchQuery,
                            onChange: (e)=>setChatSearchQuery(e.target.value)
                        }, void 0, false, {
                            fileName: "[project]/components/ChatWorkspace.tsx",
                            lineNumber: 258,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/ChatWorkspace.tsx",
                        lineNumber: 257,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "tabs-inline",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: `tab-pill ${activeTab === "projects" ? "active" : ""}`,
                                onClick: ()=>setActiveTab("projects"),
                                children: "Projects"
                            }, void 0, false, {
                                fileName: "[project]/components/ChatWorkspace.tsx",
                                lineNumber: 261,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: `tab-pill ${activeTab === "personal" ? "active" : ""}`,
                                onClick: ()=>setActiveTab("personal"),
                                children: "Personal"
                            }, void 0, false, {
                                fileName: "[project]/components/ChatWorkspace.tsx",
                                lineNumber: 262,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/ChatWorkspace.tsx",
                        lineNumber: 260,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "conversation-list",
                        children: [
                            activeTab === "projects" && filteredProjectChats.map((chat)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    className: `conversation-item ${chat.id === activeChatId ? "active" : ""}`,
                                    onClick: ()=>setActiveChatId(chat.id),
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "conversation-left",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "conversation-avatar",
                                                children: initials(chat.title)
                                            }, void 0, false, {
                                                fileName: "[project]/components/ChatWorkspace.tsx",
                                                lineNumber: 268,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "conversation-meta",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                        children: shorten(chat.title, 15)
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/ChatWorkspace.tsx",
                                                        lineNumber: 270,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        children: formatPreview(chat)
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/ChatWorkspace.tsx",
                                                        lineNumber: 271,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/ChatWorkspace.tsx",
                                                lineNumber: 269,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/ChatWorkspace.tsx",
                                        lineNumber: 267,
                                        columnNumber: 15
                                    }, this)
                                }, chat.id, false, {
                                    fileName: "[project]/components/ChatWorkspace.tsx",
                                    lineNumber: 266,
                                    columnNumber: 13
                                }, this)),
                            activeTab === "projects" && filteredProjectChats.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "muted small",
                                children: "Таких чатов нет"
                            }, void 0, false, {
                                fileName: "[project]/components/ChatWorkspace.tsx",
                                lineNumber: 276,
                                columnNumber: 77
                            }, this),
                            activeTab === "personal" && filteredPersonalChats.map((chat)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    className: `conversation-item ${chat.id === activePersonalChatId ? "active" : ""}`,
                                    onClick: ()=>{
                                        setActivePersonalChatId(chat.id);
                                        setActiveChatId(Number(chat.id));
                                    },
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "conversation-left",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "conversation-avatar",
                                                children: initials(chat.user.username)
                                            }, void 0, false, {
                                                fileName: "[project]/components/ChatWorkspace.tsx",
                                                lineNumber: 281,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "conversation-meta",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                        children: shorten(chat.user.username, 15)
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/ChatWorkspace.tsx",
                                                        lineNumber: 283,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        children: lastMessageByChat[Number(chat.id)] ?? "Start personal conversation"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/ChatWorkspace.tsx",
                                                        lineNumber: 284,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/ChatWorkspace.tsx",
                                                lineNumber: 282,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/ChatWorkspace.tsx",
                                        lineNumber: 280,
                                        columnNumber: 15
                                    }, this)
                                }, chat.id, false, {
                                    fileName: "[project]/components/ChatWorkspace.tsx",
                                    lineNumber: 279,
                                    columnNumber: 13
                                }, this)),
                            activeTab === "personal" && filteredPersonalChats.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "muted small",
                                children: "Таких чатов нет"
                            }, void 0, false, {
                                fileName: "[project]/components/ChatWorkspace.tsx",
                                lineNumber: 289,
                                columnNumber: 78
                            }, this),
                            activeTab === "projects" && !githubConnected && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: githubBindUrl,
                                className: "github-bind-banner",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                        viewBox: "0 0 16 16",
                                        width: "28",
                                        height: "28",
                                        fill: "currentColor",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                            d: "M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38v-1.32c-2.22.48-2.69-1.07-2.69-1.07-.36-.92-.89-1.16-.89-1.16-.73-.5.05-.49.05-.49.8.06 1.22.82 1.22.82.72 1.2 1.87.86 2.33.66.07-.52.28-.86.5-1.06-1.77-.2-3.63-.88-3.63-3.95 0-.88.31-1.6.82-2.16-.08-.2-.36-1 .08-2.08 0 0 .67-.22 2.2.82a7.48 7.48 0 0 1 4 0c1.52-1.04 2.2-.82 2.2-.82.44 1.08.16 1.88.08 2.08.5.56.82 1.28.82 2.16 0 3.08-1.86 3.74-3.64 3.94.28.24.54.72.54 1.46v2.16c0 .21.14.46.55.38A8 8 0 0 0 16 8c0-4.42-3.58-8-8-8Z"
                                        }, void 0, false, {
                                            fileName: "[project]/components/ChatWorkspace.tsx",
                                            lineNumber: 293,
                                            columnNumber: 83
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/ChatWorkspace.tsx",
                                        lineNumber: 293,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "Привязать GitHub"
                                    }, void 0, false, {
                                        fileName: "[project]/components/ChatWorkspace.tsx",
                                        lineNumber: 294,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/ChatWorkspace.tsx",
                                lineNumber: 292,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/ChatWorkspace.tsx",
                        lineNumber: 264,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/ChatWorkspace.tsx",
                lineNumber: 245,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "col center messenger-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                        className: "chat-topbar",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        children: activeChat?.title ?? "No chat selected"
                                    }, void 0, false, {
                                        fileName: "[project]/components/ChatWorkspace.tsx",
                                        lineNumber: 303,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        children: "● Active now"
                                    }, void 0, false, {
                                        fileName: "[project]/components/ChatWorkspace.tsx",
                                        lineNumber: 304,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/ChatWorkspace.tsx",
                                lineNumber: 302,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "topbar-icons",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: "icon-btn",
                                        onClick: ()=>activeTab === "projects" ? setShowCreateProjectModal(true) : setShowPersonalModal(true),
                                        children: "+"
                                    }, void 0, false, {
                                        fileName: "[project]/components/ChatWorkspace.tsx",
                                        lineNumber: 307,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: "icon-btn",
                                        onClick: ()=>setIsRightPanelVisible((prev)=>!prev),
                                        title: isRightPanelVisible ? "Hide right panel" : "Show right panel",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                            viewBox: "0 0 16 16",
                                            width: "14",
                                            height: "14",
                                            fill: "currentColor",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                d: "M3 3h10v10H3zM2 2v12h12V2z"
                                            }, void 0, false, {
                                                fileName: "[project]/components/ChatWorkspace.tsx",
                                                lineNumber: 309,
                                                columnNumber: 83
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/components/ChatWorkspace.tsx",
                                            lineNumber: 309,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/ChatWorkspace.tsx",
                                        lineNumber: 308,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/ChatWorkspace.tsx",
                                lineNumber: 306,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/ChatWorkspace.tsx",
                        lineNumber: 301,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "messages thread",
                        children: messages.map((message)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
                                className: `message-bubble ${message.user_id === user?.id ? "own" : ""}`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        children: message.content
                                    }, void 0, false, {
                                        fileName: "[project]/components/ChatWorkspace.tsx",
                                        lineNumber: 317,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("time", {
                                        children: new Date(message.created_at).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit"
                                        })
                                    }, void 0, false, {
                                        fileName: "[project]/components/ChatWorkspace.tsx",
                                        lineNumber: 318,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, message.id, true, {
                                fileName: "[project]/components/ChatWorkspace.tsx",
                                lineNumber: 316,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/components/ChatWorkspace.tsx",
                        lineNumber: 314,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("footer", {
                        className: "composer chat-composer",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                className: "field",
                                placeholder: "Write message...",
                                value: newMessage,
                                onChange: (e)=>setNewMessage(e.target.value),
                                onKeyDown: (e)=>{
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        sendMessage();
                                    }
                                }
                            }, void 0, false, {
                                fileName: "[project]/components/ChatWorkspace.tsx",
                                lineNumber: 323,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "send-orb",
                                onClick: sendMessage,
                                children: "➤"
                            }, void 0, false, {
                                fileName: "[project]/components/ChatWorkspace.tsx",
                                lineNumber: 324,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/ChatWorkspace.tsx",
                        lineNumber: 322,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/ChatWorkspace.tsx",
                lineNumber: 300,
                columnNumber: 7
            }, this),
            isRightPanelVisible && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
                className: "col right messenger-profile",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "profile-card",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "profile-avatar",
                                children: initials(user?.username ?? "U")
                            }, void 0, false, {
                                fileName: "[project]/components/ChatWorkspace.tsx",
                                lineNumber: 331,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                children: user?.username ?? "User"
                            }, void 0, false, {
                                fileName: "[project]/components/ChatWorkspace.tsx",
                                lineNumber: 332,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                children: "Senior Backend Engineer"
                            }, void 0, false, {
                                fileName: "[project]/components/ChatWorkspace.tsx",
                                lineNumber: 333,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "profile-actions",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: "profile-btn",
                                        children: "Profile"
                                    }, void 0, false, {
                                        fileName: "[project]/components/ChatWorkspace.tsx",
                                        lineNumber: 335,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: "profile-btn",
                                        children: "Search"
                                    }, void 0, false, {
                                        fileName: "[project]/components/ChatWorkspace.tsx",
                                        lineNumber: 336,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        href: "/settings",
                                        className: "profile-btn",
                                        children: "Settings"
                                    }, void 0, false, {
                                        fileName: "[project]/components/ChatWorkspace.tsx",
                                        lineNumber: 337,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/ChatWorkspace.tsx",
                                lineNumber: 334,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/ChatWorkspace.tsx",
                        lineNumber: 330,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "activity-card",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "activity-head",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                    children: "RECENT ACTIVITY"
                                }, void 0, false, {
                                    fileName: "[project]/components/ChatWorkspace.tsx",
                                    lineNumber: 341,
                                    columnNumber: 44
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/ChatWorkspace.tsx",
                                lineNumber: 341,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "activity-list",
                                children: commits.slice(0, 5).map((commit, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                        className: "activity-item",
                                        href: commit.html_url,
                                        target: "_blank",
                                        rel: "noreferrer",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: `activity-dot dot-${index % 3}`
                                            }, void 0, false, {
                                                fileName: "[project]/components/ChatWorkspace.tsx",
                                                lineNumber: 345,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                        children: new Date(commit.committed_at).toLocaleTimeString([], {
                                                            hour: "2-digit",
                                                            minute: "2-digit"
                                                        })
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/ChatWorkspace.tsx",
                                                        lineNumber: 347,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        children: commit.message.split("\n")[0]
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/ChatWorkspace.tsx",
                                                        lineNumber: 348,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/ChatWorkspace.tsx",
                                                lineNumber: 346,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, commit.sha, true, {
                                        fileName: "[project]/components/ChatWorkspace.tsx",
                                        lineNumber: 344,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/components/ChatWorkspace.tsx",
                                lineNumber: 342,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "participants-box",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                        children: "PARTICIPANTS"
                                    }, void 0, false, {
                                        fileName: "[project]/components/ChatWorkspace.tsx",
                                        lineNumber: 354,
                                        columnNumber: 15
                                    }, this),
                                    activeParticipants.map((member)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "participant-row",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "conversation-avatar",
                                                    children: initials(member.username)
                                                }, void 0, false, {
                                                    fileName: "[project]/components/ChatWorkspace.tsx",
                                                    lineNumber: 357,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                            children: member.username
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/ChatWorkspace.tsx",
                                                            lineNumber: 358,
                                                            columnNumber: 24
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            children: member.email
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/ChatWorkspace.tsx",
                                                            lineNumber: 358,
                                                            columnNumber: 58
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/ChatWorkspace.tsx",
                                                    lineNumber: 358,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, member.id, true, {
                                            fileName: "[project]/components/ChatWorkspace.tsx",
                                            lineNumber: 356,
                                            columnNumber: 17
                                        }, this))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/ChatWorkspace.tsx",
                                lineNumber: 353,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/ChatWorkspace.tsx",
                        lineNumber: 340,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/ChatWorkspace.tsx",
                lineNumber: 329,
                columnNumber: 9
            }, this),
            showCreateProjectModal && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "modal-overlay",
                onClick: ()=>setShowCreateProjectModal(false),
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "add-user-modal",
                    onClick: (e)=>e.stopPropagation(),
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "modal-container",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "modal-title",
                                    children: "Добавить проект"
                                }, void 0, false, {
                                    fileName: "[project]/components/ChatWorkspace.tsx",
                                    lineNumber: 370,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                    className: "field",
                                    value: selectedRepoId,
                                    onChange: (e)=>setSelectedRepoId(e.target.value),
                                    children: repositories.map((repo)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: repo.github_repo_id,
                                            children: repo.full_name
                                        }, repo.github_repo_id, false, {
                                            fileName: "[project]/components/ChatWorkspace.tsx",
                                            lineNumber: 372,
                                            columnNumber: 45
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/components/ChatWorkspace.tsx",
                                    lineNumber: 371,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    className: "field",
                                    placeholder: "Search user by username/email...",
                                    value: userQuery,
                                    onChange: (e)=>setUserQuery(e.target.value)
                                }, void 0, false, {
                                    fileName: "[project]/components/ChatWorkspace.tsx",
                                    lineNumber: 374,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    className: "btn primary",
                                    onClick: onCreateProjectChat,
                                    disabled: !selectedRepoId || !githubConnected,
                                    children: "Добавить"
                                }, void 0, false, {
                                    fileName: "[project]/components/ChatWorkspace.tsx",
                                    lineNumber: 375,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/ChatWorkspace.tsx",
                            lineNumber: 369,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "modal-container users",
                            children: userResults.map((foundUser)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    className: `add-user-item ${selectedUserIds.includes(foundUser.id) ? "selected" : ""}`,
                                    onClick: ()=>setSelectedUserIds((prev)=>prev.includes(foundUser.id) ? prev.filter((id)=>id !== foundUser.id) : [
                                                ...prev,
                                                foundUser.id
                                            ]),
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "conversation-avatar",
                                            children: initials(foundUser.username)
                                        }, void 0, false, {
                                            fileName: "[project]/components/ChatWorkspace.tsx",
                                            lineNumber: 380,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                    children: foundUser.username
                                                }, void 0, false, {
                                                    fileName: "[project]/components/ChatWorkspace.tsx",
                                                    lineNumber: 381,
                                                    columnNumber: 24
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    children: foundUser.email
                                                }, void 0, false, {
                                                    fileName: "[project]/components/ChatWorkspace.tsx",
                                                    lineNumber: 381,
                                                    columnNumber: 61
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/ChatWorkspace.tsx",
                                            lineNumber: 381,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, foundUser.id, true, {
                                    fileName: "[project]/components/ChatWorkspace.tsx",
                                    lineNumber: 379,
                                    columnNumber: 17
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/components/ChatWorkspace.tsx",
                            lineNumber: 377,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/ChatWorkspace.tsx",
                    lineNumber: 368,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/ChatWorkspace.tsx",
                lineNumber: 367,
                columnNumber: 9
            }, this),
            showPersonalModal && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "modal-overlay",
                onClick: ()=>setShowPersonalModal(false),
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "add-user-modal",
                    onClick: (e)=>e.stopPropagation(),
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "modal-container",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "modal-title",
                                    children: "Личные сообщения"
                                }, void 0, false, {
                                    fileName: "[project]/components/ChatWorkspace.tsx",
                                    lineNumber: 393,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    className: "field",
                                    placeholder: "Search user by username/email...",
                                    value: userQuery,
                                    onChange: (e)=>setUserQuery(e.target.value)
                                }, void 0, false, {
                                    fileName: "[project]/components/ChatWorkspace.tsx",
                                    lineNumber: 394,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/ChatWorkspace.tsx",
                            lineNumber: 392,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "modal-container users",
                            children: userResults.map((foundUser)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    className: "add-user-item",
                                    onClick: ()=>startPersonalChat(foundUser),
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "conversation-avatar",
                                            children: initials(foundUser.username)
                                        }, void 0, false, {
                                            fileName: "[project]/components/ChatWorkspace.tsx",
                                            lineNumber: 399,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                    children: foundUser.username
                                                }, void 0, false, {
                                                    fileName: "[project]/components/ChatWorkspace.tsx",
                                                    lineNumber: 400,
                                                    columnNumber: 24
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    children: foundUser.email
                                                }, void 0, false, {
                                                    fileName: "[project]/components/ChatWorkspace.tsx",
                                                    lineNumber: 400,
                                                    columnNumber: 61
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/ChatWorkspace.tsx",
                                            lineNumber: 400,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, foundUser.id, true, {
                                    fileName: "[project]/components/ChatWorkspace.tsx",
                                    lineNumber: 398,
                                    columnNumber: 17
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/components/ChatWorkspace.tsx",
                            lineNumber: 396,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/ChatWorkspace.tsx",
                    lineNumber: 391,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/ChatWorkspace.tsx",
                lineNumber: 390,
                columnNumber: 9
            }, this),
            showDeleteModal && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "modal-overlay",
                onClick: ()=>setShowDeleteModal(false),
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "add-user-modal",
                    onClick: (e)=>e.stopPropagation(),
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "modal-container",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "modal-title",
                                children: "Удалить чат"
                            }, void 0, false, {
                                fileName: "[project]/components/ChatWorkspace.tsx",
                                lineNumber: 412,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                className: "field",
                                value: deleteTargetId,
                                onChange: (e)=>setDeleteTargetId(e.target.value),
                                children: chats.map((chat)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: String(chat.id),
                                        children: chat.title
                                    }, chat.id, false, {
                                        fileName: "[project]/components/ChatWorkspace.tsx",
                                        lineNumber: 414,
                                        columnNumber: 38
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/components/ChatWorkspace.tsx",
                                lineNumber: 413,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "btn danger",
                                onClick: onDeleteChat,
                                disabled: !deleteTargetId,
                                children: "Удалить"
                            }, void 0, false, {
                                fileName: "[project]/components/ChatWorkspace.tsx",
                                lineNumber: 416,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/ChatWorkspace.tsx",
                        lineNumber: 411,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/components/ChatWorkspace.tsx",
                    lineNumber: 410,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/ChatWorkspace.tsx",
                lineNumber: 409,
                columnNumber: 9
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "error-banner",
                children: error
            }, void 0, false, {
                fileName: "[project]/components/ChatWorkspace.tsx",
                lineNumber: 421,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/ChatWorkspace.tsx",
        lineNumber: 244,
        columnNumber: 5
    }, this);
}
_s(ChatWorkspace, "xCYrCTfmzHllz4H9+l/4KbwkS8A=");
_c = ChatWorkspace;
var _c;
__turbopack_context__.k.register(_c, "ChatWorkspace");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_954e171f._.js.map