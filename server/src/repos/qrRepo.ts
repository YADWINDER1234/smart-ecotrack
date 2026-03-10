import { db } from "../db/connection";
import type { LifecycleState } from "../stateMachine/qrStateMachine";

// WorkflowState is used across services to model the current stable states
export type WorkflowState = LifecycleState;

export type QrStatus = "ACTIVE" | "REVOKED";

export type QrRow = {
  id: string;
  product_id: string;
  token_hash: string;
  expiry: Date;
  status: QrStatus;
  current_state: LifecycleState;
  lifecycle_state: LifecycleState;
  previous_state?: string | null;
  updated_by?: string | null;
  state_updated_at?: Date | null;
  is_fraud: boolean;
  created_at: Date;
  updated_at: Date;
};

export async function insertQrCode(input: {
  id: string;
  product_id: string;
  token_hash: string;
  expiry: Date;
  status: QrStatus;
  current_state: LifecycleState;
  lifecycle_state?: LifecycleState;
}): Promise<void> {
  await db("qr_codes").insert({ ...input });
}

export async function findQrById(id: string): Promise<QrRow | null> {
  const row = await db<QrRow>("qr_codes").where({ id }).first();
  return row ?? null;
}

export async function updateQrStatus(id: string, status: QrStatus): Promise<void> {
  await db("qr_codes").where({ id }).update({ status, updated_at: db.fn.now() });
}

export async function updateQrState(id: string, nextState: LifecycleState, actorId?: string | null): Promise<void> {
  const existing = await findQrById(id);
  await db("qr_codes")
    .where({ id })
    .update({
      previous_state: existing?.lifecycle_state ?? null,
      lifecycle_state: nextState,
      updated_by: actorId ?? null,
      state_updated_at: db.fn.now(),
      updated_at: db.fn.now()
    });
}

export async function markQrFraud(id: string, actorId?: string | null): Promise<void> {
  await db("qr_codes").where({ id }).update({ is_fraud: true, status: "REVOKED", updated_at: db.fn.now() });
}

