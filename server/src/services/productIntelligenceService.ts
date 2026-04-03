import { identifyProduct, getProductIntelligence } from "./googleAiService";
import { classifyWasteType, getDisposalInstructions } from "./wasteClassificationService";

export interface ProductIntelligenceResult {
  identity: {
    name: string;
    brand: string;
    category: string;
    release_year: string;
  };
  specs: {
    cpu?: string;
    memory?: string;
    battery?: string;
    display?: string;
    notable_features: string[];
  };
  management: {
    maintenance_tips: string[];
    common_issues: string[];
    optimization_suggestions: string[];
  };
  sustainability: {
    eco_score: number;
    eco_label: string;
    hazardous_materials: string[];
    carbon_footprint_est: string;
    recycling_instructions: string;
  };
  market_value: {
    original_price_est: string;
    current_resale_est: string;
    trade_in_recommendation: string;
  };
  waste_info: any;
}

/**
 * Main service to combine AI identification, logic, and existing waste rules
 */
export async function getFullProductIntelligence(
  input: string, 
  isImage: boolean = false
): Promise<ProductIntelligenceResult> {
  // 1. Identify product with AI
  const productTitle = await identifyProduct(input, isImage);
  
  // 2. Get deep intelligence
  const intelligence = await getProductIntelligence(productTitle);
  
  // Ensure hazardous_materials is an array with fallback
  const hazardousMaterials = Array.isArray(intelligence.sustainability?.hazardous_materials) 
    ? intelligence.sustainability.hazardous_materials 
    : [];
  
  // Convert eco_score to number if it's a string
  let ecoScore = intelligence.sustainability?.eco_score;
  if (typeof ecoScore === 'string') {
    // Try to extract numeric value from string like "High (7/10)" or just convert if possible
    const numMatch = ecoScore.match(/\d+/);
    ecoScore = numMatch ? parseInt(numMatch[0]) : 75; // Default to 75 if can't parse
  }
  if (typeof ecoScore !== 'number') {
    ecoScore = 75; // Default eco score
  }
  
  // 3. Enrich with local waste rules for consistency
  const wasteResult = classifyWasteType(intelligence.identity.name, {
    wasteType: intelligence.identity.category?.toUpperCase().includes("ELECTRONIC") ? "EWASTE" : undefined,
    hazardSafety: hazardousMaterials.length > 0 ? 0.2 : 0.8
  });
  const disposal = getDisposalInstructions(wasteResult.wasteType);
  
  // Normalize the intelligence object with corrected types
  const normalizedIntelligence = {
    ...intelligence,
    sustainability: {
      ...intelligence.sustainability,
      eco_score: ecoScore,
      hazardous_materials: hazardousMaterials
    }
  };
  
  return {
    ...normalizedIntelligence,
    waste_info: {
      ...wasteResult,
      disposal
    }
  };
}
