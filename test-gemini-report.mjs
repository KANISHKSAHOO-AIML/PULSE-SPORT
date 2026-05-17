import { google } from "@ai-sdk/google";
import { generateText } from "ai";

async function test() {
  try {
    console.log("Testing Gemini model...");
    const { text } = await generateText({
      model: google("gemini-2.5-flash-preview-04-17"),
      prompt: 'Say "hello world" as JSON: {"message":"..."} — respond with valid JSON only',
    });
    console.log("SUCCESS:", text.substring(0, 300));
  } catch (e) {
    console.error("ERROR:", e.message?.substring(0, 500));
    
    // Try alternative model
    try {
      console.log("\nTrying gemini-2.0-flash...");
      const { text } = await generateText({
        model: google("gemini-2.0-flash"),
        prompt: 'Say "hello world" as JSON: {"message":"..."} — respond with valid JSON only',
      });
      console.log("SUCCESS with gemini-2.0-flash:", text.substring(0, 300));
    } catch (e2) {
      console.error("ERROR with 2.0-flash:", e2.message?.substring(0, 500));
    }
  }
}

test();
