import { SNAP_CAPSULE_API_URL } from "./apiconstant";

// Calls the Snap Capsule backend's dashboard API.
//
// Sign-in: the team member's email (must be in the backend's ADMIN_EMAILS)
// gets a 4-digit code; the code returns a token that lasts 12 hours. The
// token is kept in sessionStorage, so it's gone when the tab is closed.

const TOKEN_KEY = "snapCapsuleAdmin";

export function loadSession() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(TOKEN_KEY) || "null");
    if (saved && saved.token && new Date(saved.expiresAt) > new Date()) return saved;
  } catch {
    // Storage blocked or corrupt: treat as signed out.
  }
  clearSession();
  return null;
}

function saveSession(session) {
  try {
    sessionStorage.setItem(TOKEN_KEY, JSON.stringify(session));
  } catch {
    // Still works for this page view without storage.
  }
}

export function clearSession() {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore
  }
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function call(path, { method = "GET", body, token } = {}) {
  let res;
  try {
    res = await fetch(`${SNAP_CAPSULE_API_URL}${path}`, {
      method,
      headers: {
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Can't reach the Snap Capsule server. Check your internet connection.", 0);
  }
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.error === true || json.success === false) {
    throw new ApiError(json.message || `Request failed (${res.status}).`, res.status);
  }
  return json.data;
}

export const requestCode = (email) => call("/api/admin/auth/request-otp", { method: "POST", body: { email } });

export async function verifyCode(email, code) {
  const data = await call("/api/admin/auth/verify-otp", { method: "POST", body: { email, code } });
  const session = { token: data.token, email: data.email, expiresAt: data.expiresAt };
  saveSession(session);
  return session;
}

const query = (params) => {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") q.set(key, String(value));
  });
  const text = q.toString();
  return text ? `?${text}` : "";
};

export const getStats = (token) => call("/api/admin/stats", { token });
export const getCapsules = (token, params) => call(`/api/admin/capsules${query(params)}`, { token });
export const getVisitors = (token, params) => call(`/api/admin/visitors${query(params)}`, { token });
