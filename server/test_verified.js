const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, ".env") });

async function testNewLogic() {
  const key = process.env.GEMINI_API_KEY;
  console.log("Checking key:", key ? `Found (length: ${key.length})` : "Missing!");
  
  if (!key) return;

  const genAI = new GoogleGenerativeAI(key);
  const modelsToTest = ["gemini-2.0-flash", "gemini-1.0-pro"];

  for (const modelName of modelsToTest) {
    try {
      console.log(`Testing ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Say OK if you are alive.");
      console.log(`✅ ${modelName} Response:`, result.response.text());
    } catch (err) {
      console.error(`❌ ${modelName} failed:`, err.message);
    }
  }
}

testNewLogic();
