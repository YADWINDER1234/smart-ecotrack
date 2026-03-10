import type { RequestHandler } from "express";
import { z } from "zod";
import { fileComplaint, assignComplaint, updateComplaintStatus } from "../services/complaintService";
import { validateBody } from "../middleware/validation";
import * as repo from "../repos/complaintRepo";

export const fileComplaintSchema = z.object({
  productId: z.string().uuid(),
  qrId: z.string().uuid().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  description: z.string().optional(),
  imageUrl: z.string().url().optional()
});

export const createComplaintHandler: RequestHandler = async (req, res, next) => {
  try {
    const body = fileComplaintSchema.parse(req.body);
    const filedBy = req.user!.id;
    const id = await fileComplaint({
      productId: body.productId,
      qrId: body.qrId ?? null,
      filedBy,
      priority: body.priority as any,
      description: body.description ?? null,
      imageUrl: body.imageUrl ?? null
    });
    res.status(201).json({ id });
  } catch (err) {
    next(err);
  }
};

export const listOpenComplaintsHandler: RequestHandler = async (_req, res, next) => {
  try {
    const rows = await repo.listOpenComplaints();
    res.json({ complaints: rows });
  } catch (err) {
    next(err);
  }
};

export const assignComplaintHandler: RequestHandler = async (req, res, next) => {
  try {
    const complaintId = req.params.id;
    const adminId = req.user!.id;
    await assignComplaint(complaintId, adminId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const updateComplaintHandler: RequestHandler = async (req, res, next) => {
  try {
    const complaintId = req.params.id;
    const { status, responseMessage } = req.body as { status?: string; responseMessage?: string };
    if (!status) return res.status(400).json({ error: "Missing status" });
    await updateComplaintStatus(complaintId, status as any, req.user!.id, responseMessage);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const getComplaintHandler: RequestHandler = async (req, res, next) => {
  try {
    const id = req.params.id;
    const row = await repo.findComplaintById(id);
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json({ complaint: row });
  } catch (err) {
    next(err);
  }
};

export const listMyComplaintsHandler: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const rows = await repo.listComplaintsByUser(userId);
    res.json({ complaints: rows });
  } catch (err) {
    next(err);
  }
};

export const listRecyclerComplaintsHandler: RequestHandler = async (_req, res, next) => {
  try {
    const rows = await repo.listComplaintsForRecycler();
    res.json({ complaints: rows });
  } catch (err) {
    next(err);
  }
};
