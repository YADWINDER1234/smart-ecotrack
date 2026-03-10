import type { RequestHandler } from "express";
import { verifyAccessToken } from "../auth/jwt";
import { AppError } from "../utils/errors";

function parseBearer(authHeader?: string): string | null {
  if (!authHeader) return null;
  const [kind, token] = authHeader.split(" ");
  if (kind !== "Bearer" || !token) return null;
  return token;
}

export const requireAuth: RequestHandler = (req, _res, next) => {
  const token = parseBearer(req.header("authorization"));
  if (!token) return next(new AppError("Missing Authorization header", 401, "AUTH_REQUIRED"));
  const payload = verifyAccessToken(token);
  req.user = { id: payload.sub, role: payload.role };
  next();
};

export const optionalAuth: RequestHandler = (req, _res, next) => {
  const token = parseBearer(req.header("authorization"));
  if (!token) return next();
  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, role: payload.role };
  } catch {
    // ignore invalid token for optional auth
  }
  next();
};

