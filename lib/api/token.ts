/**
 * Standard Browser Token & Cookie Management for JWT Authentication.
 * Supports Next.js client-side execution, SSR-safety, and cookies for Next.js middleware.
 */

const ACCESS_TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_KEY = "auth_user";

/**
 * Standard cookie setter
 */
export function setCookie(name: string, value: string, days = 7): void {
  if (typeof document === "undefined") return;

  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `; expires=${date.toUTCString()}`;
  const isSecure = typeof window !== "undefined" && window.location.protocol === "https:";
  const secureFlag = isSecure ? "; Secure" : "";

  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}${expires}; path=/; SameSite=Lax${secureFlag}`;
}

/**
 * Standard cookie reader
 */
export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;

  const nameEQ = `${encodeURIComponent(name)}=`;
  const ca = document.cookie.split(";");

  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) {
      return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
  }

  return null;
}

/**
 * Delete a cookie
 */
export function deleteCookie(name: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${encodeURIComponent(name)}=; Max-Age=-99999999; path=/; SameSite=Lax`;
}

// -------------------------------------------------------------
// JWT Access Token Management
// -------------------------------------------------------------

/**
 * Store access JWT in both cookie (for Next.js SSR/middleware) and localStorage (client cache)
 */
export function setAuthToken(token: string, days = 7): void {
  if (!token) return;

  // 1. Store in Cookie
  setCookie(ACCESS_TOKEN_KEY, token, days);

  // 2. Store in LocalStorage
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
    } catch {
      // LocalStorage might be unavailable (e.g. incognito restrictions)
    }
  }
}

/**
 * Retrieve access JWT (checks cookie first, falls back to localStorage)
 */
export function getAuthToken(): string | null {
  const cookieToken = getCookie(ACCESS_TOKEN_KEY);
  if (cookieToken) return cookieToken;

  if (typeof window !== "undefined") {
    try {
      return localStorage.getItem(ACCESS_TOKEN_KEY);
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * Remove access token from cookie and localStorage
 */
export function removeAuthToken(): void {
  deleteCookie(ACCESS_TOKEN_KEY);
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
    } catch {}
  }
}

// -------------------------------------------------------------
// Refresh Token Management
// -------------------------------------------------------------

export function setRefreshToken(refreshToken: string, days = 30): void {
  if (!refreshToken) return;
  setCookie(REFRESH_TOKEN_KEY, refreshToken, days);
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    } catch {}
  }
}

export function getRefreshToken(): string | null {
  const cookieToken = getCookie(REFRESH_TOKEN_KEY);
  if (cookieToken) return cookieToken;

  if (typeof window !== "undefined") {
    try {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    } catch {
      return null;
    }
  }

  return null;
}

export function removeRefreshToken(): void {
  deleteCookie(REFRESH_TOKEN_KEY);
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    } catch {}
  }
}

// -------------------------------------------------------------
// User Profile Storage
// -------------------------------------------------------------

export function setStoredUser<T = unknown>(user: T): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch {}
  }
}

export function getStoredUser<T = unknown>(): T | null {
  if (typeof window !== "undefined") {
    try {
      const data = localStorage.getItem(USER_KEY);
      return data ? (JSON.parse(data) as T) : null;
    } catch {
      return null;
    }
  }
  return null;
}

export function removeStoredUser(): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(USER_KEY);
    } catch {}
  }
}

// -------------------------------------------------------------
// Composite Auth State Helpers
// -------------------------------------------------------------

/**
 * Clear all authentication tokens and state on logout
 */
export function clearAuth(): void {
  removeAuthToken();
  removeRefreshToken();
  removeStoredUser();
}

/**
 * Inspect JWT payload claims without requiring third-party libraries
 */
export function parseJwt<T = Record<string, unknown>>(token: string): T | null {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload) as T;
  } catch {
    return null;
  }
}

/**
 * Check whether a valid non-expired JWT exists
 */
export function isTokenValid(token?: string | null): boolean {
  const t = token ?? getAuthToken();
  if (!t) return false;

  const payload = parseJwt<{ exp?: number }>(t);
  if (!payload || !payload.exp) return true; // if no exp claim, assume valid

  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp > currentTime;
}
