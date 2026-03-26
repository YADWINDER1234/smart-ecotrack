import type { RequestHandler } from "express";
import { z } from "zod";
import {
  getRewardHistory,
  getBalance,
  redeemReward,
  getRedemptionHistory,
  getLeaderboard
} from "../services/rewardService";

const redeemSchema = z.object({
  pointsToSpend: z.number().int().positive(),
  rewardType: z.enum(["DISCOUNT_CODE", "ECO_CREDIT", "GIFT_CARD", "TREE_PLANT"]),
  description: z.string().max(500).optional()
});

export const getMyRewardsHandler: RequestHandler = async (req, res, next) => {
  try {
    const [rewards, balance] = await Promise.all([
      getRewardHistory(req.user!.id),
      getBalance(req.user!.id)
    ]);
    res.json({ balance, rewards });
  } catch (err) {
    next(err);
  }
};

export const redeemRewardHandler: RequestHandler = async (req, res, next) => {
  try {
    const data = redeemSchema.parse(req.body);
    const result = await redeemReward({
      userId: req.user!.id,
      ...data
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getLeaderboardHandler: RequestHandler = async (_req, res, next) => {
  try {
    const leaderboard = await getLeaderboard();
    res.json({ leaderboard });
  } catch (err) {
    next(err);
  }
};

export const getRedemptionHistoryHandler: RequestHandler = async (req, res, next) => {
  try {
    const redemptions = await getRedemptionHistory(req.user!.id);
    res.json({ redemptions });
  } catch (err) {
    next(err);
  }
};
