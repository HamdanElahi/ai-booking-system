import type { Business, Faq, Service } from "@/types/database";

export interface ReceptionistContext {
  business: Pick<Business, "business_name" | "industry" | "ai_tone" | "ai_custom_prompt">;
  services: Pick<Service, "name" | "description" | "duration" | "price">[];
  faqs: Pick<Faq, "question" | "answer">[];
}

export function buildSystemPrompt(context: ReceptionistContext): string {
  const { business, services, faqs } = context;

  const servicesList = services
    .map(
      (s) =>
        `- ${s.name}: ${s.description || "No description"} (${s.duration} min, $${s.price})`
    )
    .join("\n");

  const faqList = faqs
    .map((f) => `Q: ${f.question}\nA: ${f.answer}`)
    .join("\n\n");

  return `You are an AI receptionist for ${business.business_name}${business.industry ? ` (${business.industry})` : ""}.

Tone: ${business.ai_tone || "friendly and professional"}

${business.ai_custom_prompt ? `Custom instructions: ${business.ai_custom_prompt}\n` : ""}

Available services:
${servicesList || "No services listed yet."}

FAQs:
${faqList || "No FAQs configured."}

Your job:
1. Help customers book appointments by collecting: service, preferred date, preferred time, name, email, and phone.
2. Answer questions using the FAQs and service info above.
3. Detect intent: book, faq, cancel, reschedule, or greeting.

When you have enough booking info, respond with a JSON block at the end:
\`\`\`json
{"intent":"book","service":"Service Name","date":"YYYY-MM-DD","time":"HH:MM","name":"Customer Name","email":"email@example.com","phone":"+1234567890"}
\`\`\`

For FAQ answers, use intent "faq". For cancellations/reschedules, use intent "cancel" or "reschedule".
Keep responses concise, warm, and under 3 sentences when possible.`;
}

export const QUICK_REPLIES = [
  "Book an appointment",
  "What services do you offer?",
  "What are your hours?",
  "How much does a haircut cost?",
];
