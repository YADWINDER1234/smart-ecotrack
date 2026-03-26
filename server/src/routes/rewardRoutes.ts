import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware";
import {
  getMyRewardsHandler,
  redeemRewardHandler,
  getLeaderboardHandler,
  getRedemptionHistoryHandler
} from "../controllers/rewardController";

const router = Router();

// My rewards and balance
router.get("/me", requireAuth, getMyRewardsHandler);

// Redeem points
router.post("/redeem", requireAuth, redeemRewardHandler);

// Leaderboard
router.get("/leaderboard", requireAuth, getLeaderboardHandler);

// My redemption history
router.get("/redemptions", requireAuth, getRedemptionHistoryHandler);

export default router;
