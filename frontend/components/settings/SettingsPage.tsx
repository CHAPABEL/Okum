"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { AccentColorPicker } from "@/components/settings/AccentColorPicker";
import { EnvironmentSelector } from "@/components/settings/EnvironmentSelector";
import { IdentityCard } from "@/components/settings/IdentityCard";
import { getMe, startEmailChange, updateUsername, verifyEmailChange } from "@/lib/api";
import { clearToken, getToken } from "@/lib/auth";

export function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [username, setUsername] = useState("");
  const [savedUsername, setSavedUsername] = useState("");
  const [email, setEmail] = useState("");
  const [savedEmail, setSavedEmail] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [emailVerifyStep, setEmailVerifyStep] = useState<"idle" | "code">("idle");
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
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    void getMe(token)
      .then((user) => {
        if (user.needs_username) {
          router.replace("/register");
          return;
        }
        setUsername(user.username);
        setSavedUsername(user.username);
        setEmail(user.email);
        setSavedEmail(user.email);
      })
      .catch(() => {
        clearToken();
        router.replace("/login");
      })
      .finally(() => setLoading(false));
  }, [router]);

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

  const onRequestEmailCode = async () => {
    const token = getToken();
    if (!token) return;
    try {
      setSaving(true);
      setError("");
      await startEmailChange(token, email.trim());
      setEmailCode("");
      setEmailVerifyStep("code");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось отправить код");
    } finally {
      setSaving(false);
    }
  };

  const onVerifyEmailCode = async () => {
    const token = getToken();
    if (!token) return;
    try {
      setSaving(true);
      setError("");
      const user = await verifyEmailChange(token, email.trim(), emailCode);
      setEmail(user.email);
      setSavedEmail(user.email);
      setEmailVerifyStep("idle");
      setEmailCode("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Неверный код");
    } finally {
      setSaving(false);
    }
  };

  const onCancelEmailChange = () => {
    setEmail(savedEmail);
    setEmailCode("");
    setEmailVerifyStep("idle");
    setError("");
  };

  const onSave = async () => {
    const token = getToken();
    if (!token) return;
    if (email.trim().toLowerCase() !== savedEmail.trim().toLowerCase()) {
      setError("Сначала подтвердите новую почту кодом");
      return;
    }
    try {
      setSaving(true);
      setError("");
      if (username.trim() !== savedUsername) {
        const user = await updateUsername(token, username.trim());
        setUsername(user.username);
        setSavedUsername(user.username);
      }
      router.push("/chat");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось сохранить");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="center-screen">
        <div className="chat-loader" />
      </main>
    );
  }

  return (
    <main className="settings-shell-v2">
      <div className="settings-grid-v2">
        <div className="settings-col-left">
          <IdentityCard
            username={username}
            email={email}
            savedEmail={savedEmail}
            emailCode={emailCode}
            emailVerifyStep={emailVerifyStep}
            loading={saving}
            error={error}
            onUsernameChange={setUsername}
            onEmailChange={setEmail}
            onEmailCodeChange={setEmailCode}
            onRequestEmailCode={() => void onRequestEmailCode()}
            onVerifyEmailCode={() => void onVerifyEmailCode()}
            onCancelEmailChange={onCancelEmailChange}
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
        <button type="button" className="btn settings-save-btn" onClick={() => void onSave()} disabled={saving}>
          {saving ? "Сохранение..." : "Сохранить изменения"}
        </button>
      </div>
    </main>
  );
}
