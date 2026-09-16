import { randomUUID } from "crypto";
import { AppError } from "../utils/errors";
import type { Role } from "../types/role";
import type { WorkflowState } from "../repos/qrRepo";
import { findQrById } from "../repos/qrRepo";
import { findProductById } from "../repos/productRepo";
import { db } from "../db/connection";
import { listRecyclingEventsForQr } from "../repos/recyclingRepo";
import { audit } from "./auditService";
import { publish } from "./notificationService"; // for realtime updates
import { awardPoints } from "./rewardService";
import { recordToBlockchain } from "./blockchainService";
import { classifyWasteType } from "./wasteClassificationService";

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

  // Determine waste type for reward multiplier
  const product = await findProductById(qr.product_id);
  const wasteInfo = product
    ? classifyWasteType(product.category, product.metadata_json)
    : null;
  const wasteCategory = wasteInfo?.wasteType || "GENERAL";

  const now = new Date();
  const eventId = randomUUID();

  await db.transaction(async (trx) => {
    await trx("qr_codes").where({ id: qr.id }).update({
      current_state: target,
      lifecycle_state: target,
      updated_at: trx.fn.now()
    });

    await trx("recycling_events").insert({
      id: eventId,
      qr_id: qr.id,
      actor_id: input.actorId,
      event_type: target,
      timestamp: now,
      evidence_url: input.evidence_url ?? null,
      notes: input.notes ?? null,
      waste_category: wasteCategory,
      reward_points_awarded: 0,
      created_at: trx.fn.now()
    });
  });

  // Award reward points (with waste-type multiplier)
  try {
    const reward = await awardPoints({
      userId: input.actorId,
      eventType: target,
      wasteType: wasteCategory,
      sourceEventId: eventId
    });
    await db("recycling_events")
      .where({ id: eventId })
      .update({ reward_points_awarded: reward.pointsAwarded });
  } catch (err) {
    console.error("[REWARD] Failed to award points:", err);
  }

  // Record to blockchain hash-chain at FINAL_DISPOSITION
  if (target === "FINAL_DISPOSITION") {
    try {
      await recordToBlockchain(eventId, {
        qrId: qr.id,
        actorId: input.actorId,
        productId: qr.product_id,
        eventType: target,
        wasteCategory,
        timestamp: now.toISOString()
      });
    } catch (err) {
      console.error("[BLOCKCHAIN] Failed to record:", err);
    }
  }

  await audit({
    actorId: input.actorId,
    action: "WORKFLOW_TRANSITION",
    entityType: "qr_code",
    entityId: qr.id,
    metadata: { from: current, to: target, wasteCategory }
  });

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
