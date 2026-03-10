import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware";
import { sseSubscribeHandler } from "../controllers/notificationController";

const router = Router();

router.get("/stream", requireAuth, sseSubscribeHandler);

export default router;
