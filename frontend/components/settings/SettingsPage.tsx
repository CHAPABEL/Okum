"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { AccentColorPicker } from "@/components/settings/AccentColorPicker";
import { EnvironmentSelector } from "@/components/settings/EnvironmentSelector";
import { IdentityCard } from "@/components/settings/IdentityCard";
import { clearToken } from "@/lib/auth";

export function SettingsPage() {
  const router = useRouter();
  const [username, setUsername] = useState(
    () => (typeof window !== "undefined" ? localStorage.getItem("flow_username") : null) ?? "chappa",
  );
  const [email, setEmail] = useState(
    () => (typeof window !== "undefined" ? localStorage.getItem("flow_email") : null) ?? "chappa@example.com",
  );
  const [selectedColor, setSelectedColor] = useState(
    () => (typeof window !== "undefined" ? localStorage.getItem("flow_accent") : null) ?? "purple",
  );
  const [selectedEnvironment, setSelectedEnvironment] = useState<"deep-space" | "light-matter">(
    () =>
      ((typeof window !== "undefined" ? localStorage.getItem("flow_env") : null) as
        | "deep-space"
        | "light-matter"
        | null) ?? "deep-space",
  );

  useEffect(() => {
    const root = document.documentElement;
    const accentMap: Record<string, string> = {
      green: "#22c55e",
      purple: "#8b5cf6",
      red: "#ef4444",
      white: selectedEnvironment === "deep-space" ? "#ffffff" : "#111111",
    };
    const accent = accentMap[selectedColor] ?? accentMap.purple;
    root.style.setProperty("--accent", accent);
    root.style.setProperty("--accent-2", accent);
    root.setAttribute("data-theme", selectedEnvironment === "light-matter" ? "light" : "dark");
    localStorage.setItem("flow_env", selectedEnvironment);
    localStorage.setItem("flow_accent", selectedColor);
  }, [selectedColor, selectedEnvironment]);

  return (
    <main className="settings-shell-v2">
      <div className="settings-grid-v2">
        <div className="settings-col-left">
          <IdentityCard
            username={username}
            email={email}
            onUsernameChange={setUsername}
            onEmailChange={setEmail}
          />
        </div>

        <div className="settings-col-right">
          <AccentColorPicker
            selectedColor={selectedColor}
            selectedEnvironment={selectedEnvironment}
            onSelectColor={setSelectedColor}
          />
          <EnvironmentSelector
            selectedEnvironment={selectedEnvironment}
            onSelectEnvironment={setSelectedEnvironment}
          />
        </div>
      </div>
      <div className="settings-save-outside">
        <button
          type="button"
          className="btn settings-logout-btn"
          onClick={() => {
            clearToken();
            router.push("/login");
          }}
        >
          Выйти
        </button>
        <button
          type="button"
          className="btn settings-save-btn"
          onClick={() => {
            localStorage.setItem("flow_username", username);
            localStorage.setItem("flow_email", email);
            router.push("/chat");
          }}
        >
          Save Changes
        </button>
      </div>
    </main>
  );
}
