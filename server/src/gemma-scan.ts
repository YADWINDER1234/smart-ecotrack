import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../.env") });

async function listAllModels() {
  const key = process.env.GEMINI_API_KEY;
  console.log("-----------------------------------------");
  console.log("🔍 [GEMMA-SCAN] PROBING FOR REINFORCEMENTS...");
  console.log("-----------------------------------------");

  if (!key) {
    console.error("❌ ERROR: No key found!");
    return;
  }

  const genAI = new GoogleGenerativeAI(key);

  const gemmaProbes = [
    "gemma-3-27b-it",
    "gemma-2-27b",
    "gemma-1.1-7b-it",
    "gemini-1.5-flash-8b",
    "gemini-1.0-pro"
  ];

  for (const m of gemmaProbes) {
    try {
      const model = genAI.getGenerativeModel({ model: m });
      const result = await model.generateContent("test");
      console.log(`✅ [ALIVE] ${m}: Connected!`);
    } catch (err: any) {
      console.log(`❌ [OFFLINE] ${m}`);
    }
  }
}

listAllModels();
