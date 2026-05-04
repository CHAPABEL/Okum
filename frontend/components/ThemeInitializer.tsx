"use client";

import { useEffect } from "react";

function applyTheme(env: "deep-space" | "light-matter", color: string) {
  const root = document.documentElement;
  const accentMap: Record<string, string> = {
    green: "#22c55e",
    purple: "#8b5cf6",
    red: "#ef4444",
    white: env === "deep-space" ? "#111111" : "#ffffff",
  };
  const accent = accentMap[color] ?? accentMap.purple;
  root.style.setProperty("--accent", accent);
  root.style.setProperty("--accent-2", accent);
  root.setAttribute("data-theme", env === "light-matter" ? "light" : "dark");
}

export function ThemeInitializer() {
  useEffect(() => {
    const savedEnv = (localStorage.getItem("flow_env") as "deep-space" | "light-matter" | null) ?? "deep-space";
    const savedColor = localStorage.getItem("flow_accent") ?? "purple";
    applyTheme(savedEnv, savedColor);
  }, []);

  return null;
}
