const raw = process.env.NEXT_PUBLIC_API_BASE_URL;

/** Пустая строка или same-origin = запросы через nginx на том же хосте. */
export const API_BASE_URL =
  raw === "" || raw === "same-origin" ? "" : (raw ?? "http://localhost:8000");

export function wsBaseUrl(): string {
  if (API_BASE_URL) {
    return API_BASE_URL.replace(/^http/, "ws");
  }
  if (typeof window !== "undefined") {
    const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${proto}//${window.location.host}`;
  }
  return "ws://localhost:8000";
}
