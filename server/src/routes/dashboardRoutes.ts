import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware";
import { requireRole } from "../middleware/rbacMiddleware";
import {
  adminDashboardHandler,
  manufacturerDashboardHandler
} from "../controllers/dashboardController";
import { listAuditHandler } from "../controllers/auditController";

const router = Router();

router.get("/admin", requireAuth, requireRole("ADMIN"), adminDashboardHandler);
router.get(
  "/manufacturer",
  requireAuth,
  requireRole("MANUFACTURER"),
  manufacturerDashboardHandler
);

router.get("/audit", requireAuth, requireRole("ADMIN"), listAuditHandler);

export default router;

