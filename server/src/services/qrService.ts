import { randomUUID } from "crypto";
import { z } from "zod";
import { AppError } from "../utils/errors";
import {
  base64UrlDecodeJson,
  base64UrlEncodeJson,
  hmacSha256Hex,
  safeEqualHex,
  sha256Hex
} from "../utils/crypto";
import { findQrById, insertQrCode, updateQrStatus, markQrFraud } from "../repos/qrRepo";
import { findProductById } from "../repos/productRepo";

export type QrTokenPayload = {
  qr_id: string;
  expiry: number;
  signature: string;
};

const payloadSchema = z.object({
  qr_id: z.string().uuid(),
  expiry: z.number().int().positive(),
  signature: z.string().regex(/^[0-9a-f]{64}$/i)
});

function signatureMessage(qrId: string, expiryMs: number): string {
  return `${qrId}:${expiryMs}`;
}

export function signQrPayload(input: { qrId: string; expiryMs: number }): string {
  return hmacSha256Hex(signatureMessage(input.qrId, input.expiryMs));
}

export function encodeQrToken(payload: Omit<QrTokenPayload, "signature">): string {
  const signature = signQrPayload({ qrId: payload.qr_id, expiryMs: payload.expiry });
  return base64UrlEncodeJson({ ...payload, signature });
}

export function decodeQrToken(token: string): QrTokenPayload {
  let decoded: unknown;
  try {
    decoded = base64UrlDecodeJson<QrTokenPayload>(token);
  } catch {
    throw new AppError("Invalid QR token format", 400, "QR_TOKEN_FORMAT");
  }
  const parsed = payloadSchema.safeParse(decoded);
  if (!parsed.success) throw new AppError("Invalid QR token format", 400, "QR_TOKEN_FORMAT");
  return parsed.data;
}

export function verifyQrToken(token: string): QrTokenPayload {
  const payload = decodeQrToken(token);
  const expected = signQrPayload({ qrId: payload.qr_id, expiryMs: payload.expiry });
  if (!safeEqualHex(payload.signature, expected)) {
    throw new AppError("Invalid QR signature", 401, "QR_SIGNATURE_INVALID");
  }
  if (Date.now() > payload.expiry) {
    throw new AppError("QR token expired", 401, "QR_EXPIRED");
  }
  return payload;
}

export async function generateQrForProduct(input: { productId: string; daysValid?: number }) {
  const product = await findProductById(input.productId);
  if (!product) throw new AppError("Product not found", 404, "PRODUCT_NOT_FOUND");

  const qrId = randomUUID();
  const days = Math.min(Math.max(input.daysValid ?? 365, 1), 3650);
  const expiry = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  const expiryMs = expiry.getTime();

  const token = encodeQrToken({ qr_id: qrId, expiry: expiryMs });
  const token_hash = sha256Hex(token);

  await insertQrCode({
    id: qrId,
    product_id: product.id,
    token_hash,
    expiry,
    status: "ACTIVE",
    current_state: "SCAN",
    lifecycle_state: "ACTIVE"
  });

  return {
    qr_id: qrId,
    expiry: expiryMs,
    token,
    token_hash
  };
}

export async function revokeQr(qrId: string): Promise<void> {
  const qr = await findQrById(qrId);
  if (!qr) throw new AppError("QR not found", 404, "QR_NOT_FOUND");
  await updateQrStatus(qrId, "REVOKED");
}

export async function markQrAsFraud(qrId: string, actorId?: string | null): Promise<void> {
  const qr = await findQrById(qrId);
  if (!qr) throw new AppError("QR not found", 404, "QR_NOT_FOUND");
  // mark as fraud and revoke
  await markQrFraud(qrId, actorId ?? null);
}

