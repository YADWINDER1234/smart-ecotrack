import type { RequestHandler } from "express";
import { z } from "zod";
import { randomUUID } from "crypto";
import { AppError } from "../utils/errors";
import { insertScanLog } from "../repos/scanLogRepo";
import { findQrById } from "../repos/qrRepo";
import { findProductById } from "../repos/productRepo";
import { getMe } from "../services/authService";
import {
  decodeQrToken,
  generateQrForProduct,
  revokeQr,
  signQrPayload
} from "../services/qrService";
import { safeEqualHex } from "../utils/crypto";
import { computeEcoScore } from "../services/ecoScoreService";
import { audit } from "../services/auditService";

export const generateQrSchema = z.object({
  daysValid: z.number().int().min(1).max(3650).optional()
});

export const scanSchema = z.object({
  token: z.string().min(10)
});

export const generateQrHandler: RequestHandler = async (req, res, next) => {
  try {
    const productId = req.params.id;

    // RBAC Security Check: Ensure Manufacturers can only generate QRs for their OWN physical items.
    const product = await findProductById(productId);
    if (!product) throw new AppError("Product not found", 404, "PRODUCT_NOT_FOUND");
    
    if (req.user?.role === "MANUFACTURER") {
      const u = await getMe(req.user.id);
      if (product.manufacturer !== u.name) {
        throw new AppError("Forbidden: Cannot authorize QR generation for competitor products", 403, "FORBIDDEN");
      }
    }

    const qr = await generateQrForProduct({ productId, daysValid: req.body.daysValid });
    await audit({
      actorId: req.user?.id ?? null,
      action: "QR_GENERATE",
      entityType: "qr_code",
      entityId: qr.qr_id,
      metadata: { productId, expiry: qr.expiry }
    });
    res.status(201).json({ qr });
  } catch (err) {
    next(err);
  }
};

export const revokeQrHandler: RequestHandler = async (req, res, next) => {
  try {
    await revokeQr(req.params.id);
    await audit({
      actorId: req.user?.id ?? null,
      action: "QR_REVOKE",
      entityType: "qr_code",
      entityId: req.params.id
    });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const scanQrHandler: RequestHandler = async (req, res, next) => {
  const ip = req.ip || null;
  const userAgent = req.get("user-agent") || null;
  const userId = req.user?.id ?? null;

  try {
    const { token } = scanSchema.parse(req.body);
    const payload = decodeQrToken(token);

    const qr = await findQrById(payload.qr_id);
    if (!qr) throw new AppError("Unknown QR", 404, "QR_NOT_FOUND");
    if (qr.is_fraud) {
      await insertScanLog({
        id: randomUUID(),
        qr_id: qr.id,
        user_id: userId,
        timestamp: new Date(),
        outcome: "REVOKED",
        ip,
        user_agent: userAgent
      });
      throw new AppError("QR has been revoked by admin (fraud)", 401, "QR_REVOKED");
    }

    if (qr.status !== "ACTIVE") {
      await insertScanLog({
        id: randomUUID(),
        qr_id: qr.id,
        user_id: userId,
        timestamp: new Date(),
        outcome: "REVOKED",
        ip,
        user_agent: userAgent
      });
      throw new AppError("QR revoked", 401, "QR_REVOKED");
    }

    if (Date.now() > new Date(qr.expiry).getTime() || Date.now() > payload.expiry) {
      await insertScanLog({
        id: randomUUID(),
        qr_id: qr.id,
        user_id: userId,
        timestamp: new Date(),
        outcome: "EXPIRED",
        ip,
        user_agent: userAgent
      });
      throw new AppError("QR expired", 401, "QR_EXPIRED");
    }

    const expectedSig = signQrPayload({ qrId: payload.qr_id, expiryMs: payload.expiry });
    if (!safeEqualHex(payload.signature, expectedSig)) {
      await insertScanLog({
        id: randomUUID(),
        qr_id: qr.id,
        user_id: userId,
        timestamp: new Date(),
        outcome: "INVALID_SIGNATURE",
        ip,
        user_agent: userAgent
      });
      throw new AppError("Invalid QR signature", 401, "QR_SIGNATURE_INVALID");
    }

    const product = await findProductById(qr.product_id);
    if (!product) throw new AppError("Product not found", 404, "PRODUCT_NOT_FOUND");

    const eco = computeEcoScore({
      metadata: product.metadata_json,
      currentState: qr.current_state
    });

    await insertScanLog({
      id: randomUUID(),
      qr_id: qr.id,
      user_id: userId,
      timestamp: new Date(),
      outcome: "SUCCESS",
      ip,
      user_agent: userAgent
    });

    res.json({
      qr: { id: qr.id, expiry: qr.expiry, status: qr.status, current_state: qr.current_state },
      product,
      eco
    });
  } catch (err) {
    next(err);
  }
};

