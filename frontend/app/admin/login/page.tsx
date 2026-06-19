"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { loginAdmin } from "@/lib/api";
import { getAdminToken, setAdminToken } from "@/lib/auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [adminLogin, setAdminLoginField] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [error, setError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    if (getAdminToken()) {
      router.replace("/admin");
    }
  }, [router]);

  const onSubmit = () => {
    const run = async () => {
      try {
        setLoginLoading(true);
        const auth = await loginAdmin(adminLogin, adminPassword);
        setAdminToken(auth.token);
        setError("");
        router.replace("/admin");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Неверный логин или пароль администратора";
        setError(message);
      } finally {
        setLoginLoading(false);
      }
    };
    void run();
  };

  return (
    <main className={`admin-shell admin-fade-in${isVisible ? " visible" : ""}`}>
      <section className="admin-login-card">
        <h1>Вход администратора</h1>
        <p className="muted small">Отдельная авторизация для панели администратора</p>
        <p className="muted small">По умолчанию: логин <strong>admin</strong>, пароль <strong>admin</strong> (задаётся в .env)</p>
        <label className="auth-label">ЛОГИН</label>
        <input
          className="field auth-field"
          value={adminLogin}
          onChange={(e) => setAdminLoginField(e.target.value)}
          placeholder="admin"
          autoComplete="username"
        />
        <label className="auth-label">ПАРОЛЬ</label>
        <input
          className="field auth-field"
          type="password"
          value={adminPassword}
          onChange={(e) => setAdminPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="current-password"
          onKeyDown={(e) => {
            if (e.key === "Enter") onSubmit();
          }}
        />
        <button
          type="button"
          className="btn primary"
          onClick={onSubmit}
          disabled={loginLoading || !adminLogin || !adminPassword}
        >
          {loginLoading ? "Проверка..." : "Войти в админ-панель"}
        </button>
        {error && <div className="error-banner">{error}</div>}
        <Link href="/login" className="btn ghost">
          Обычный вход в приложение
        </Link>
      </section>
    </main>
  );
}
