import { randomUUID } from "crypto";
import { insertAuditLog } from "../repos/auditRepo";
import { publish } from "./notificationService";

export async function audit(input: {
  actorId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata?: any;
}) {
  await insertAuditLog({
    id: randomUUID(),
    actor_id: input.actorId,
    action: input.action,
    entity_type: input.entityType,
    entity_id: input.entityId,
    metadata_json: input.metadata ?? null
  });

  try {
    // publish lightweight notification
    publish("audit", {
      actorId: input.actorId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      metadata: input.metadata ?? null,
      timestamp: new Date().toISOString()
    });
  } catch {
    // swallow publish errors
  }
}

