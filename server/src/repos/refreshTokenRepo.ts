import { db } from "../db/connection";

export type RefreshTokenRow = {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: Date;
  revoked: boolean;
  created_at: Date;
};

export async function insertRefreshToken(input: {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: Date;
}): Promise<void> {
  await db("refresh_tokens").insert({ ...input, revoked: false, created_at: db.fn.now() });
}

export async function findByTokenHash(hash: string): Promise<RefreshTokenRow | null> {
  const row = await db<RefreshTokenRow>("refresh_tokens").where({ token_hash: hash }).first();
  return row ?? null;
}

export async function revokeTokenById(id: string): Promise<void> {
  await db("refresh_tokens").where({ id }).update({ revoked: true });
}

export async function revokeTokenByHash(hash: string): Promise<void> {
  await db("refresh_tokens").where({ token_hash: hash }).update({ revoked: true });
}

export async function revokeAllForUser(userId: string): Promise<void> {
  await db("refresh_tokens").where({ user_id: userId }).update({ revoked: true });
}
