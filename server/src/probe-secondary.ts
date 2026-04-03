import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../.env") });

async function scanSecondaryKey() {
  const key = process.env.GEMINI_API_KEY_SECONDARY;
  console.log("-----------------------------------------");
  console.log("🔍 PROBING SECONDARY KEY (NEW ACCOUNT)...");
  console.log(`🔑 Key Pulse: ${key?.substring(0, 8)}...`);
  console.log("-----------------------------------------");

  if (!key) {
    console.error("❌ ERROR: No secondary key found in .env!");
    return;
  }

  // Common model names that might work where others fail
  const modelsToTest = [
    "gemini-1.5-flash",
    "gemini-1.5-flash-8b",
    "gemini-1.5-pro",
    "gemini-2.0-flash-exp",
    "gemini-pro"
  ];

  const genAI = new GoogleGenerativeAI(key);

  for (const m of modelsToTest) {
    try {
      console.log(`📡 Probing: ${m}...`);
      const model = genAI.getGenerativeModel({ model: m });
      const result = await model.generateContent("hi");
      console.log(`✅ [WORKING] ${m}: ${result.response.text().substring(0, 20)}...`);
    } catch (err: any) {
      console.log(`❌ [FAILED] ${m}: ${err.message}`);
    }
  }
}

scanSecondaryKey();
