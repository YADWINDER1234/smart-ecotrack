import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

const logFile = path.resolve(process.cwd(), "ai_debug.log");
function logError(msg: string) {
  const entry = `[${new Date().toISOString()}] ${msg}\n`;
  try {
    fs.appendFileSync(logFile, entry);
  } catch (e) {
    console.error("Could not write to ai_debug.log", e);
  }
  console.error(msg);
}

// Force load dotenv from absolute path
dotenv.config({ path: path.join(__dirname, "../../.env") });

function getGenAI() {
  const key = process.env.GEMINI_API_KEY || "";
  if (!key) throw new Error("GEMINI_API_KEY is missing in env!");
  return new GoogleGenerativeAI(key);
}
const MODELS_BY_PRIORITY = [
  "gemini-3.6-flash",
  "gemini-2.5-flash",
  "gemma-3-27b-it"
];

export async function identifyProduct(input: string, isImage: boolean = false): Promise<string> {
  for (const modelName of MODELS_BY_PRIORITY) {
    try {
      console.log(`📡 [HUB] IDENTIFY: Using ${modelName}...`);
      const model = getGenAI().getGenerativeModel({ model: modelName });
      
      const prompt = isImage 
        ? "Identify Brand and Model. Return ONLY the identification title."
        : `Identify "${input}". Return ONLY the official Brand and Model Name.`;

      const result = await (isImage 
        ? model.generateContent([prompt, { inlineData: { data: input, mimeType: "image/jpeg" } }])
        : model.generateContent(prompt));
      
      const text = result.response.text().trim();
      if (text && text.length > 2) { // Ensure real identification
        console.log(`✅ [HUB] ID SUCCESS: "${text}" via ${modelName}`);
        return text;
      }
    } catch (error: any) {
      logError(`⚠️ [HUB] ID LIMIT (${modelName}): ${error.message}`);
      continue;
    }
  }
  return isImage ? "Universal Smart Product" : input;
}

export async function getProductIntelligence(productName: string): Promise<any> {
  const prompt = `
    Generate a comprehensive technical and market intelligence JSON report for: "${productName}".
    
    REQUIRED EXACT JSON STRUCTURE:
    {
      "identity": {"name": "...", "brand": "...", "category": "...", "release_year": "..."},
      "specs": {"cpu": "...", "memory": "...", "battery": "...", "display": "...", "notable_features": [...]},
      "management": {"maintenance_tips": [...], "common_issues": [...], "optimization_suggestions": [...]},
      "sustainability": {"eco_score": <number 0-100>, "eco_label": "...", "hazardous_materials": [...], "carbon_footprint_est": "...", "recycling_instructions": "..."},
      "market_value": {
        "original_price_est": "Estimated original launch price in USD (e.g., '$299-399' or 'Rs 25,000-30,000')",
        "current_resale_est": "Current realistic second-hand/resale market value (check eBay, OLX, marketplace prices)",
        "trade_in_recommendation": "Trade-in value assessment and condition notes"
      }
    }
    
    MARKET VALUE CRITICAL RULES:
    - Use REAL market research (eBay sold listings, OLX, local market values)
    - For vintage/old devices: Research actual selling prices, not theoretical prices
    - For Nokia 1100 (2003): Original ~$100-150, Current resale $10-50 (NOT $500+)
    - Match original_price_est to device age/specs (budget phones $150-300, flagship $800-1200, entry-level $200-400)
    - current_resale_est should be 20-40% of original for recent devices, 5-15% for old devices
    - Include currency and price range (e.g., "$199-299", "Rs 15,000-25,000")
    
    DO NOT use generic fallback prices. Research the actual market value for "${productName}".
  `;

  for (const modelName of MODELS_BY_PRIORITY) {
    try {
      console.log(`🌐 [HUB] INTEL: Fetching for "${productName}" using ${modelName}...`);
      const model = getGenAI().getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const rawText = result.response.text();
      
      // Handle markdown code blocks and raw JSON
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        let cleanedJson = jsonMatch[0];
        // Remove markdown artifacts if present within the match
        cleanedJson = cleanedJson.replace(/```json|```/g, "").trim();
        
        try {
          const parsed = JSON.parse(cleanedJson);
          console.log(`✨ [HUB] INTELLIGENCE UNLOCKED via ${modelName}!`);
          return parsed;
        } catch (parseErr) {
          logError(`❌ [HUB] PARSE ERROR (${modelName}): Malformed JSON output.`);
          continue;
        }
      }
    } catch (error: any) {
      logError(`❌ [HUB] INTEL LIMIT (${modelName}): ${error.message}`);
      continue;
    }
  }

  // Final fallback (no mock data!)
  throw new Error(`AI Intelligence failed across all ${MODELS_BY_PRIORITY.length} models. Last error: Check server logs.`);
}
