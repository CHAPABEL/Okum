"use client";

import Link from "next/link";
import { useState } from "react";
import { clearToken } from "@/lib/auth";

export default function SettingsPage() {
  const [password, setPassword] = useState("");

  return (
    <main className="settings-shell">
      <section className="settings-card">
        <div className="settings-header">
          <h1>Settings</h1>
          <Link href="/chat" className="btn ghost">Back</Link>
        </div>
        <label className="auth-label">NEW PASSWORD</label>
        <input className="field dark" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <div className="settings-actions">
          <button className="btn primary">Save</button>
          <button className="btn danger" onClick={() => { clearToken(); window.location.href = "/login"; }}>Logout</button>
        </div>
      </section>
    </main>
  );
}
