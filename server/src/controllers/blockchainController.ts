import type { RequestHandler } from "express";
import {
  getBlockchainLedger,
  verifyBlockchainIntegrity
} from "../services/blockchainService";

export const getLedgerHandler: RequestHandler = async (_req, res, next) => {
  try {
    const ledger = await getBlockchainLedger();
    res.json({ ledger });
  } catch (err) {
    next(err);
  }
};

export const verifyIntegrityHandler: RequestHandler = async (_req, res, next) => {
  try {
    const result = await verifyBlockchainIntegrity();
    res.json(result);
  } catch (err) {
    next(err);
  }
};
