import type { RequestHandler } from "express";
import { z } from "zod";
import {
  getAllBins,
  getBinById,
  createBin,
  updateBinSensorData,
  predictOverflow,
  getBinStats
} from "../services/binService";

const createBinSchema = z.object({
  name: z.string().min(1).max(100),
  location_lat: z.number().min(-90).max(90),
  location_lng: z.number().min(-180).max(180),
  bin_type: z
    .enum(["GENERAL", "PLASTIC", "METAL", "GLASS", "PAPER", "ORGANIC", "EWASTE"])
    .optional()
});

const sensorDataSchema = z.object({
  fill_level: z.number().min(0).max(100).optional(),
  weight_kg: z.number().min(0).optional(),
  gas_level: z.number().min(0).optional()
});

export const listBinsHandler: RequestHandler = async (_req, res, next) => {
  try {
    const bins = await getAllBins();
    res.json({ bins });
  } catch (err) {
    next(err);
  }
};

export const getBinHandler: RequestHandler = async (req, res, next) => {
  try {
    const bin = await getBinById(req.params.id);
    res.json(bin);
  } catch (err) {
    next(err);
  }
};

export const createBinHandler: RequestHandler = async (req, res, next) => {
  try {
    const data = createBinSchema.parse(req.body);
    const result = await createBin(data);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const ingestSensorDataHandler: RequestHandler = async (req, res, next) => {
  try {
    const data = sensorDataSchema.parse(req.body);
    const bin = await updateBinSensorData(req.params.id, data);
    res.json(bin);
  } catch (err) {
    next(err);
  }
};

export const getBinStatsHandler: RequestHandler = async (_req, res, next) => {
  try {
    const stats = await getBinStats();
    res.json(stats);
  } catch (err) {
    next(err);
  }
};

export const getOverflowPredictionHandler: RequestHandler = async (req, res, next) => {
  try {
    const prediction = await predictOverflow(req.params.id);
    res.json(prediction);
  } catch (err) {
    next(err);
  }
};
