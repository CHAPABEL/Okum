"use client";

import Link from "next/link";
import { useState } from "react";

import { getGithubLoginUrl, loginWithEmail, registerWithEmail } from "@/lib/api";
import { setToken } from "@/lib/auth";

type Props = {
  mode: "login" | "register";
};

export function AuthCard({ mode }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isLogin = mode === "login";

  const submit = async () => {
    try {
      setLoading(true);
      setError("");
      const result = isLogin ? await loginWithEmail(email, password) : await registerWithEmail(email, password);
      setToken(result.token);
      window.location.href = "/chat";
    } catch {
      setError(isLogin ? "Login failed" : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const loginGithub = async () => {
    const url = await getGithubLoginUrl();
    window.location.href = url;
  };

  return (
    <main className="auth-screen">
      <div className="auth-flow">
        <section className="auth-card">
          <h1>{isLogin ? "Login" : "Register"}</h1>
          <label className="auth-label">EMAIL</label>
          <input className="field auth-field" value={email} onChange={(e) => setEmail(e.target.value)} />
          <label className="auth-label">PASSWORD</label>
          <input
            className="field auth-field"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void submit();
            }}
          />
          {error && <p className="error">{error}</p>}
          <button className="btn primary" onClick={submit} disabled={loading || !email || !password}>
            {loading ? "Please wait..." : isLogin ? "Login" : "Create account"}
          </button>
          <p className="muted small">
            {isLogin ? "No account?" : "Have account?"}{" "}
            <Link href={isLogin ? "/register" : "/login"}>{isLogin ? "Register" : "Login"}</Link>
          </p>
        </section>

        <section className="oauth-panel">
          <div className="oauth-separator" />
          <button type="button" className="github-auth-btn" onClick={loginGithub} title="Bind GitHub">
            <svg viewBox="0 0 16 16" width="28" height="28" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38v-1.32c-2.22.48-2.69-1.07-2.69-1.07-.36-.92-.89-1.16-.89-1.16-.73-.5.05-.49.05-.49.8.06 1.22.82 1.22.82.72 1.2 1.87.86 2.33.66.07-.52.28-.86.5-1.06-1.77-.2-3.63-.88-3.63-3.95 0-.88.31-1.6.82-2.16-.08-.2-.36-1 .08-2.08 0 0 .67-.22 2.2.82a7.48 7.48 0 0 1 4 0c1.52-1.04 2.2-.82 2.2-.82.44 1.08.16 1.88.08 2.08.5.56.82 1.28.82 2.16 0 3.08-1.86 3.74-3.64 3.94.28.24.54.72.54 1.46v2.16c0 .21.14.46.55.38A8 8 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
            </svg>
          </button>
          <p className="terminal-subtitle">Optional GitHub bind</p>
        </section>
      </div>
    </main>
  );
}
