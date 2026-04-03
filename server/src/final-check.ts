import { identifyProduct, getProductIntelligence } from "./services/googleAiService";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../.env") });

async function finalCheck() {
  console.log("-----------------------------------------");
  console.log("📡 [FINAL SYSTEMS CHECK]");
  console.log("-----------------------------------------");

  try {
    console.log("🔍 Testing Identification (Main Engine)...");
    const id = await identifyProduct("iPhone 15 Pro", false);
    console.log(`✅ IDENTIFIED: ${id}`);

    console.log("\n🔍 Testing Deep Intelligence (Specs & Sustainability)...");
    const intel = await getProductIntelligence(id);
    
    if (intel.specs.cpu.includes("Standard") || intel.specs.cpu.includes("Variable")) {
      console.warn("⚠️ WARNING: Still getting Fallback data. Checking why...");
    } else {
      console.log("✨ SUCCESS! REAL AI DATA RECEIVED:");
      console.log(`📱 Brand: ${intel.identity.brand}`);
      console.log(`🔧 Processor: ${intel.specs.cpu}`);
      console.log(`🌍 Eco-Score: ${intel.sustainability.eco_score}`);
    }
  } catch (err: any) {
    console.error(`❌ CRITICAL ERROR: ${err.message}`);
  }
}

finalCheck();
