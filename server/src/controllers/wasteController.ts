import type { RequestHandler } from "express";
import { z } from "zod";
import {
  classifyWasteType,
  getDisposalInstructions
} from "../services/wasteClassificationService";
import type { WasteType } from "../services/wasteClassificationService";
import { getFullProductIntelligence } from "../services/productIntelligenceService";

const classifySchema = z.object({
  category: z.string().min(1),
  metadata: z.record(z.any()).optional()
});

const detectSchema = z.object({
  image: z.string().min(1) // base64 encoded image
});

export const classifyWasteHandler: RequestHandler = async (req, res, next) => {
  try {
    const { category } = classifySchema.parse(req.body);
    
    try {
      // Use AI Product Intelligence instead of static classification
      const intelligence = await getFullProductIntelligence(category, false);
      
      res.json({ 
        waste_info: intelligence.waste_info,
        product: intelligence.identity,
        intelligence: {
          specs: intelligence.specs,
          management: intelligence.management,
          sustainability: intelligence.sustainability,
          market_value: intelligence.market_value
        }
      });
    } catch (aiError: any) {
      // If AI service fails, fall back to basic classification
      console.error("AI classification failed, using fallback:", aiError.message);
      
      const wasteResult = classifyWasteType(category);
      const disposal = getDisposalInstructions(wasteResult.wasteType);
      
      res.status(200).json({ 
        waste_info: {
          ...wasteResult,
          disposal
        },
        product: {
          name: category,
          brand: "Unknown",
          category: "General",
          release_year: "Unknown"
        },
        intelligence: {
          specs: { notable_features: [] },
          management: { maintenance_tips: [], common_issues: [], optimization_suggestions: [] },
          sustainability: { eco_score: 60, eco_label: "Standard", hazardous_materials: [], carbon_footprint_est: "Unknown", recycling_instructions: disposal },
          market_value: { original_price_est: "Unknown", current_resale_est: "Unknown", trade_in_recommendation: "Contact recycler" }
        },
        fallback: true,
        message: "AI service unavailable, using standard classification"
      });
    }
  } catch (err) {
    next(err);
  }
};

export const detectFromCameraHandler: RequestHandler = async (req, res, next) => {
  try {
    const { image } = detectSchema.parse(req.body);
    
    try {
      // Use the new AI Product Intelligence Service
      const intelligence = await getFullProductIntelligence(image, true);
      res.json({ 
        waste_info: intelligence.waste_info,
        product: intelligence.identity,
        intelligence: {
          specs: intelligence.specs,
          management: intelligence.management,
          sustainability: intelligence.sustainability,
          market_value: intelligence.market_value
        }
      });
    } catch (aiError: any) {
      // If AI service fails, return error with helpful message
      console.error("AI detection failed:", aiError.message);
      res.status(503).json({
        error: {
          code: "AI_SERVICE_UNAVAILABLE",
          message: "Product detection service is temporarily unavailable. Please try again later.",
          details: process.env.NODE_ENV === "development" ? aiError.message : undefined
        }
      });
    }
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
