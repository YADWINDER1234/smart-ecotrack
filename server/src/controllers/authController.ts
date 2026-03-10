import type { RequestHandler } from "express";
import { z } from "zod";
import { registerConsumer, login, getMe } from "../services/authService";
import { sha256Hex } from "../utils/crypto";
import { revokeTokenByHash, findByTokenHash, insertRefreshToken } from "../repos/refreshTokenRepo";

export const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(200)
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(200)
});

export const registerHandler: RequestHandler = async (req, res, next) => {
  try {
    const { user, accessToken, refreshToken } = await registerConsumer(req.body);
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const isProd = process.env.NODE_ENV === "production";
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProd ? true : true, // SameSite "none" requires secure: true even on localhost in many modern browsers
      sameSite: isProd ? "lax" : "none",
      expires
    });
    res.status(201).json({ user, accessToken });
  } catch (err) {
    next(err);
  }
};

export const loginHandler: RequestHandler = async (req, res, next) => {
  try {
    const { user, accessToken, refreshToken } = await login(req.body);
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const isProd = process.env.NODE_ENV === "production";
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProd ? true : true,
      sameSite: isProd ? "lax" : "none",
      expires
    });
    res.json({ user, accessToken });
  } catch (err) {
    next(err);
  }
};

export const refreshHandler: RequestHandler = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken ?? req.get("x-refresh-token") ?? null;
    if (!token) return res.status(401).json({ error: "Missing refresh token" });
    const hash = sha256Hex(token);
    const row = await findByTokenHash(hash);
    if (!row || row.revoked || new Date() > new Date(row.expires_at)) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }
    const userId = row.user_id;
    const user = await getMe(userId);
    const accessToken = require("../auth/jwt").signAccessToken({ userId: userId, role: user.role });
    // rotate refresh token: revoke current and issue new via service
    await revokeTokenByHash(hash);
    const newToken = require("../auth/jwt").generateRefreshToken();
    const newHash = sha256Hex(newToken);
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await insertRefreshToken({ id: require("crypto").randomUUID(), user_id: userId, token_hash: newHash, expires_at: expires });
    const isProd = process.env.NODE_ENV === "production";
    res.cookie("refreshToken", newToken, {
      httpOnly: true,
      secure: isProd ? true : true,
      sameSite: isProd ? "lax" : "none",
      expires
    });
    res.json({ accessToken });
  } catch (err) {
    next(err);
  }
};

export const logoutHandler: RequestHandler = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken ?? null;
    if (token) {
      const hash = sha256Hex(token);
      await revokeTokenByHash(hash);
    }
    res.clearCookie("refreshToken");
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const meHandler: RequestHandler = async (req, res, next) => {
  try {
    const user = await getMe(req.user!.id);
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

