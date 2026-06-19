"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { getGithubLoginUrl, getMe, loginEmail, registerEmail, updateUsername } from "@/lib/api";
import { getToken, setToken } from "@/lib/auth";

type Props = {
  mode: "login" | "register";
};

type Step = "form" | "verify" | "username";

export function AuthCard({ mode }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("form");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  // const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // const codeInputRef = useRef<HTMLInputElement>(null);
  const usernameInputRef = useRef<HTMLInputElement>(null);

  const isLogin = mode === "login";
  const isWeakPassword = password.length > 0 && password.length < 8;
  // const isPasswordMismatch = !isLogin && confirmPassword.length > 0 && password !== confirmPassword;

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    void getMe(token).then((user) => {
      if (user.needs_username) {
        setStep("username");
      } else {
        router.replace("/chat");
      }
    });
  }, [router]);

  // useEffect(() => {
  //   if (step !== "verify") return;
  //   const id = window.setTimeout(() => codeInputRef.current?.focus(), 400);
  //   return () => window.clearTimeout(id);
  // }, [step]);

  useEffect(() => {
    if (step !== "username") return;
    const id = window.setTimeout(() => usernameInputRef.current?.focus(), 400);
    return () => window.clearTimeout(id);
  }, [step]);

  const submitForm = async () => {
    if (isWeakPassword) {
      setError("Пароль простой");
      return;
    }
    // if (!isLogin && password !== confirmPassword) {
    //   setError("Пароли не совпадают");
    //   return;
    // }
    try {
      setLoading(true);
      setError("");
      const result = isLogin ? await loginEmail(email, password) : await registerEmail(email, password);
      setToken(result.token);
      if (result.user.needs_username) {
        setUsername("");
        setStep("username");
        return;
      }
      router.replace("/chat");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : isLogin ? "Не удалось войти" : "Не удалось зарегистрироваться";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // --- Email OTP (disabled) ---
  // const submitCode = async () => {
  //   try {
  //     setLoading(true);
  //     setError("");
  //     const result = isLogin ? await verifyEmailLogin(email, code) : await verifyEmailRegister(email, code);
  //     setToken(result.token);
  //     if (result.user.needs_username) {
  //       setUsername("");
  //       setStep("username");
  //       return;
  //     }
  //     router.replace("/chat");
  //   } catch (err) {
  //     const message = err instanceof Error ? err.message : "Неверный код или срок действия истёк";
  //     setError(message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const submitUsername = async () => {
    const token = getToken();
    if (!token || !username.trim()) return;
    try {
      setLoading(true);
      setError("");
      await updateUsername(token, username.trim());
      router.replace("/chat");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Не удалось сохранить имя";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // const backToForm = () => {
  //   setStep("form");
  //   setCode("");
  //   setError("");
  // };

  const loginGithub = async () => {
    const url = await getGithubLoginUrl();
    window.location.href = url;
  };

  const stepClass = (target: Step, from: "left" | "right") =>
    `auth-card auth-step from-${from} ${step === target ? "active" : "inactive"}`;

  return (
    <main className="auth-screen">
      <div className="auth-flow">
        <div className="auth-card-stack-wrap">
          <div className="auth-card-stack">
            <section className={stepClass("form", "left")}>
              <h1>{isLogin ? "Вход" : "Регистрация"}</h1>
              <label className="auth-label">ПОЧТА</label>
              <input
                className="field auth-field"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={step !== "form"}
              />
              <label className="auth-label">ПАРОЛЬ</label>
              <input
                className="field auth-field"
                type="password"
                autoComplete={isLogin ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void submitForm();
                }}
                disabled={step !== "form"}
              />
              {/* Email OTP registration (disabled)
              {!isLogin && (
                <>
                  <label className="auth-label">ПОДТВЕРЖДЕНИЕ ПАРОЛЯ</label>
                  <input
                    className="field auth-field"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void submitForm();
                    }}
                    disabled={step !== "form"}
                  />
                </>
              )}
              */}
              {isWeakPassword && step === "form" && <p className="error">Пароль простой</p>}
              {error && step === "form" && <p className="error">{error}</p>}
              <button
                className="btn primary"
                type="button"
                onClick={() => void submitForm()}
                disabled={loading || !email || !password || isWeakPassword || step !== "form"}
              >
                {loading && step === "form"
                  ? "Подождите..."
                  : isLogin
                    ? "Войти"
                    : "Зарегистрироваться"}
              </button>
              <p className="muted small">
                {isLogin ? "Нет аккаунта?" : "Уже есть аккаунт?"}{" "}
                <Link href={isLogin ? "/register" : "/login"}>{isLogin ? "Зарегистрироваться" : "Войти"}</Link>
              </p>
            </section>

            {/* Email OTP verify step (disabled)
            <section className={stepClass("verify", "right")}>
              <h1>Заполните код</h1>
              <p className="muted small">Код из письма отправлен на {email || "вашу почту"}</p>
              <label className="auth-label">КОД ИЗ ПИСЬМА</label>
              <input
                ref={codeInputRef}
                className="field auth-field"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void submitCode();
                }}
              />
              {error && step === "verify" && <p className="error">{error}</p>}
              <button
                className="btn primary"
                type="button"
                onClick={() => void submitCode()}
                disabled={loading || code.length !== 6}
              >
                {loading && step === "verify" ? "Проверка..." : "Подтвердить"}
              </button>
              <button type="button" className="btn ghost auth-back-btn" onClick={backToForm}>
                Назад
              </button>
            </section>
            */}

            <section className={stepClass("username", "right")}>
              <h1>Напишите юзернейм</h1>
              <p className="muted small">Выберите имя, которое увидят другие пользователи</p>
              <label className="auth-label">ИМЯ ПОЛЬЗОВАТЕЛЯ</label>
              <input
                ref={usernameInputRef}
                className="field auth-field"
                autoComplete="username"
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void submitUsername();
                }}
              />
              {error && step === "username" && <p className="error">{error}</p>}
              <button
                className="btn primary"
                type="button"
                onClick={() => void submitUsername()}
                disabled={loading || username.trim().length < 3}
              >
                {loading && step === "username" ? "Сохранение..." : "Продолжить"}
              </button>
            </section>
          </div>
        </div>

        <section className="oauth-panel">
          <div className="oauth-separator" />
          <button type="button" className="github-auth-btn" onClick={loginGithub} title="Привязать GitHub">
            <svg viewBox="0 0 16 16" width="28" height="28" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38v-1.32c-2.22.48-2.69-1.07-2.69-1.07-.36-.92-.89-1.16-.89-1.16-.73-.5.05-.49.05-.49.8.06 1.22.82 1.22.82.72 1.2 1.87.86 2.33.66.07-.52.28-.86.5-1.06-1.77-.2-3.63-.88-3.63-3.95 0-.88.31-1.6.82-2.16-.08-.2-.36-1 .08-2.08 0 0 .67-.22 2.2.82a7.48 7.48 0 0 1 4 0c1.52-1.04 2.2-.82 2.2-.82.44 1.08.16 1.88.08 2.08.5.56.82 1.28.82 2.16 0 3.08-1.86 3.74-3.64 3.94.28.24.54.72.54 1.46v2.16c0 .21.14.46.55.38A8 8 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
            </svg>
          </button>
          <p className="terminal-subtitle">Вход через GitHub</p>
        </section>
      </div>
    </main>
  );
}
