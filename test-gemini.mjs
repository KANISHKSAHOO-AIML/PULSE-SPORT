import fs from "fs";
import { GoogleGenerativeAI } from "@google/generative-ai";

const env = fs.readFileSync(".env.local", "utf8");
const match = env.match(/GOOGLE_GENERATIVE_AI_API_KEY="([^"]+)"/);
const key = match ? match[1] : "add your own api key";
const genAI = new GoogleGenerativeAI(key);

async function test() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent("Hello!");
    console.log("Success:", result.response.text());
  } catch (err) {
    console.error("Error:", err.message);
  }
}

test();
