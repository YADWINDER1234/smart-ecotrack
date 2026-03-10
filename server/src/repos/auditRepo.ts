import { db } from "../db/connection";

export async function insertAuditLog(input: {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata_json?: any;
}): Promise<void> {
  await db("audit_logs").insert({
    ...input,
    metadata_json: input.metadata_json ?? null,
    created_at: db.fn.now()
  });
}

export async function listAuditLogs(limit = 100) {
  return await db("audit_logs").select("id", "actor_id", "action", "entity_type", "entity_id", "metadata_json", "created_at").orderBy("created_at", "desc").limit(limit);
}

