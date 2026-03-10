import type { RequestHandler } from "express";
import { z } from "zod";
import { transitionWorkflow, getWorkflowEvents } from "../services/workflowService";
import { decodeQrToken } from "../services/qrService";

const baseSchema = z.object({
  qr_id: z.string().min(10),
  notes: z.string().max(2000).optional()
});

export const intentSchema = baseSchema;
export const receivedSchema = baseSchema;
export const sortedSchema = baseSchema;
export const finalizeSchema = baseSchema.extend({
  evidence_url: z.string().url().optional()
});

export const submitIntentHandler: RequestHandler = async (req, res, next) => {
  try {
    const { qr_id: token, notes } = intentSchema.parse(req.body);
    const payload = decodeQrToken(token);
    const result = await transitionWorkflow({
      qrId: payload.qr_id,
      actorId: req.user!.id,
      actorRole: req.user!.role,
      targetState: "INTENT_SUBMITTED",
      notes
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const confirmReceivedHandler: RequestHandler = async (req, res, next) => {
  try {
    const { qr_id: token, notes } = receivedSchema.parse(req.body);
    const payload = decodeQrToken(token);
    const result = await transitionWorkflow({
      qrId: payload.qr_id,
      actorId: req.user!.id,
      actorRole: req.user!.role,
      targetState: "RECEIVED",
      notes
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const logSortedHandler: RequestHandler = async (req, res, next) => {
  try {
    const { qr_id: token, notes } = sortedSchema.parse(req.body);
    const payload = decodeQrToken(token);
    const result = await transitionWorkflow({
      qrId: payload.qr_id,
      actorId: req.user!.id,
      actorRole: req.user!.role,
      targetState: "SORTED",
      notes
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const finalizeHandler: RequestHandler = async (req, res, next) => {
  try {
    const { qr_id: token, notes, evidence_url } = finalizeSchema.parse(req.body);
    const payload = decodeQrToken(token);
    const result = await transitionWorkflow({
      qrId: payload.qr_id,
      actorId: req.user!.id,
      actorRole: req.user!.role,
      targetState: "FINAL_DISPOSITION",
      notes,
      evidence_url: evidence_url ?? null
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getEventsHandler: RequestHandler = async (req, res, next) => {
  try {
    const token = req.params.qrId;
    const payload = decodeQrToken(token);
    const result = await getWorkflowEvents(payload.qr_id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

