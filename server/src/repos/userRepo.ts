import { db } from "../db/connection";
import type { Role } from "../types/role";

export type UserRow = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: Role;
  created_at: Date;
  updated_at: Date;
};

export async function findUserByEmail(email: string): Promise<UserRow | null> {
  const row = await db<UserRow>("users").where({ email }).first();
  return row ?? null;
}

export async function findUserById(id: string): Promise<UserRow | null> {
  const row = await db<UserRow>("users").where({ id }).first();
  return row ?? null;
}

export async function insertUser(input: {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: Role;
}): Promise<void> {
  await db("users").insert(input);
}

