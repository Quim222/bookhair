"use client";

import { clearUser } from "./authSlice";
import { store } from "./store";
import { clearToken } from "./token";

export const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
export function getToken() {
  try {
    const token = sessionStorage.getItem("token");
    return token;
  } catch {
    return null;
  }
}

export async function apiFetch(
  path: string,
  init?: (RequestInit & { noAuth?: boolean }) & { _retried?: boolean }
) {
  const headers: Record<string, string> = {
    ...(init?.headers as Record<string, string>),
  };

  // Auth
  if (!init?.noAuth) {
    const token = getToken();
    if (token) headers.Authorization = "Bearer " + token;
  }

  // Só mete Accept se não for FormData
  if (!(init?.body instanceof FormData)) {
    headers.Accept = "application/json";
  }

  const res = await fetch(BASE_URL + path, {
    ...init,
    headers,
    // se precisares de cookies p/ refresh: credentials: "include" (aqui deixei no refresh)
  });

  // Refresh token (1 tentativa) — evita loop com _retried
  if (res.status === 401 && !init?.noAuth && !init?._retried) {
    const refreshRes = await fetch(BASE_URL + "/auth/refresh", {
      method: "POST",
      credentials: "include",
    });
    if (refreshRes.ok) {
      return apiFetch(path, { ...init, _retried: true });
    }
    clearToken();
    store.dispatch(clearUser());
  }

  return res;
}

export async function apiFetchJson<T = any>(
  path: string,
  init?: RequestInit & { noAuth?: boolean }
): Promise<T> {
  const res = await apiFetch(path, init);
  const ct = res.headers.get("content-type") || "";

  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      if (ct.includes("application/json")) {
        const err = await res.json();
        msg = err?.message || msg;
      } else {
        const text = await res.text();
        msg = text || msg;
      }
    } catch {}
    throw new Error(msg);
  }

  if (ct.includes("application/json")) return res.json() as Promise<T>;
  // fallback defensivo
  const text = await res.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error("Resposta não é JSON.");
  }
}

export type UploadPhotoResponse = {
  url: string;
  etag: string;
  hasPhoto: boolean;
};
