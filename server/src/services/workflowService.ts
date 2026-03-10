import { randomUUID } from "crypto";
import { AppError } from "../utils/errors";
import type { Role } from "../types/role";
import type { WorkflowState } from "../repos/qrRepo";
import { findQrById } from "../repos/qrRepo";
import { db } from "../db/connection";
import { listRecyclingEventsForQr } from "../repos/recyclingRepo";
import { audit } from "./auditService";
import { publish } from "./notificationService"; // for realtime updates

// only a subset of states are user-visible transitions; other states exist but
// they start empty.
const allowedTransitions: Partial<Record<WorkflowState, WorkflowState[]>> = {
  SCAN: ["INTENT_SUBMITTED"],
  INTENT_SUBMITTED: ["RECEIVED"],
  RECEIVED: ["SORTED"],
  SORTED: ["FINAL_DISPOSITION"],
  FINAL_DISPOSITION: []
};

function canTransition(from: WorkflowState, to: WorkflowState): boolean {
  return allowedTransitions[from]?.includes(to) ?? false;
}

function roleCanTransition(role: Role, target: WorkflowState): boolean {
  if (target === "INTENT_SUBMITTED") return role === "CONSUMER" || role === "ADMIN";
  if (target === "RECEIVED" || target === "SORTED" || target === "FINAL_DISPOSITION") {
    return role === "RECYCLER" || role === "ADMIN";
  }
  return false;
}

export async function transitionWorkflow(input: {
  qrId: string;
  actorId: string;
  actorRole: Role;
  targetState: WorkflowState;
  notes?: string | null;
  evidence_url?: string | null;
}) {
  if (!roleCanTransition(input.actorRole, input.targetState)) {
    throw new AppError("Forbidden for role", 403, "FORBIDDEN");
  }

  const qr = await findQrById(input.qrId);
  if (!qr) throw new AppError("QR not found", 404, "QR_NOT_FOUND");
  if (qr.status !== "ACTIVE") throw new AppError("QR revoked", 409, "QR_REVOKED");

  const current = qr.current_state;
  const target = input.targetState;
  if (!canTransition(current, target)) {
    throw new AppError(
      `Invalid transition ${current} -> ${target}`,
      409,
      "INVALID_TRANSITION"
    );
  }

  const now = new Date();

  await db.transaction(async (trx) => {
    await trx("qr_codes").where({ id: qr.id }).update({
      current_state: target,
      updated_at: trx.fn.now()
    });

    await trx("recycling_events").insert({
      id: randomUUID(),
      qr_id: qr.id,
      actor_id: input.actorId,
      event_type: target,
      timestamp: now,
      evidence_url: input.evidence_url ?? null,
      notes: input.notes ?? null,
      created_at: trx.fn.now()
    });
  });

  await audit({
    actorId: input.actorId,
    action: "WORKFLOW_TRANSITION",
    entityType: "qr_code",
    entityId: qr.id,
    metadata: { from: current, to: target }
  });

  // notify anybody listening (dashboard charts etc.)
  publish("qr_state_change", { qrId: qr.id, from: current, to: target });

  const updated = await findQrById(qr.id);
  return { qr: updated };
}

export async function getWorkflowEvents(qrId: string) {
  const qr = await findQrById(qrId);
  if (!qr) throw new AppError("QR not found", 404, "QR_NOT_FOUND");
  const events = await listRecyclingEventsForQr(qrId);
  return { qr, events };
}

