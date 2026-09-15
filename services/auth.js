export const AUTH_STORAGE_KEY = "wela-auth-session";

export function normalizePhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");

  if (digits.startsWith("66")) {
    return `0${digits.slice(2)}`;
  }

  return digits;
}

export function isValidThaiPhone(phone) {
  return /^0[689]\d{8}$/.test(normalizePhone(phone));
}

async function authRequest(endpoint, payload) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "ไม่สามารถเชื่อมต่อระบบเข้าสู่ระบบได้");
  }

  return data;
}

export function requestOtp({ identifier, channel }) {
  return authRequest("/api/auth/request-otp", {
    identifier,
    channel,
  });
}

export function verifyOtp({ identifier, channel, code }) {
  return authRequest("/api/auth/verify-otp", {
    identifier,
    channel,
    code,
  });
}

export function getAuthSession() {
  if (typeof window === "undefined") return null;

  try {
    const value = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

export function saveAuthSession(session) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function clearAuthSession() {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}
