export type Permission = string;

export type Role = {
  id?: number | string;
  name?: string;
  [key: string]: unknown;
};

export type AuthUser = {
  id?: number | string;
  name?: string;
  username?: string;
  email?: string;
  role?: string;
  permissions?: Permission[];
  [key: string]: unknown;
};

export type AuthSession = {
  token: string;
  user: AuthUser | null;
  response: unknown;
  permissions: Permission[];
  roles: Role[];
};

const TOKEN_KEY = "token";
const AUTH_DATA_KEY = "authData";
const COOKIE_NAME = "sbe_admin_token";

const canUseBrowserStorage = () => typeof window !== "undefined";

function safeParse<T>(value: string | null): T | null {
  if (!value) return null;

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function normalizeToken(rawToken: unknown): string {
  if (typeof rawToken === "string") return rawToken;
  if (rawToken === null || rawToken === undefined) return "";
  return String(rawToken);
}

function extractUser(response: any): AuthUser | null {
  const data = response?.data;

  if (!data) return null;
  if (data.user && typeof data.user === "object") return data.user;
  if (data.admin && typeof data.admin === "object") return data.admin;
  if (data.username || data.email || data.name || data.role) return data;
  return null;
}

function setSessionCookie(token: string) {
  if (!canUseBrowserStorage()) return;

  const maxAge = token ? 60 * 60 * 24 : 0;
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(
    token
  )}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function getStoredToken(): string {
  if (!canUseBrowserStorage()) return "";

  return normalizeToken(safeParse(localStorage.getItem(TOKEN_KEY)) ?? localStorage.getItem(TOKEN_KEY));
}

export function getStoredSession(): AuthSession | null {
  if (!canUseBrowserStorage()) return null;

  const response = safeParse<any>(localStorage.getItem(AUTH_DATA_KEY));
  const token = getStoredToken();

  if (!token) return null;

  return {
    token,
    user: extractUser(response),
    response,
    permissions: response?.permissions ?? [],
    roles: response?.roles ?? [],
  };
}

export function storeSession(
  response: unknown,
  token: string,
  access: Pick<AuthSession, "permissions" | "roles"> = {
    permissions: [],
    roles: [],
  }
) {
  if (!canUseBrowserStorage()) return;

  const normalizedToken = normalizeToken(token);
  const payload =
    response && typeof response === "object"
      ? { ...(response as Record<string, unknown>), ...access }
      : { data: response, ...access };

  localStorage.setItem(TOKEN_KEY, JSON.stringify(normalizedToken));
  localStorage.setItem(AUTH_DATA_KEY, JSON.stringify(payload));
  setSessionCookie(normalizedToken);
}

export function clearSession() {
  if (!canUseBrowserStorage()) return;

  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(AUTH_DATA_KEY);
  setSessionCookie("");
}

export function hasPermission(session: AuthSession | null, permission: string) {
  if (!permission) return true;
  return Boolean(session?.permissions?.includes(permission));
}
