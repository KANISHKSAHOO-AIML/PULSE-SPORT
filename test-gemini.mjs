import { GoogleGenerativeAI } from "@google/generative-ai";

const key = "AIzaSyA3A5clgNHqXa8kEDNF5bVEK9e57mB5BN4"; // From .env.local without quotes
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
