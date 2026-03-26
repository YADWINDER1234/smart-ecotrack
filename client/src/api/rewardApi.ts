import { httpClient } from "./httpClient";

export async function fetchMyRewards() {
  const { data } = await httpClient.get("/rewards/me");
  return data;
}

export async function redeemReward(input: {
  pointsToSpend: number;
  rewardType: string;
  description?: string;
}) {
  const { data } = await httpClient.post("/rewards/redeem", input);
  return data;
}

export async function fetchLeaderboard() {
  const { data } = await httpClient.get("/rewards/leaderboard");
  return data;
}

export async function fetchRedemptions() {
  const { data } = await httpClient.get("/rewards/redemptions");
  return data;
}
