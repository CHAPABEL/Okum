type IdentityCardProps = {
  username: string;
  email: string;
  onUsernameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
};

export function IdentityCard({ username, email, onUsernameChange, onEmailChange }: IdentityCardProps) {
  return (
    <section className="settings-block identity-card">
      <h3 className="settings-block-title">IDENTITY</h3>
      <div className="identity-content">
        <div className="identity-avatar">{(username || "U").slice(0, 1).toUpperCase()}</div>
        <div className="identity-fields">
          <label className="auth-label">Username</label>
          <input
            className="field settings-input"
            value={username}
            onChange={(event) => onUsernameChange(event.target.value)}
          />
          <label className="auth-label">Email Address</label>
          <input
            className="field settings-input"
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
          />
        </div>
      </div>
    </section>
  );
}
