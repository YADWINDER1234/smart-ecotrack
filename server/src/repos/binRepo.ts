import { db } from "../db/connection";

export type BinType = "GENERAL" | "PLASTIC" | "METAL" | "GLASS" | "PAPER" | "ORGANIC" | "EWASTE";
export type BinStatus = "ACTIVE" | "FULL" | "MAINTENANCE";

export interface BinRow {
  id: string;
  name: string;
  location_lat: number;
  location_lng: number;
  bin_type: BinType;
  fill_level: number;
  weight_kg: number;
  gas_level: number;
  status: BinStatus;
  last_reading_at: Date | null;
  predicted_overflow_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export async function insertBin(bin: Partial<BinRow>): Promise<void> {
  await db("bins").insert(bin);
}

export async function findAllBins(): Promise<BinRow[]> {
  return db("bins").select("*").orderBy("created_at", "desc");
}

export async function findBinById(id: string): Promise<BinRow | undefined> {
  return db("bins").where({ id }).first();
}

export async function updateBin(id: string, data: Partial<BinRow>): Promise<void> {
  await db("bins").where({ id }).update({ ...data, updated_at: new Date() });
}

export async function updateBinSensorData(
  id: string,
  data: { fill_level?: number; weight_kg?: number; gas_level?: number }
): Promise<void> {
  const update: Record<string, any> = { ...data, last_reading_at: new Date(), updated_at: new Date() };
  if (data.fill_level !== undefined && data.fill_level >= 95) {
    update.status = "FULL";
  }
  await db("bins").where({ id }).update(update);
}

export async function findBinsByType(binType: BinType): Promise<BinRow[]> {
  return db("bins").where({ bin_type: binType }).orderBy("fill_level", "desc");
}

export async function findBinsNearingFull(threshold = 80): Promise<BinRow[]> {
  return db("bins")
    .where("fill_level", ">=", threshold)
    .where("status", "!=", "MAINTENANCE")
    .orderBy("fill_level", "desc");
}

export async function getBinStats(): Promise<{
  total: number;
  nearFull: number;
  full: number;
  avgFill: number;
}> {
  const totalRow = await db("bins").count<{ count: string }>("* as count").first();
  const nearFullRow = await db("bins")
    .where("fill_level", ">=", 80)
    .where("fill_level", "<", 95)
    .count<{ count: string }>("* as count")
    .first();
  const fullRow = await db("bins")
    .where("fill_level", ">=", 95)
    .count<{ count: string }>("* as count")
    .first();
  const avgRow = await db("bins")
    .avg<{ avg: string }>("fill_level as avg")
    .first();

  return {
    total: Number(totalRow?.count ?? 0),
    nearFull: Number(nearFullRow?.count ?? 0),
    full: Number(fullRow?.count ?? 0),
    avgFill: Number(avgRow?.avg ?? 0)
  };
}
