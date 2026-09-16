import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../.env") });

async function listModels() {
  const key = process.env.GEMINI_API_KEY;
  console.log("---------------------------");
  console.log("🔍 SCANNING AVAILABLE MODELS...");
  console.log(`🔑 Key: ${key?.substring(0, 7)}...`);
  console.log("---------------------------");

  if (!key) {
    console.error("❌ No API Key found!");
    return;
  }

  // Note: The standard SDK doesn't have a direct 'listModels', 
  // but we can try to hit a known experimental one to see the error message
  // which often lists available models or we can use a fetch request.
  
  const modelsToTest = [
    "gemini-2.0-flash",
    "gemini-2.0-flash-exp",
    "gemini-2.0-flash-lite-preview-02-05",
    "gemini-1.5-flash",
    "gemini-1.5-flash-8b",
    "gemini-1.5-pro",
    "gemma-2-27b-it",
    "gemma-2-9b-it",
    "gemma-7b-it"
  ];

  const genAI = new GoogleGenerativeAI(key);

  for (const m of modelsToTest) {
    try {
      const model = genAI.getGenerativeModel({ model: m });
      await model.generateContent("hi");
      console.log(`✅ [AVAILABLE] ${m}`);
    } catch (err: any) {
      console.log(`❌ [UNAVAILABLE] ${m} -> ${err.message}`);
    }
  }
}

listModels();
