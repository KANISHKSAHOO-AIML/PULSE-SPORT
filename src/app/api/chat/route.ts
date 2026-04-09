import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

// Allow responses to run beyond the default 10s if we deploy to edge/serverless
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const modelMessages = messages.map((m: any) => ({
      role: m.role,
      content: m.parts?.map((p: any) => p.text).join('') || m.content || '',
    }));

    // The streamText function handles the heavy lifting of establishing the connection to Google
    // and natively streaming the response back to the useChat hook in React.
    const result = streamText({
      model: google('gemini-2.5-flash'), 
      system: `You are Pulse, the official AI consultant for the PulseSports platform. 
      Your expertise lies deeply in Cricket and Football (Soccer). 
      Your personality is engaging, highly analytical, and passionate about sports debates among fans.
      
      Guidelines:
      1. Always provide concise, accurate, and insightful answers.
      2. If asked about how PulseSports works, explain that we have persistent News & Highlights comment sections with a 🏅 Top Fan badge system, and high-speed Live Feeds powered by Upstash Redis.
      3. If a user asks something entirely unrelated to sports, politely decline and steer the conversation back to the pitch or the stadium.
      4. Use formatting (bolding, lists) to make stats easy to read.`,
      messages: modelMessages,
    });

    // We return a specialized UIMessageStreamResponse to automatically pipe the LLM text chunks down to the client.
    return (result as any).toUIMessageStreamResponse ? (result as any).toUIMessageStreamResponse() : (result as any).toDataStreamResponse();
  } catch (error: any) {
    console.error("Pulse API Error:", error);
    
    // Provide a more friendly fallback error if the API key isn't setup
    if (error.message && error.message.includes('API key')) {
      return new Response(JSON.stringify({ 
         error: "Google AI API Key (GOOGLE_GENERATIVE_AI_API_KEY) has not been configured in .env.local yet."
      }), { status: 503 });
    }
    
    return new Response(JSON.stringify({ error: "Failed to connect to the Pulse Brain." }), { status: 500 });
  }
}
