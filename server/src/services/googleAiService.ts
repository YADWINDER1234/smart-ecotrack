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
  "gemini-2.5-flash",
  "gemini-3.1-flash",
  "gemini-2.0-flash",
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
    Technical JSON report for: "${productName}". 
    EXACT keys: identity(name, brand, category, release_year), specs(cpu, memory, battery, display, notable_features), management(tips, issues, advice), sustainability(eco_score, eco_label, materials, carbon, recycling), market_value(original, current, trade_in).
    
    IMPORTANT: Provide REAL data for ${productName}. NO placeholders.
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
