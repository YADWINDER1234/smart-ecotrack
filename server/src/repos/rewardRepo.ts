import { db } from "../db/connection";

export interface RewardRow {
  id: string;
  user_id: string;
  points: number;
  reason: string;
  source_event_id: string | null;
  created_at: Date;
}

export interface RedemptionRow {
  id: string;
  user_id: string;
  points_spent: number;
  reward_type: string;
  description: string | null;
  created_at: Date;
}

export async function insertReward(reward: Partial<RewardRow>): Promise<void> {
  await db("rewards").insert(reward);
}

export async function getRewardsByUser(userId: string): Promise<RewardRow[]> {
  return db("rewards").where({ user_id: userId }).orderBy("created_at", "desc");
}

export async function getTotalPointsByUser(userId: string): Promise<number> {
  const earned = await db("rewards")
    .where({ user_id: userId })
    .sum<{ total: string }>("points as total")
    .first();
  const spent = await db("reward_redemptions")
    .where({ user_id: userId })
    .sum<{ total: string }>("points_spent as total")
    .first();
  return Number(earned?.total ?? 0) - Number(spent?.total ?? 0);
}

export async function insertRedemption(redemption: Partial<RedemptionRow>): Promise<void> {
  await db("reward_redemptions").insert(redemption);
}

export async function getRedemptionsByUser(userId: string): Promise<RedemptionRow[]> {
  return db("reward_redemptions").where({ user_id: userId }).orderBy("created_at", "desc");
}

export async function getLeaderboard(limit = 20): Promise<Array<{ user_id: string; name: string; total_points: number }>> {
  return db("rewards")
    .select("rewards.user_id", "users.name")
    .sum("rewards.points as total_points")
    .join("users", "rewards.user_id", "users.id")
    .groupBy("rewards.user_id", "users.name")
    .orderBy("total_points", "desc")
    .limit(limit) as any;
}
