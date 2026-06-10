"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { deleteAdminUser, getAdminStats, listAdminUsers, searchAdminUsers } from "@/lib/api";
import { clearAdminToken, getAdminToken } from "@/lib/auth";
import { AdminStats, User } from "@/lib/types";

const ADMIN_FORBIDDEN = "Admin access required";

export default function AdminPage() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [token, setToken] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);

  useEffect(() => {
    setIsVisible(true);
    const t = getAdminToken();
    if (!t) {
      router.replace("/admin/login");
      return;
    }
    setToken(t);
  }, [router]);

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      try {
        setLoading(true);
        const usersPromise = searchQuery.trim()
          ? searchAdminUsers(token, searchQuery.trim())
          : listAdminUsers(token);
        const [statsData, usersData] = await Promise.all([getAdminStats(token), usersPromise]);
        setStats(statsData);
        setUsers(usersData);
        setError("");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Не удалось загрузить данные админ-панели";
        if (message.includes(ADMIN_FORBIDDEN)) {
          clearAdminToken();
          router.replace("/admin/login");
          return;
        }
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [token, searchQuery, router]);

  const onRefreshAfterDelete = async () => {
    if (!token) return;
    const usersPromise = searchQuery.trim()
      ? searchAdminUsers(token, searchQuery.trim())
      : listAdminUsers(token);
    const [statsData, usersData] = await Promise.all([getAdminStats(token), usersPromise]);
    setStats(statsData);
    setUsers(usersData);
  };

  const onDelete = async (userId: number) => {
    if (!token) return;
    const confirmed = window.confirm("Удалить пользователя? Это действие необратимо.");
    if (!confirmed) return;
    try {
      setDeletingUserId(userId);
      await deleteAdminUser(token, userId);
      await onRefreshAfterDelete();
      setError("");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Не удалось удалить пользователя";
      if (message.includes(ADMIN_FORBIDDEN)) {
        clearAdminToken();
        router.replace("/admin/login");
        return;
      }
      setError(message);
    } finally {
      setDeletingUserId(null);
    }
  };

  if (!token) {
    return (
      <main className={`admin-shell admin-fade-in${isVisible ? " visible" : ""}`}>
        <div className="panel">Перенаправление на вход...</div>
      </main>
    );
  }

  return (
    <main className={`admin-shell admin-fade-in${isVisible ? " visible" : ""}`}>
      <header className="admin-header">
        <h1>Панель администратора</h1>
        <div className="settings-actions">
          <button
            type="button"
            className="btn settings-logout-btn"
            onClick={() => {
              clearAdminToken();
              router.replace("/admin/login");
            }}
          >
            Выйти
          </button>
          <Link href="/chat" className="btn ghost">
            Назад в чат
          </Link>
        </div>
      </header>

      {loading ? (
        <div className="panel">Загрузка...</div>
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
            <div className="admin-stat-card">
              <span>Зарегистрировано через GitHub</span>
              <strong>{stats?.github_users_count ?? 0}</strong>
            </div>
          </section>

          <section className="admin-users">
            <h2>Пользователи</h2>
            <input
              className="field settings-input"
              placeholder="Поиск по имени или почте..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="admin-users-table-wrap">
              <table className="admin-users-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Имя пользователя</th>
                    <th>Почта</th>
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
                          onClick={() => void onDelete(u.id)}
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
