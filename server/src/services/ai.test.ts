import { identifyProduct, getProductIntelligence } from "./googleAiService";
import { getFullProductIntelligence } from "./productIntelligenceService";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../../.env") });

describe("AI Upload & Product Intelligence Tests", () => {
  
  it("should identify a product from text input", async () => {
    const result = await identifyProduct("iPhone 14 Pro");
    console.log("✅ Product Identified:", result);
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
  }, 30000);

  it("should fetch full product intelligence", async () => {
    const result = await getFullProductIntelligence("Apple iPhone 14");
    console.log("✅ Intelligence Retrieved:", JSON.stringify(result, null, 2));
    
    expect(result).toBeDefined();
    expect(result.identity).toBeDefined();
    expect(result.specs).toBeDefined();
    expect(result.sustainability).toBeDefined();
    expect(result.waste_info).toBeDefined();
  }, 45000);

  it("should classify waste information", async () => {
    const result = await getProductIntelligence("Samsung Galaxy Phone");
    console.log("✅ Product Intelligence Retrieved");
    console.log("Sustainability Score:", result.sustainability.eco_score);
    console.log("Recycling Instructions:", result.sustainability.recycling_instructions);
    
    expect(result.sustainability.eco_score).toBeGreaterThanOrEqual(0);
    expect(result.sustainability.eco_score).toBeLessThanOrEqual(100);
  }, 45000);

  it("should handle multiple products", async () => {
    const products = ["Sony Headphones", "Dell Monitor", "Samsung TV"];
    
    for (const product of products) {
      const result = await identifyProduct(product);
      console.log(`✅ Identified: ${product} -> ${result}`);
      expect(result).toBeDefined();
    }
  }, 60000);
});
