import { Router } from "express";
import { requireAuth, optionalAuth } from "../middleware/authMiddleware";
import { requireRole } from "../middleware/rbacMiddleware";
import { validateBody } from "../middleware/validation";
import {
  generateQrHandler,
  generateQrSchema,
  revokeQrHandler,
  scanQrHandler,
  aiScanHandler
} from "../controllers/qrController";

const router = Router();

router.post("/scan", optionalAuth, scanQrHandler);
router.post("/ai-scan", optionalAuth, aiScanHandler);

router.post(
  "/admin/products/:id/qr",
  requireAuth,
  requireRole("ADMIN", "MANUFACTURER"),
  validateBody(generateQrSchema),
  generateQrHandler
);

router.post("/admin/qr/:id/revoke", requireAuth, requireRole("ADMIN"), revokeQrHandler);

export default router;

