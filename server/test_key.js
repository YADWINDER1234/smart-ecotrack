const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

const rawKey = process.env.GEMINI_API_KEY || "";
const cleanKey = rawKey.trim().replace(/^['"]|['"]$/g, ''); // Trim and remove quotes

console.log("-----------------------------------------");
console.log("🔍 KEY DIAGNOSIS 2.0");
console.log("RAW KEY LENGTH:", rawKey.length);
console.log("CLEAN KEY LENGTH:", cleanKey.length);
console.log("FIRST 7:", cleanKey.substring(0, 7));
console.log("LAST 4:", cleanKey.substring(cleanKey.length - 4));
console.log("-----------------------------------------");

const genAI = new GoogleGenerativeAI(cleanKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

model.generateContent("Say 'CONNECTION_SUCCESSFUL'")
  .then(r => console.log("✅ RESULT:", r.response.text()))
  .catch(e => {
    console.error("❌ ERROR_TYPE:", e.name);
    console.error("❌ ERROR_MSG:", e.message);
  });
