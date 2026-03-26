import { randomUUID } from "crypto";
import { db } from "../db/connection";
import {
  insertReward,
  getRewardsByUser,
  getTotalPointsByUser,
  insertRedemption,
  getRedemptionsByUser,
  getLeaderboard as repoLeaderboard
} from "../repos/rewardRepo";
import { AppError } from "../utils/errors";

const BASE_POINTS: Record<string, number> = {
  INTENT_SUBMITTED: 5,
  RECEIVED: 10,
  SORTED: 15,
  FINAL_DISPOSITION: 25
};

export function getRewardMultiplier(wasteType?: string): number {
  if (!wasteType) return 1;
  switch (wasteType.toUpperCase()) {
    case "HAZARDOUS":
      return 3;
    case "EWASTE":
      return 2;
    default:
      return 1;
  }
}

export async function awardPoints(input: {
  userId: string;
  eventType: string;
  wasteType?: string;
  sourceEventId?: string;
}): Promise<{ pointsAwarded: number }> {
  const base = BASE_POINTS[input.eventType] || 5;
  const multiplier = getRewardMultiplier(input.wasteType);
  const points = base * multiplier;
  const reason = `${input.eventType}${multiplier > 1 ? ` (${multiplier}x ${input.wasteType} bonus)` : ""}`;

  await insertReward({
    id: randomUUID(),
    user_id: input.userId,
    points,
    reason,
    source_event_id: input.sourceEventId || null
  });

  // Also update the user's total points column for quick access
  await db("users").where({ id: input.userId }).increment("points", points);

  return { pointsAwarded: points };
}

export async function getRewardHistory(userId: string) {
  return getRewardsByUser(userId);
}

export async function getBalance(userId: string): Promise<number> {
  return getTotalPointsByUser(userId);
}

export async function redeemReward(input: {
  userId: string;
  pointsToSpend: number;
  rewardType: string;
  description?: string;
}): Promise<{ success: boolean; remainingBalance: number }> {
  const balance = await getTotalPointsByUser(input.userId);
  if (balance < input.pointsToSpend) {
    throw new AppError(
      `Insufficient points. Balance: ${balance}, requested: ${input.pointsToSpend}`,
      400,
      "INSUFFICIENT_POINTS"
    );
  }

  await insertRedemption({
    id: randomUUID(),
    user_id: input.userId,
    points_spent: input.pointsToSpend,
    reward_type: input.rewardType,
    description: input.description || null
  });

  // Deduct from user's quick-access points column
  await db("users").where({ id: input.userId }).decrement("points", input.pointsToSpend);

  const remainingBalance = await getTotalPointsByUser(input.userId);
  return { success: true, remainingBalance };
}

export async function getRedemptionHistory(userId: string) {
  return getRedemptionsByUser(userId);
}

export async function getLeaderboard(limit = 20) {
  return repoLeaderboard(limit);
}
