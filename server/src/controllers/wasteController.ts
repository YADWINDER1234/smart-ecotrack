import type { RequestHandler } from "express";
import { z } from "zod";
import {
  classifyWasteType,
  classifyFromImage,
  getDisposalInstructions
} from "../services/wasteClassificationService";
import type { WasteType } from "../services/wasteClassificationService";

const classifySchema = z.object({
  category: z.string().min(1),
  metadata: z.record(z.any()).optional()
});

const detectSchema = z.object({
  image: z.string().min(1) // base64 encoded image
});

export const classifyWasteHandler: RequestHandler = async (req, res, next) => {
  try {
    const { category, metadata } = classifySchema.parse(req.body);
    const result = classifyWasteType(category, metadata);
    const disposal = getDisposalInstructions(result.wasteType);
    res.json({ ...result, disposal });
  } catch (err) {
    next(err);
  }
};

export const detectFromCameraHandler: RequestHandler = async (req, res, next) => {
  try {
    const { image } = detectSchema.parse(req.body);
    const result = classifyFromImage(image);
    const disposal = getDisposalInstructions(result.wasteType);
    res.json({ ...result, disposal });
  } catch (err) {
    next(err);
  }
};

export const getDisposalGuideHandler: RequestHandler = async (req, res, next) => {
  try {
    const wasteType = req.params.wasteType.toUpperCase() as WasteType;
    const validTypes: WasteType[] = ["PLASTIC", "METAL", "GLASS", "PAPER", "ORGANIC", "EWASTE", "HAZARDOUS", "GENERAL"];
    if (!validTypes.includes(wasteType)) {
      return res.status(400).json({ error: { code: "INVALID_WASTE_TYPE", message: `Invalid waste type: ${req.params.wasteType}` } });
    }
    const result = getDisposalInstructions(wasteType);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
