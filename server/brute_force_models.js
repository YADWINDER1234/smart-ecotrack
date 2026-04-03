const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const path = require("path");
const axios = require("axios");

dotenv.config({ path: path.join(__dirname, ".env") });

async function findWorkingModel() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return console.error("No API key!");

  try {
    console.log("Fetching accessible models from v1beta...");
    const resp = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    const models = resp.data.models || [];
    console.log(`Found ${models.length} models. Bruteforcing generateContent...`);

    const genAI = new GoogleGenerativeAI(key);

    for (const m of models) {
      const modelName = m.name.replace("models/", "");
      console.log(`Testing ${modelName}...`);
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Say OK");
        console.log(`✅ SUCCESS: ${modelName} works! Response: ${result.response.text()}`);
        return; // Stop at first success
      } catch (err) {
        console.log(`❌ FAILED: ${modelName} - ${err.message.substring(0, 50)}`);
      }
    }
  } catch (err) {
    console.error("Master test failed:", err.message);
  }
}

findWorkingModel();
