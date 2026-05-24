import OpenAI from "openai";
import { buildSystemPrompt, type ReceptionistContext } from "@/prompts/receptionist";
import type { ChatIntent } from "@/types/database";

function createAiClient() {
  // OpenRouter (recommended) — one key, many models including free tiers
  if (process.env.OPENROUTER_API_KEY) {
    return new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
      defaultHeaders: {
        "HTTP-Referer":
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "BookAI",
      },
    });
  }

  // Direct OpenAI fallback
  if (process.env.OPENAI_API_KEY) {
    return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  return null;
}

function getModel() {
  return (
    process.env.OPENROUTER_MODEL ||
    process.env.OPENAI_MODEL ||
    "google/gemini-2.0-flash-exp:free"
  );
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ExtractedBooking {
  intent: ChatIntent;
  service?: string;
  date?: string;
  time?: string;
  name?: string;
  email?: string;
  phone?: string;
}

function extractJsonFromResponse(content: string): ExtractedBooking | null {
  const match = content.match(/```json\s*([\s\S]*?)\s*```/);
  if (!match) return null;
  try {
    return JSON.parse(match[1]) as ExtractedBooking;
  } catch {
    return null;
  }
}

export function stripJsonBlock(content: string): string {
  return content.replace(/```json[\s\S]*?```/g, "").trim();
}

export async function generateReceptionistReply(
  context: ReceptionistContext,
  messages: ChatMessage[]
): Promise<{ reply: string; extracted: ExtractedBooking | null }> {
  const client = createAiClient();
  if (!client) {
    throw new Error(
      "No AI provider configured. Set OPENROUTER_API_KEY or OPENAI_API_KEY."
    );
  }

  const systemPrompt = buildSystemPrompt(context);

  const completion = await client.chat.completions.create({
    model: getModel(),
    messages: [{ role: "system", content: systemPrompt }, ...messages],
    temperature: 0.7,
    max_tokens: 500,
  });

  const raw =
    completion.choices[0]?.message?.content ||
    "Sorry, I couldn't process that.";
  const extracted = extractJsonFromResponse(raw);
  const reply = stripJsonBlock(raw) || raw;

  return { reply, extracted };
}
