// src/libs/token.ts
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("token");
}

export function setToken(token: string) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem("token", token);
}

export function clearToken() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem("token");
}

export function isTokenValid(token: string | null): boolean {
  if (!token) return false;
  try {
    const [, payloadB64] = token.split(".");
    const payloadJson = JSON.parse(atob(payloadB64));
    // exp em segundos → ms
    if (!payloadJson?.exp) return true; // se o backend não põe exp, assume válido
    const now = Date.now();
    return now < payloadJson.exp * 1000;
  } catch {
    return false;
  }
}
