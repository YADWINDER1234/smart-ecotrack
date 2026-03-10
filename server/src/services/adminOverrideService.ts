import { db } from "../db/connection";
import { randomUUID } from "crypto";
import { publish } from "./notificationService";

export type AdminAction = {
  id: string;
  admin_id: string;
  action_type: "OVERRIDE_COMPLAINT" | "OVERRIDE_QR_STATE" | "OVERRIDE_USER_ROLE" | "OVERRIDE_COMPLAINT_ASSIGN" | "BATCH_UPDATE";
  entity_type: string;
  entity_id: string;
  old_value: any;
  new_value: any;
  reason: string;
  created_at: Date;
};

/**
 * Log admin override action with undo capability
 */
export async function logAdminAction(
  adminId: string,
  actionType: AdminAction["action_type"],
  entityType: string,
  entityId: string,
  oldValue: any,
  newValue: any,
  reason: string
): Promise<AdminAction> {
  const id = randomUUID();
  const now = new Date();
  
  await db("admin_actions").insert({
    id,
    admin_id: adminId,
    action_type: actionType,
    entity_type: entityType,
    entity_id: entityId,
    old_value: JSON.stringify(oldValue),
    new_value: JSON.stringify(newValue),
    reason,
    created_at: now
  });

  return {
    id,
    admin_id: adminId,
    action_type: actionType,
    entity_type: entityType,
    entity_id: entityId,
    old_value: oldValue,
    new_value: newValue,
    reason,
    created_at: now
  };
}

/**
 * Get recent admin actions (for audit trail)
 */
export async function getRecentAdminActions(limit = 50) {
  const rows = await db("admin_actions")
    .orderBy("created_at", "desc")
    .limit(limit);
  
  return rows.map((r: any) => ({
    ...r,
    old_value: JSON.parse(r.old_value || "{}"),
    new_value: JSON.parse(r.new_value || "{}")
  }));
}

/**
 * Override complaint status (force to any status)
 */
export async function overrideComplaintStatus(
  adminId: string,
  complaintId: string,
  newStatus: "OPEN" | "IN_REVIEW" | "RESOLVED" | "REJECTED",
  reason: string
) {
  const complaint = await db("complaints").where({ id: complaintId }).first();
  if (!complaint) throw new Error("Complaint not found");

  const oldStatus = complaint.status;
  await db("complaints").where({ id: complaintId }).update({ status: newStatus, updated_at: new Date() });
  
  await logAdminAction(
    adminId,
    "OVERRIDE_COMPLAINT",
    "complaint",
    complaintId,
    { status: oldStatus },
    { status: newStatus },
    reason
  );

  return { complaintId, oldStatus, newStatus };
}

/**
 * Force QR code state change (bypass state machine)
 */
export async function overrideQRState(
  adminId: string,
  qrId: string,
  newState: string,
  reason: string
) {
  const qr = await db("qr_codes").where({ id: qrId }).first();
  if (!qr) throw new Error("QR code not found");

  const oldState = qr.current_state;
  await db("qr_codes").where({ id: qrId }).update({ current_state: newState, updated_at: new Date() });
  
  await logAdminAction(
    adminId,
    "OVERRIDE_QR_STATE",
    "qr_code",
    qrId,
    { state: oldState },
    { state: newState },
    reason
  );

  publish("qr_state_change", { qrId, from: oldState, to: newState });

  return { qrId, oldState, newState };
}

/**
 * Force assign complaint to recycler
 */
export async function overrideComplaintAssign(
  adminId: string,
  complaintId: string,
  assignedTo: string,
  reason: string
) {
  const complaint = await db("complaints").where({ id: complaintId }).first();
  if (!complaint) throw new Error("Complaint not found");

  const oldAssignedTo = complaint.assigned_to;
  await db("complaints").where({ id: complaintId }).update({ 
    assigned_to: assignedTo,
    status: "IN_REVIEW",
    updated_at: new Date() 
  });
  
  await logAdminAction(
    adminId,
    "OVERRIDE_COMPLAINT_ASSIGN",
    "complaint",
    complaintId,
    { assigned_to: oldAssignedTo },
    { assigned_to: assignedTo },
    reason
  );

  return { complaintId, oldAssignedTo, assignedTo };
}

/**
 * Batch update complaints
 */
export async function batchUpdateComplaints(
  adminId: string,
  complaintIds: string[],
  updates: { status?: string; priority?: string },
  reason: string
) {
  const updated = await db("complaints")
    .whereIn("id", complaintIds)
    .update({ ...updates, updated_at: new Date() });

  await logAdminAction(
    adminId,
    "BATCH_UPDATE",
    "complaints",
    complaintIds.join(","),
    { affectedCount: complaintIds.length },
    { ...updates, affectedCount: updated },
    reason
  );

  return { updated, reason };
}

/**
 * Undo last admin action (if possible)
 */
export async function undoLastAction(adminId: string, actionId: string) {
  const action = await db("admin_actions").where({ id: actionId }).first();
  if (!action) throw new Error("Action not found");
  if (action.admin_id !== adminId) throw new Error("Can only undo your own actions");

  const oldValue = JSON.parse(action.old_value);

  // Restore based on entity type
  if (action.entity_type === "complaint") {
    await db("complaints")
      .where({ id: action.entity_id })
      .update(oldValue);
  } else if (action.entity_type === "qr_code") {
    await db("qr_codes")
      .where({ id: action.entity_id })
      .update(oldValue);
  }

  // Mark action as undone
  await db("admin_actions")
    .where({ id: actionId })
    .update({ undone_at: new Date() });

  return { actionId, restored: oldValue };
}
