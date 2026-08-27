const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() || "";

export const API_BASE_URL = configuredBaseUrl.replace(/\/+$/, "");

const TEMPORARY_ADMIN_TOKEN_KEY = "weareclearance-temporary-admin-token";

export function apiUrl(path: string) {
  if (!path.startsWith("/")) throw new Error(`API path must start with "/": ${path}`);
  return `${API_BASE_URL}${path}`;
}

export function getTemporaryAdminToken() {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(TEMPORARY_ADMIN_TOKEN_KEY);
}

export function setTemporaryAdminToken(token: string) {
  window.sessionStorage.setItem(TEMPORARY_ADMIN_TOKEN_KEY, token);
}

export function clearTemporaryAdminToken() {
  if (typeof window !== "undefined") window.sessionStorage.removeItem(TEMPORARY_ADMIN_TOKEN_KEY);
}

export async function apiFetch(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  const temporaryToken = getTemporaryAdminToken();
  if (temporaryToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${temporaryToken}`);
  }
  return fetch(apiUrl(path), {
    ...init,
    credentials: init.credentials ?? "include",
    headers,
  });
}