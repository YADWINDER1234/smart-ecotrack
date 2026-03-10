import { db } from "../db/connection";

export async function insertScanLog(input: {
  id: string;
  qr_id: string;
  user_id: string | null;
  timestamp: Date;
  outcome: string;
  ip: string | null;
  user_agent: string | null;
}): Promise<void> {
  await db("scan_logs").insert(input);
}

