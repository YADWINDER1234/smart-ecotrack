import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../.env") });

async function debug() {
  const key = process.env.GEMINI_API_KEY;
  console.log("---------------------------");
  console.log("🔍 AI KEY DIAGNOSIS");
  console.log(`🔑 Key Starts With: ${key?.substring(0, 7)}...`);
  console.log(`📏 Key Length: ${key?.length}`);
  console.log("---------------------------");

  if (!key || key.length < 10) {
    console.error("❌ ERROR: API Key is missing or too short!");
    return;
  }

  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    console.log("📡 Attempting 1-packet ping to Google AI...");
    const result = await model.generateContent("ping");
    console.log("✅ SUCCESS! Google AI responded:", result.response.text());
  } catch (err: any) {
    console.error("❌ CONNECTION FAILED!");
    console.error(`🛑 Error Message: ${err.message}`);
    if (err.stack) console.error(`📍 Source: ${err.stack.split("\n")[1]}`);
  }
}

debug();
