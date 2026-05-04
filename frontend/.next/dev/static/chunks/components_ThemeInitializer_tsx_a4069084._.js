(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/components/ThemeInitializer.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ThemeInitializer",
    ()=>ThemeInitializer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
"use client";
;
function applyTheme(env, color) {
    const root = document.documentElement;
    const accentMap = {
        green: "#22c55e",
        purple: "#8b5cf6",
        red: "#ef4444",
        white: env === "deep-space" ? "#111111" : "#ffffff"
    };
    const accent = accentMap[color] ?? accentMap.purple;
    root.style.setProperty("--accent", accent);
    root.style.setProperty("--accent-2", accent);
    root.setAttribute("data-theme", env === "light-matter" ? "light" : "dark");
}
function ThemeInitializer() {
    _s();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ThemeInitializer.useEffect": ()=>{
            const savedEnv = localStorage.getItem("flow_env") ?? "deep-space";
            const savedColor = localStorage.getItem("flow_accent") ?? "purple";
            applyTheme(savedEnv, savedColor);
        }
    }["ThemeInitializer.useEffect"], []);
    return null;
}
_s(ThemeInitializer, "OD7bBpZva5O2jO+Puf00hKivP7c=");
_c = ThemeInitializer;
var _c;
__turbopack_context__.k.register(_c, "ThemeInitializer");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=components_ThemeInitializer_tsx_a4069084._.js.map