import Link from "next/link";

export default function Home() {
  return (
    <main className="hero">
      <h1 className="hero-title">
        FLOW
      </h1>
      <p className="hero-subtitle">
        Откажитесь от разрозненных инструментов. Перейдите в единое рабочее пространство для команд с быстрым темпом.
      </p>
      <div className="hero-actions">
        <Link className="btn primary" href="/login">
          Начать работу
        </Link>
        <Link className="btn ghost" href="/register">
          Создать аккаунт
        </Link>
      </div>
    </main>
  );
}
