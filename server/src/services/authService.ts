import { randomUUID } from "crypto";
import { AppError } from "../utils/errors";
import { hashPassword, verifyPassword } from "../auth/password";
import { signAccessToken, generateRefreshToken } from "../auth/jwt";
import { findUserByEmail, findUserById, insertUser } from "../repos/userRepo";
import { insertRefreshToken, revokeAllForUser, findByTokenHash as findRefreshByHash } from "../repos/refreshTokenRepo";
import { sha256Hex } from "../utils/crypto";
import type { Role } from "../types/role";

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  points: number;
};

function toPublicUser(row: any): PublicUser {
  return { id: row.id, name: row.name, email: row.email, role: row.role, points: row.points || 0 };
}

export async function registerConsumer(input: {
  name: string;
  email: string;
  password: string;
}): Promise<{ user: PublicUser; accessToken: string; refreshToken: string }> {
  const email = input.email.trim().toLowerCase();
  const existing = await findUserByEmail(email);
  if (existing) throw new AppError("Email already in use", 409, "EMAIL_EXISTS");

  const password_hash = await hashPassword(input.password);
  const id = randomUUID();
  await insertUser({
    id,
    name: input.name.trim(),
    email,
    password_hash,
    role: "CONSUMER"
  });

  const user = await findUserById(id);
  if (!user) throw new AppError("User creation failed", 500, "USER_CREATE_FAILED");
  const accessToken = signAccessToken({ userId: user.id, role: user.role });
  // create refresh token
  const refreshToken = generateRefreshToken();
  const tokenHash = sha256Hex(refreshToken);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await insertRefreshToken({ id: randomUUID(), user_id: user.id, token_hash: tokenHash, expires_at: expiresAt });
  return { user: toPublicUser(user), accessToken, refreshToken };
}

export async function login(input: {
  email: string;
  password: string;
}): Promise<{ user: PublicUser; accessToken: string; refreshToken: string }> {
  const email = input.email.trim().toLowerCase();
  const user = await findUserByEmail(email);
  if (!user) throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");

  const ok = await verifyPassword(input.password, user.password_hash);
  if (!ok) throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");

  const accessToken = signAccessToken({ userId: user.id, role: user.role });
  // rotate refresh tokens: revoke existing
  await revokeAllForUser(user.id);
  const refreshToken = generateRefreshToken();
  const tokenHash = sha256Hex(refreshToken);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await insertRefreshToken({ id: randomUUID(), user_id: user.id, token_hash: tokenHash, expires_at: expiresAt });
  return { user: toPublicUser(user), accessToken, refreshToken };
}

export async function getMe(userId: string): Promise<PublicUser> {
  const user = await findUserById(userId);
  if (!user) throw new AppError("User not found", 404, "USER_NOT_FOUND");
  return toPublicUser(user);
}

