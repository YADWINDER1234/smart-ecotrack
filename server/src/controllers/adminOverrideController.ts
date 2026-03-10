import type { RequestHandler } from "express";
import { z } from "zod";
import {
  overrideComplaintStatus,
  overrideQRState,
  overrideComplaintAssign,
  batchUpdateComplaints,
  getRecentAdminActions,
  undoLastAction,
  logAdminAction
} from "../services/adminOverrideService";
import { autoEscalatePendingComplaints, getPendingMetrics } from "../services/autoEscalationService";

const overrideComplaintSchema = z.object({
  complaintId: z.string().uuid(),
  status: z.enum(["OPEN", "IN_REVIEW", "RESOLVED", "REJECTED"]),
  reason: z.string().min(5)
});

const overrideQRSchema = z.object({
  qrId: z.string().uuid(),
  newState: z.string(),
  reason: z.string().min(5)
});

const assignComplaintSchema = z.object({
  complaintId: z.string().uuid(),
  assignedTo: z.string().uuid(),
  reason: z.string().min(5)
});

const batchUpdateSchema = z.object({
  complaintIds: z.array(z.string().uuid()),
  updates: z.object({
    status: z.enum(["OPEN", "IN_REVIEW", "RESOLVED", "REJECTED"]).optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional()
  }),
  reason: z.string().min(5)
});

/**
 * Override complaint status (ADMIN ONLY)
 */
export const overrideComplaintStatusHandler: RequestHandler = async (req, res, next) => {
  try {
    const { complaintId, status, reason } = overrideComplaintSchema.parse(req.body);
    const adminId = (req.user as any)?.userId;
    
    const result = await overrideComplaintStatus(adminId, complaintId, status, reason);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

/**
 * Override QR state (ADMIN ONLY) - Bypass state machine
 */
export const overrideQRStateHandler: RequestHandler = async (req, res, next) => {
  try {
    const { qrId, newState, reason } = overrideQRSchema.parse(req.body);
    const adminId = (req.user as any)?.userId;
    
    const result = await overrideQRState(adminId, qrId, newState, reason);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

/**
 * Force assign complaint to recycler (ADMIN ONLY)
 */
export const forceAssignComplaintHandler: RequestHandler = async (req, res, next) => {
  try {
    const { complaintId, assignedTo, reason } = assignComplaintSchema.parse(req.body);
    const adminId = (req.user as any)?.userId;
    
    const result = await overrideComplaintAssign(adminId, complaintId, assignedTo, reason);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

/**
 * Batch update complaints (ADMIN ONLY)
 */
export const batchUpdateComplaintsHandler: RequestHandler = async (req, res, next) => {
  try {
    const { complaintIds, updates, reason } = batchUpdateSchema.parse(req.body);
    const adminId = (req.user as any)?.userId;
    
    const result = await batchUpdateComplaints(adminId, complaintIds, updates, reason);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

/**
 * Get admin action history (ADMIN ONLY)
 */
export const getAdminActionHistoryHandler: RequestHandler = async (req, res, next) => {
  try {
    const actions = await getRecentAdminActions(50);
    res.json({ actions });
  } catch (err) {
    next(err);
  }
};

/**
 * Undo last admin action (ADMIN ONLY)
 */
export const undoActionHandler: RequestHandler = async (req, res, next) => {
  try {
    const { actionId } = z.object({ actionId: z.string().uuid() }).parse(req.body);
    const adminId = (req.user as any)?.userId;
    
    const result = await undoLastAction(adminId, actionId);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

/**
 * Trigger auto-escalation manually (ADMIN ONLY)
 */
export const triggerAutoEscalationHandler: RequestHandler = async (req, res, next) => {
  try {
    const result = await autoEscalatePendingComplaints();
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

/**
 * Get pending metrics (open complaints, overdue items) (ADMIN ONLY)
 */
export const getPendingMetricsHandler: RequestHandler = async (req, res, next) => {
  try {
    const metrics = await getPendingMetrics();
    res.json({ metrics });
  } catch (err) {
    next(err);
  }
};
