import { createHmac, createHash, timingSafeEqual } from "crypto";
import { getEnv } from "./env";

export function sha256Hex(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

export function hmacSha256Hex(message: string): string {
  const secret = getEnv("QR_SECRET", "dev_qr_secret_change_me");
  return createHmac("sha256", secret).update(message).digest("hex");
}

export function safeEqualHex(a: string, b: string): boolean {
  const aBuf = Buffer.from(a, "hex");
  const bBuf = Buffer.from(b, "hex");
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}

export function base64UrlEncodeJson(obj: unknown): string {
  const json = JSON.stringify(obj);
  return Buffer.from(json, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export function base64UrlDecodeJson<T>(b64url: string): T {
  const padLen = (4 - (b64url.length % 4)) % 4;
  const padded = b64url + "=".repeat(padLen);
  const b64 = padded.replace(/-/g, "+").replace(/_/g, "/");
  const json = Buffer.from(b64, "base64").toString("utf8");
  return JSON.parse(json) as T;
}

