import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware";
import { requireRole } from "../middleware/rbacMiddleware";
import {
  confirmReceivedHandler,
  finalizeHandler,
  getEventsHandler,
  logSortedHandler,
  submitIntentHandler
} from "../controllers/recyclingController";

const router = Router();

router.post("/intent", requireAuth, requireRole("CONSUMER", "ADMIN"), submitIntentHandler);
router.post("/received", requireAuth, requireRole("RECYCLER", "ADMIN"), confirmReceivedHandler);
router.post("/sorted", requireAuth, requireRole("RECYCLER", "ADMIN"), logSortedHandler);
router.post("/finalize", requireAuth, requireRole("RECYCLER", "ADMIN"), finalizeHandler);

router.get("/qr/:qrId/events", requireAuth, getEventsHandler);

export default router;

