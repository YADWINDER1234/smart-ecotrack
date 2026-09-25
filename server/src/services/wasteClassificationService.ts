export type WasteType = "PLASTIC" | "METAL" | "GLASS" | "PAPER" | "ORGANIC" | "EWASTE" | "HAZARDOUS" | "GENERAL";

const CATEGORY_MAP: Record<string, WasteType> = {
  electronics: "EWASTE",
  battery: "HAZARDOUS",
  batteries: "HAZARDOUS",
  chemical: "HAZARDOUS",
  pesticide: "HAZARDOUS",
  paint: "HAZARDOUS",
  "e-waste": "EWASTE",
  ewaste: "EWASTE",
  computer: "EWASTE",
  phone: "EWASTE",
  plastic: "PLASTIC",
  bottle: "PLASTIC",
  packaging: "PLASTIC",
  metal: "METAL",
  aluminum: "METAL",
  can: "METAL",
  steel: "METAL",
  glass: "GLASS",
  jar: "GLASS",
  paper: "PAPER",
  cardboard: "PAPER",
  newspaper: "PAPER",
  food: "ORGANIC",
  organic: "ORGANIC",
  garden: "ORGANIC",
  textile: "GENERAL",
  wood: "GENERAL"
};

const BIN_TYPE_MAP: Record<WasteType, string> = {
  PLASTIC: "PLASTIC",
  METAL: "METAL",
  GLASS: "GLASS",
  PAPER: "PAPER",
  ORGANIC: "ORGANIC",
  EWASTE: "EWASTE",
  HAZARDOUS: "EWASTE",
  GENERAL: "GENERAL"
};

const DISPOSAL_INSTRUCTIONS: Record<WasteType, string> = {
  PLASTIC: "Rinse the item, remove any labels or caps, and place in the PLASTIC recycling bin. Avoid contaminating with food residue.",
  METAL: "Clean the metal item, crush cans if possible, and place in the METAL recycling bin. Remove any non-metal attachments.",
  GLASS: "Handle carefully. Remove lids/caps, rinse, and place in the GLASS recycling bin. Do not mix with ceramics.",
  PAPER: "Keep dry and clean. Remove any plastic coatings or staples. Place in the PAPER recycling bin. Do not include waxed paper.",
  ORGANIC: "Place food scraps, garden waste, and biodegradable items in the ORGANIC compost bin. No plastic bags.",
  EWASTE: "⚠️ E-WASTE: This item contains electronic components. Do NOT place in regular bins. Take to a designated e-waste collection center.",
  HAZARDOUS: "⚠️ HAZARDOUS WASTE: This item contains dangerous materials. Do NOT place in any regular bin. Take to a certified hazardous waste disposal facility.",
  GENERAL: "Place in the GENERAL waste bin. Consider if the item could be recycled or repurposed before disposal."
};

// Simulated CNN confidence scores for demo purposes
const SIMULATED_CNN_RESULTS: Record<string, { wasteType: WasteType; confidence: number }> = {
  default: { wasteType: "GENERAL", confidence: 0.65 }
};

export function classifyWasteType(
  category: string,
  metadata?: Record<string, any>
): { wasteType: WasteType; targetBin: string; confidence: number } {
  const normalizedCategory = (category || "").toLowerCase().trim();

  // Check metadata for specific waste type hints
  if (metadata?.wasteType && Object.keys(BIN_TYPE_MAP).includes(metadata.wasteType)) {
    return {
      wasteType: metadata.wasteType as WasteType,
      targetBin: BIN_TYPE_MAP[metadata.wasteType as WasteType],
      confidence: 0.95
    };
  }

  // Check hazardous indicators in metadata
  if (metadata?.hazardSafety !== undefined && Number(metadata.hazardSafety) < 0.3) {
    return { wasteType: "HAZARDOUS", targetBin: "EWASTE", confidence: 0.85 };
  }

  // Check category map
  for (const [keyword, wasteType] of Object.entries(CATEGORY_MAP)) {
    if (normalizedCategory.includes(keyword)) {
      return {
        wasteType,
        targetBin: BIN_TYPE_MAP[wasteType],
        confidence: 0.9
      };
    }
  }

  return { wasteType: "GENERAL", targetBin: "GENERAL", confidence: 0.6 };
}

export function classifyFromImage(
  _base64Image: string
): { wasteType: WasteType; confidence: number; targetBin: string; modelVersion: string } {
  // Simulated CNN classifier — in production, this would call a TensorFlow/ONNX model
  // The simulation randomly picks from common waste types to demonstrate the interface
  const wasteTypes: WasteType[] = ["PLASTIC", "METAL", "GLASS", "PAPER", "ORGANIC", "EWASTE", "GENERAL"];
  const randomIndex = Math.floor(Math.random() * wasteTypes.length);
  const wasteType = wasteTypes[randomIndex];
  const confidence = 0.7 + Math.random() * 0.25; // 70-95% confidence

  return {
    wasteType,
    confidence: Math.round(confidence * 100) / 100,
    targetBin: BIN_TYPE_MAP[wasteType],
    modelVersion: "simulated-cnn-v1.0"
  };
}

export function isHazardous(wasteType: WasteType): boolean {
  return wasteType === "EWASTE" || wasteType === "HAZARDOUS";
}

export function getDisposalInstructions(wasteType: WasteType): {
  wasteType: WasteType;
  instructions: string;
  targetBin: string;
  isHazardous: boolean;
} {
  return {
    wasteType,
    instructions: DISPOSAL_INSTRUCTIONS[wasteType] || DISPOSAL_INSTRUCTIONS.GENERAL,
    targetBin: BIN_TYPE_MAP[wasteType] || "GENERAL",
    isHazardous: isHazardous(wasteType)
  };
}
