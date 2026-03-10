import type { RequestHandler } from "express";
import { listAuditLogs } from "../repos/auditRepo";

export const listAuditHandler: RequestHandler = async (req, res, next) => {
  try {
    const rows = await listAuditLogs(200);
    res.json({ logs: rows });
  } catch (err) {
    next(err);
  }
};
