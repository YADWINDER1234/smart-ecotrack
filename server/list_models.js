const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, ".env") });

async function listModels() {
  const key = process.env.GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(key);
  
  try {
    const list = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" }).listModels();
    // wait, listModels might be on the client directly in some versions
    console.log("Listing models...");
    // In newer SDKs, it might be different. Let's try the fetch approach if the SDK fails.
  } catch (err) {
    console.error("SDK list failed:", err.message);
  }
}

listModels();
