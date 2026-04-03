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
 * Validate and correct unrealistic market prices based on device age and category
 */
function validateMarketValues(intelligence: any): any {
  const releaseYear = parseInt(intelligence.identity?.release_year) || new Date().getFullYear();
  const currentYear = 2026;
  const deviceAge = currentYear - releaseYear;
  
  // Extract numeric values from prices (e.g., "$500-800" -> 500-800, "Rs 50000" -> 50000)
  const extractPriceRange = (priceStr: string): { min: number; max: number; currency: string } | null => {
    const currencyMatch = priceStr?.match(/[\$€£₹]/);
    const currency = currencyMatch ? currencyMatch[0] : "$";
    const numMatch = priceStr?.match(/[\d,]+/g);
    if (numMatch && numMatch.length >= 1) {
      const nums = numMatch.map(n => parseInt(n.replace(/,/g, "")));
      return nums.length === 2 
        ? { min: nums[0], max: nums[1], currency }
        : nums.length === 1
        ? { min: nums[0], max: nums[0] * 1.2, currency }
        : null;
    }
    return null;
  };

  const original = extractPriceRange(intelligence.market_value?.original_price_est);
  const resale = extractPriceRange(intelligence.market_value?.current_resale_est);

  // Validation rules: Flag unrealistic prices
  const isUnrealistic = () => {
    if (!original) return false;
    
    // Very old devices (>15 years) shouldn't have high original prices unless flagship
    if (deviceAge > 15 && original.max > 300 && !intelligence.identity?.name?.toLowerCase().includes("flagship")) {
      return true;
    }
    
    // Recent budget devices shouldn't be priced at flagship levels
    if (deviceAge < 5 && intelligence.identity?.category?.toLowerCase().includes("feature") && original.max > 500) {
      return true;
    }
    
    // Resale should be much lower than original for old devices
    if (deviceAge > 10 && resale && resale.max > original.max * 0.3) {
      return true;
    }
    
    return false;
  };

  // If prices seem unrealistic, log warning (but don't auto-correct for now, just note it)
  if (isUnrealistic()) {
    console.warn(`⚠️ Unrealistic market value detected for "${intelligence.identity?.name}" (${releaseYear}):`, {
      original: intelligence.market_value?.original_price_est,
      resale: intelligence.market_value?.current_resale_est,
      deviceAge: `${deviceAge} years`,
      recommend: "Please verify with actual market research"
    });
  }

  return intelligence;
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
  let intelligence = await getProductIntelligence(productTitle);
  
  // 3. Validate market values
  intelligence = validateMarketValues(intelligence);
  
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
  
  // 4. Enrich with local waste rules for consistency
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
