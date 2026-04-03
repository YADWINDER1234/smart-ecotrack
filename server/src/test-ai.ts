import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import path from "path";

// Load .env from the server root
dotenv.config({ path: path.join(__dirname, "../.env") });

const apiKey = process.env.GEMINI_API_KEY;

async function testApiKey() {
  console.log("------------------------------------------");
  console.log("🚀 SMART ECOTRACK: AI DIAGNOSTICS");
  console.log("------------------------------------------");
  
  if (!apiKey) {
    console.error("❌ ERROR: No GEMINI_API_KEY found in .env file!");
    return;
  }

  console.log(`🔑 Key found: ${apiKey.substring(0, 8)}... (Checking status)`);
  
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    console.log("📡 Sending test probe to Gemini Cloud...");
    const result = await model.generateContent("Respond with 'HEALTHY'");
    const response = result.response.text();
    
    if (response.includes("HEALTHY")) {
      console.log("✅ SUCCESS: Your API Key is ACTIVE and HEALTHY!");
      console.log("📈 Quota Status: Under limits.");
    } else {
      console.log("⚠️ UNKNOWN: Key is connected but output is unexpected.");
    }
  } catch (error: any) {
    console.log("------------------------------------------");
    console.error("🚨 DIAGNOSTICS FAILED:");
    
    if (error.status === 429 || error.message?.includes("429")) {
      console.error("📈 QUOTA EXCEEDED: You have hit the 'Too many requests' limit.");
      console.error("👉 Solution: Wait 1 minute and try again, or use a different API key.");
    } else if (error.status === 401 || error.message?.includes("401")) {
      console.error("🚫 INVALID KEY: Your API key is incorrect or expired.");
      console.error("👉 Solution: Double-check the key in your .env file.");
    } else if (error.status === 404 || error.message?.includes("404")) {
      console.error("🗺️ MODEL NOT FOUND: The model 'gemini-1.5-flash' might be restricted in your region.");
    } else {
      console.error(`❌ OTHER ERROR: ${error.message}`);
    }
    console.log("------------------------------------------");
  }
}

testApiKey();
