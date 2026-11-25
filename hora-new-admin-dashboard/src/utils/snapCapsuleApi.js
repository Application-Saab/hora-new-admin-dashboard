import { SNAP_CAPSULE_API_URL } from "./apiconstant";

// Calls the Snap Capsule backend's dashboard API (/api/admin/*) with the
// admin panel's own login token (localStorage "authToken", saved by
// /dashboard-login). No separate sign-in.

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

const authToken = () => {
  try {
    return localStorage.getItem("authToken") || "";
  } catch {
    return "";
  }
};

async function call(path) {
  const token = authToken();
  if (!token) throw new ApiError("Please log in to the admin panel.", 401);
  let res;
  try {
    res = await fetch(`${SNAP_CAPSULE_API_URL}${path}`, { headers: { Authorization: token } });
  } catch {
    throw new ApiError("Can't reach the Snap Capsule server. Check your internet connection.", 0);
  }
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.error === true) {
    throw new ApiError(json.message || `Request failed (${res.status}).`, res.status);
  }
  return json.data;
}

const query = (params) => {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") q.set(key, String(value));
  });
  const text = q.toString();
  return text ? `?${text}` : "";
};

export const getStats = () => call("/api/admin/stats");
export const getCapsules = (params) => call(`/api/admin/capsules${query(params)}`);
export const getVisitors = (params) => call(`/api/admin/visitors${query(params)}`);
