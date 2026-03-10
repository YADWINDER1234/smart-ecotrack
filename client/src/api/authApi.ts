import { httpClient } from "./httpClient";

export type Role = "ADMIN" | "CONSUMER" | "RECYCLER" | "MANUFACTURER";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

export async function register(input: {
  name: string;
  email: string;
  password: string;
}): Promise<{ user: User; accessToken: string }> {
  const { data } = await httpClient.post("/auth/register", input);
  return data;
}

export async function login(input: {
  email: string;
  password: string;
}): Promise<{ user: User; accessToken: string }> {
  try {
    const { data } = await httpClient.post("/auth/login", input);
    return data;
  } catch (err: any) {
    if (err.isAxiosError && !err.response) {
      // network-level failure
      throw new Error(
        "Network error: unable to reach auth server."
      );
    }
    throw err;
  }
}

export async function me(): Promise<{ user: User }> {
  const { data } = await httpClient.get("/auth/me");
  return data;
}

export async function refresh(): Promise<{ accessToken: string }> {
  const { data } = await httpClient.post("/auth/refresh");
  return data;
}

export async function logout(): Promise<void> {
  await httpClient.post("/auth/logout");
}

