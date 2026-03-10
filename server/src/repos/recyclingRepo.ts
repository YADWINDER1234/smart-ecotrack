import { db } from "../db/connection";
import type { WorkflowState } from "./qrRepo";

export type RecyclingEventRow = {
  id: string;
  qr_id: string;
  actor_id: string;
  event_type: WorkflowState;
  timestamp: Date;
  evidence_url: string | null;
  notes: string | null;
  created_at: Date;
};

export async function insertRecyclingEvent(input: {
  id: string;
  qr_id: string;
  actor_id: string;
  event_type: WorkflowState;
  timestamp: Date;
  evidence_url: string | null;
  notes: string | null;
}): Promise<void> {
  await db("recycling_events").insert({
    ...input,
    created_at: db.fn.now()
  });
}

export async function listRecyclingEventsForQr(qrId: string): Promise<RecyclingEventRow[]> {
  return db<RecyclingEventRow>("recycling_events")
    .where({ qr_id: qrId })
    .orderBy("timestamp", "asc");
}

