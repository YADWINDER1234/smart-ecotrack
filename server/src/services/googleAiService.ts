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
  "gemini-2.5-flash"
];

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000; // 5 seconds between retries for rate limit

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Known hallucinated/garbage names the AI tends to generate when it can't identify
const HALLUCINATION_KEYWORDS = [
  "universal smart product",
  "omniconnect",
  "smart product hub",
  "generic device",
  "smart hub",
  "universal hub",
  "product hub",
  "smart device hub",
  "unknown product",
  "unidentified",
  "a nice device",
  "this is a",
  "i can see",
  "the image shows",
  "based on the image"
];

/**
 * Validate that the AI response is a real product identification
 * and not a hallucinated/garbage name
 */
function isValidIdentification(text: string): boolean {
  if (!text || text.length < 3 || text.length > 200) return false;
  
  const lower = text.toLowerCase().trim();
  
  // Reject known hallucination patterns
  for (const keyword of HALLUCINATION_KEYWORDS) {
    if (lower.includes(keyword)) {
      console.warn(`⚠️ Rejected hallucinated identification: "${text}"`);
      return false;
    }
  }
  
  // Reject if it's just generic description, not a brand+model
  if (lower.startsWith("a ") || lower.startsWith("an ") || lower.startsWith("the ")) {
    return false;
  }
  
  // Reject if it contains sentences (real product names don't have periods mid-text)
  if ((text.match(/\./g) || []).length > 1) return false;
  
  return true;
}

export async function identifyProduct(input: string, isImage: boolean = false): Promise<string> {
  for (const modelName of MODELS_BY_PRIORITY) {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`📡 [AI-ID] Identifying product using ${modelName} (attempt ${attempt}/${MAX_RETRIES})...`);
        const model = getGenAI().getGenerativeModel({ model: modelName }, { timeout: 30000 });
        
        const prompt = isImage 
          ? `You are a product identification expert. Carefully examine this image and identify the EXACT brand and model of the device/product shown.

INSTRUCTIONS:
- Look for visible brand logos, text, or markings on the device
- Identify the brand (e.g., Samsung, Apple, iQOO, OnePlus, Xiaomi, Dell, HP, Sony, etc.)
- Identify the specific model name/number if visible
- Consider the device design, camera layout, color, and form factor as identification clues
- If you can identify the brand but not the exact model, return "Brand [best model guess]"

RESPONSE FORMAT: Return ONLY the brand and model name, nothing else.
Examples of correct responses: "iQOO Neo 9 Pro", "Samsung Galaxy S24 Ultra", "iPhone 15 Pro Max", "Dell XPS 15"

If you truly cannot identify the device at all, respond with exactly: "Unknown Device"

DO NOT make up fictional product names. Only return real, existing product names.`
          : `Identify the exact official product name for: "${input}".
Return ONLY the official Brand and Model Name (e.g., "Samsung Galaxy S24 Ultra", "iPhone 15 Pro", "Dell XPS 15 9530").
If you cannot identify it, respond with exactly: "Unknown Device"
DO NOT invent fictional product names.`;

        const result = await (isImage 
          ? model.generateContent([prompt, { inlineData: { data: input, mimeType: "image/jpeg" } }])
          : model.generateContent(prompt));
        
        const text = result.response.text().trim();
        
        // Validate the response is a real identification
        if (text && isValidIdentification(text)) {
          console.log(`✅ [AI-ID] Identified: "${text}" via ${modelName}`);
          return text;
        } else {
          console.warn(`⚠️ [AI-ID] Invalid/hallucinated response from ${modelName}: "${text}"`);
          break; // Try next model
        }
      } catch (error: any) {
        const isRateLimit = error.message?.includes("429") || error.message?.includes("quota") || error.message?.includes("Too Many Requests");
        logError(`⚠️ [AI-ID] Error with ${modelName} (attempt ${attempt}): ${error.message?.substring(0, 120)}`);
        
        if (isRateLimit && attempt < MAX_RETRIES) {
          console.log(`⏳ [AI-ID] Rate limited. Waiting ${RETRY_DELAY_MS / 1000}s before retry...`);
          await delay(RETRY_DELAY_MS);
          continue;
        }
        break; // Non-rate-limit error or max retries reached
      }
    }
  }
  
  // All models failed — return honest "Unknown Device" instead of fake name
  console.warn("❌ [AI-ID] All models failed to identify product. Returning 'Unknown Device'.");
  return "Unknown Device";
}

export async function getProductIntelligence(productName: string): Promise<any> {
  // If product couldn't be identified, don't ask AI to hallucinate a report
  if (productName === "Unknown Device") {
    return {
      identity: { name: "Unknown Device", brand: "Unknown", category: "Electronics", release_year: "Unknown" },
      specs: { cpu: "Unable to determine", memory: "Unable to determine", battery: "Unable to determine", display: "Unable to determine", notable_features: ["Could not identify product — try a clearer photo or type the product name manually"] },
      management: { 
        maintenance_tips: ["Keep device clean and dry", "Avoid extreme temperatures", "Use a protective case"],
        common_issues: ["Product could not be identified from the image"],
        optimization_suggestions: ["Try scanning again with better lighting", "Type the exact product name in the search box for accurate results"]
      },
      sustainability: { eco_score: 50, eco_label: "Unrated", hazardous_materials: [], carbon_footprint_est: "Unable to determine", recycling_instructions: "Take to your nearest e-waste collection center for proper disposal." },
      market_value: { original_price_est: "Unable to determine", current_resale_est: "Unable to determine", trade_in_recommendation: "Product identification failed. Please try again with a clearer photo or search by name." }
    };
  }

  const prompt = `
    Generate a comprehensive technical and market intelligence JSON report for: "${productName}".
    
    CRITICAL: "${productName}" is a REAL product. Research it accurately. Do NOT invent specs or prices.
    
    REQUIRED EXACT JSON STRUCTURE:
    {
      "identity": {"name": "${productName}", "brand": "...", "category": "...", "release_year": "..."},
      "specs": {"cpu": "...", "memory": "...", "battery": "...", "display": "...", "notable_features": [...]},
      "management": {"maintenance_tips": [...], "common_issues": [...], "optimization_suggestions": [...]},
      "sustainability": {"eco_score": <number 0-100>, "eco_label": "...", "hazardous_materials": [...], "carbon_footprint_est": "...", "recycling_instructions": "..."},
      "market_value": {
        "original_price_est": "Estimated original launch price (e.g., '$299-399' or 'Rs 25,000-30,000')",
        "current_resale_est": "Current realistic second-hand/resale market value",
        "trade_in_recommendation": "Trade-in value assessment and condition notes"
      }
    }
    
    IMPORTANT RULES:
    - The "name" in identity MUST be exactly "${productName}" — do not change it
    - Use REAL specs for this exact product — do not guess or use generic values
    - Use realistic market prices based on actual market research
    - For budget phones ($150-300), flagship ($800-1200), mid-range ($300-600)
    - current_resale_est should be 20-40% of original for recent devices, 5-15% for old devices
    - Include currency and price range
    
    Return ONLY the JSON object, no extra text.
  `;

  for (const modelName of MODELS_BY_PRIORITY) {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`🌐 [AI-INTEL] Fetching intelligence for "${productName}" using ${modelName} (attempt ${attempt}/${MAX_RETRIES})...`);
        const model = getGenAI().getGenerativeModel({ model: modelName }, { timeout: 30000 });
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
            
            // Ensure the identity name matches what we asked for
            if (parsed.identity) {
              parsed.identity.name = productName;
            }
            
            console.log(`✨ [AI-INTEL] Intelligence retrieved for "${productName}" via ${modelName}!`);
            return parsed;
          } catch (parseErr) {
            logError(`❌ [AI-INTEL] JSON parse error (${modelName}): Malformed JSON output.`);
            break; // Try next model
          }
        }
      } catch (error: any) {
        const isRateLimit = error.message?.includes("429") || error.message?.includes("quota") || error.message?.includes("Too Many Requests");
        logError(`❌ [AI-INTEL] Error with ${modelName} (attempt ${attempt}): ${error.message?.substring(0, 120)}`);
        
        if (isRateLimit && attempt < MAX_RETRIES) {
          console.log(`⏳ [AI-INTEL] Rate limited. Waiting ${RETRY_DELAY_MS / 1000}s before retry...`);
          await delay(RETRY_DELAY_MS);
          continue;
        }
        break; // Non-rate-limit error or max retries reached — try next model
      }
    }
  }

  // Final fallback — return structured fallback instead of throwing
  console.error(`❌ [AI-INTEL] All models failed for "${productName}". Returning fallback data.`);
  return {
    identity: { name: productName, brand: "Unknown", category: "Electronics", release_year: "Unknown" },
    specs: { cpu: "Unable to retrieve", memory: "Unable to retrieve", battery: "Unable to retrieve", display: "Unable to retrieve", notable_features: ["AI service temporarily unavailable"] },
    management: { 
      maintenance_tips: ["Keep device clean and protected", "Avoid extreme temperatures", "Update software regularly"],
      common_issues: ["Intelligence data temporarily unavailable"],
      optimization_suggestions: ["Try again later for full product intelligence"]
    },
    sustainability: { eco_score: 50, eco_label: "Pending", hazardous_materials: [], carbon_footprint_est: "Pending analysis", recycling_instructions: "Take to nearest certified e-waste recycling center." },
    market_value: { original_price_est: "Unable to retrieve", current_resale_est: "Unable to retrieve", trade_in_recommendation: "Try again later for market value analysis." }
  };
}
