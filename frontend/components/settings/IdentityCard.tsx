type IdentityCardProps = {
  username: string;
  email: string;
  savedEmail: string;
  emailCode: string;
  emailVerifyStep: "idle" | "code";
  loading: boolean;
  error: string;
  onUsernameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onEmailCodeChange: (value: string) => void;
  onRequestEmailCode: () => void;
  onVerifyEmailCode: () => void;
  onCancelEmailChange: () => void;
};

export function IdentityCard({
  username,
  email,
  savedEmail,
  emailCode,
  emailVerifyStep,
  loading,
  error,
  onUsernameChange,
  onEmailChange,
  onEmailCodeChange,
  onRequestEmailCode,
  onVerifyEmailCode,
  onCancelEmailChange,
}: IdentityCardProps) {
  const emailChanged = email.trim().toLowerCase() !== savedEmail.trim().toLowerCase();
  const avatarLetter = (username || email || "U").slice(0, 1).toUpperCase();

  return (
    <section className="settings-block identity-card">
      <h3 className="settings-block-title">ПРОФИЛЬ</h3>
      <div className="identity-content">
        <div className="identity-avatar">{avatarLetter}</div>
        <div className="identity-fields">
          <label className="auth-label">ИМЯ ПОЛЬЗОВАТЕЛЯ</label>
          <input
            className="field settings-input"
            value={username}
            onChange={(event) => onUsernameChange(event.target.value)}
            placeholder="username"
          />
          <label className="auth-label">ПОЧТА</label>
          <input
            className="field settings-input"
            type="email"
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
            disabled={emailVerifyStep === "code"}
          />
          {emailChanged && emailVerifyStep === "idle" && (
            <button type="button" className="btn ghost settings-inline-btn" onClick={onRequestEmailCode} disabled={loading || !email}>
              {loading ? "Отправка..." : "Отправить код на новую почту"}
            </button>
          )}
          {emailVerifyStep === "code" && (
            <>
              <p className="muted small">Код отправлен на {email}</p>
              <label className="auth-label">КОД ИЗ ПИСЬМА</label>
              <input
                className="field settings-input"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={emailCode}
                onChange={(event) => onEmailCodeChange(event.target.value.replace(/\D/g, "").slice(0, 6))}
                onKeyDown={(event) => {
                  if (event.key === "Enter") onVerifyEmailCode();
                }}
              />
              <div className="settings-inline-actions">
                <button
                  type="button"
                  className="btn primary"
                  onClick={onVerifyEmailCode}
                  disabled={loading || emailCode.length !== 6}
                >
                  {loading ? "Проверка..." : "Подтвердить почту"}
                </button>
                <button type="button" className="btn ghost" onClick={onCancelEmailChange} disabled={loading}>
                  Отмена
                </button>
              </div>
            </>
          )}
          {error && <p className="error">{error}</p>}
        </div>
      </div>
    </section>
  );
}
