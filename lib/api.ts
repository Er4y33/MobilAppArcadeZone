// lib/api.ts
// NestJS backend'ine fetch ile istek atan basit API istemcisi
const API_URL = "http://10.0.2.2:3000";

async function request(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`API hatası: ${res.status}`);
  return res.json();
}

export const api = {
  get: (path: string) => request(path),
  post: (path: string, body: any) =>
    request(path, { method: "POST", body: JSON.stringify(body) }),
};
