import { db } from "../db/connection";

export interface BlockRow {
  id: number;
  event_id: string;
  data_hash: string;
  prev_hash: string;
  created_at: Date;
}

export async function getLastBlock(): Promise<BlockRow | undefined> {
  return db("blockchain_ledger").orderBy("id", "desc").first();
}

export async function insertBlock(block: Omit<BlockRow, "id" | "created_at">): Promise<void> {
  await db("blockchain_ledger").insert(block);
}

export async function getFullChain(): Promise<BlockRow[]> {
  return db("blockchain_ledger").orderBy("id", "asc");
}

export async function getChainLength(): Promise<number> {
  const row = await db("blockchain_ledger").count<{ count: string }>("* as count").first();
  return Number(row?.count ?? 0);
}
