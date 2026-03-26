import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware";
import {
  getLedgerHandler,
  verifyIntegrityHandler
} from "../controllers/blockchainController";

const router = Router();

// Full blockchain ledger
router.get("/ledger", requireAuth, getLedgerHandler);

// Verify chain integrity
router.get("/verify", requireAuth, verifyIntegrityHandler);

export default router;
