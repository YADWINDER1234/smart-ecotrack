import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../.env") });

async function listAllModels() {
  const key = process.env.GEMINI_API_KEY;
  console.log("-----------------------------------------");
  console.log("🔍 PERFORMING THE TRUTH-SCAN...");
  console.log("-----------------------------------------");

  if (!key) {
    console.error("❌ ERROR: No key found!");
    return;
  }

  const genAI = new GoogleGenerativeAI(key);

  try {
    // Standard listModels version often needs a specific client or the newer SDK methods
    // We'll try to probe the common names first and then try to list if possible
    console.log("📡 Probing 'Internal Names' for your account...");
    const modelsToProbe = [
      "gemini-2.0-flash-exp",
      "gemini-1.5-flash",
      "gemma-3-27b",
      "gemma-3-12b",
      "gemma-3-4b"
    ];

    for (const m of modelsToProbe) {
      try {
        const model = genAI.getGenerativeModel({ model: m });
        const result = await model.generateContent("test");
        console.log(`✅ [FOUND] ${m}: Response received!`);
      } catch (err: any) {
        console.log(`❌ [NOT FOUND] ${m}: ${err.message}`);
      }
    }
  } catch (err: any) {
    console.error(`❌ GLOBAL SCAN ERROR: ${err.message}`);
  }
}

listAllModels();
