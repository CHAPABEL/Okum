"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { deleteAdminUser, getAdminStats, listAdminUsers } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { AdminStats, User } from "@/lib/types";

export default function AdminPage() {
  const [token, setToken] = useState("");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);

  useEffect(() => {
    setToken(getToken());
  }, []);

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      try {
        setLoading(true);
        const [statsData, usersData] = await Promise.all([getAdminStats(token), listAdminUsers(token)]);
        setStats(statsData);
        setUsers(usersData);
        setError("");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load admin data";
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [token]);

  const onDeleteUser = async (userId: number) => {
    if (!token) return;
    const confirmed = window.confirm("Удалить пользователя? Это действие необратимо.");
    if (!confirmed) return;
    try {
      setDeletingUserId(userId);
      await deleteAdminUser(token, userId);
      const [statsData, usersData] = await Promise.all([getAdminStats(token), listAdminUsers(token)]);
      setStats(statsData);
      setUsers(usersData);
      setError("");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete user";
      setError(message);
    } finally {
      setDeletingUserId(null);
    }
  };

  if (!token) {
    return (
      <main className="center-screen">
        <div className="panel">
          <p>Auth token missing. Login first.</p>
          <Link href="/login" className="btn primary">Login</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <h1>Admin Panel</h1>
        <Link href="/chat" className="btn ghost">Back to chat</Link>
      </header>

      {loading ? (
        <div className="panel">Loading...</div>
      ) : (
        <>
          <section className="admin-stats">
            <div className="admin-stat-card">
              <span>Зарегистрировано пользователей</span>
              <strong>{stats?.users_count ?? 0}</strong>
            </div>
            <div className="admin-stat-card">
              <span>Всего отправлено сообщений</span>
              <strong>{stats?.messages_count ?? 0}</strong>
            </div>
          </section>

          <section className="admin-users">
            <h2>Пользователи</h2>
            <div className="admin-users-table-wrap">
              <table className="admin-users-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>{u.id}</td>
                      <td>{u.username}</td>
                      <td>{u.email}</td>
                      <td>
                        <button
                          type="button"
                          className="btn admin-delete-btn"
                          disabled={deletingUserId === u.id}
                          onClick={() => void onDeleteUser(u.id)}
                        >
                          {deletingUserId === u.id ? "Удаление..." : "Удалить"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
      {error && <div className="error-banner">{error}</div>}
    </main>
  );
}
