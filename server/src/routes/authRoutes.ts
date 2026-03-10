import { Router } from "express";
import { validateBody } from "../middleware/validation";
import { requireAuth } from "../middleware/authMiddleware";
import {
  registerHandler,
  loginHandler,
  meHandler,
  registerSchema,
  loginSchema
} from "../controllers/authController";
import { refreshHandler, logoutHandler } from "../controllers/authController";

const router = Router();

router.post("/register", validateBody(registerSchema), registerHandler);
router.post("/login", validateBody(loginSchema), loginHandler);
router.get("/me", requireAuth, meHandler);
router.post("/refresh", refreshHandler);
router.post("/logout", requireAuth, logoutHandler);

export default router;

