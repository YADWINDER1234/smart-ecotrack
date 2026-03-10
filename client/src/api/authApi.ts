import { httpClient } from "./httpClient";

export type Role = "ADMIN" | "CONSUMER" | "RECYCLER" | "MANUFACTURER";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

const REFRESH_TOKEN_KEY = "rt";

export function saveRefreshToken(token: string) {
  try { localStorage.setItem(REFRESH_TOKEN_KEY, token); } catch { /* ignore */ }
}

export function loadRefreshToken(): string | null {
  try { return localStorage.getItem(REFRESH_TOKEN_KEY); } catch { return null; }
}

export function clearRefreshToken() {
  try { localStorage.removeItem(REFRESH_TOKEN_KEY); } catch { /* ignore */ }
}

export async function register(input: {
  name: string;
  email: string;
  password: string;
}): Promise<{ user: User; accessToken: string }> {
  const { data } = await httpClient.post("/auth/register", input);
  if (data.refreshToken) saveRefreshToken(data.refreshToken);
  return data;
}

export async function login(input: {
  email: string;
  password: string;
}): Promise<{ user: User; accessToken: string }> {
  try {
    const { data } = await httpClient.post("/auth/login", input);
    if (data.refreshToken) saveRefreshToken(data.refreshToken);
    return data;
  } catch (err: any) {
    if (err.isAxiosError && !err.response) {
      throw new Error("Network error: unable to reach auth server.");
    }
    throw err;
  }
}

export async function me(): Promise<{ user: User }> {
  const { data } = await httpClient.get("/auth/me");
  return data;
}

export async function refresh(): Promise<{ accessToken: string }> {
  const storedToken = loadRefreshToken();
  // Send the refresh token in the request body for cross-domain support
  const { data } = await httpClient.post("/auth/refresh", {
    refreshToken: storedToken || undefined
  });
  // Store the new rotated token
  if (data.refreshToken) saveRefreshToken(data.refreshToken);
  return data;
}

export async function logout(): Promise<void> {
  const storedToken = loadRefreshToken();
  clearRefreshToken();
  await httpClient.post("/auth/logout", { refreshToken: storedToken || undefined });
}
