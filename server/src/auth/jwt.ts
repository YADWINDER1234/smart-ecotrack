import jwt from "jsonwebtoken";
import type { Role } from "../types/role";
import { getEnv } from "../utils/env";
import { AppError } from "../utils/errors";
import { randomUUID } from "crypto";

export type AccessTokenPayload = {
  sub: string;
  role: Role;
};

export function signAccessToken(input: { userId: string; role: Role }): string {
  const secret = getEnv("JWT_SECRET", "dev_jwt_secret_change_me");
  const expiresIn = (process.env.JWT_EXPIRES_IN ?? "7d") as jwt.SignOptions["expiresIn"];
  return jwt.sign(
    { role: input.role },
    secret,
    { subject: input.userId, expiresIn }
  );
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const secret = getEnv("JWT_SECRET", "dev_jwt_secret_change_me");
  try {
    const decoded = jwt.verify(token, secret) as jwt.JwtPayload;
    const sub = decoded.sub;
    const role = decoded.role as Role | undefined;
    if (!sub || !role) {
      throw new AppError("Invalid token payload", 401, "TOKEN_INVALID");
    }
    return { sub, role };
  } catch (_err) {
    throw new AppError("Invalid or expired token", 401, "TOKEN_INVALID");
  }
}

export function generateRefreshToken(): string {
  // Plain refresh token (store hash in DB)
  return randomUUID();
}


