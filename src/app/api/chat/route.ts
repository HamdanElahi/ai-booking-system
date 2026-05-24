import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateReceptionistReply } from "@/services/ai";
import { validateAppointmentInput } from "@/services/booking";
import {
  bookingConfirmationEmail,
  sendEmail,
} from "@/services/notifications";
import { triggerN8nWebhook } from "@/services/automation";

export async function POST(request: Request) {
  try {
    const { business_id, message, session_id, history = [] } = await request.json();

    if (!business_id || !message || !session_id) {
      return NextResponse.json(
        { error: "business_id, message, and session_id are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const [{ data: business }, { data: services }, { data: faqs }] =
      await Promise.all([
        supabase
          .from("businesses")
          .select("business_name, industry, ai_tone, ai_custom_prompt")
          .eq("id", business_id)
          .single(),
        supabase.from("services").select("name, description, duration, price").eq("business_id", business_id),
        supabase.from("faqs").select("question, answer").eq("business_id", business_id),
      ]);

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    const messages = [
      ...history.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user" as const, content: message },
    ];

    const { reply, extracted } = await generateReceptionistReply(
      { business, services: services || [], faqs: faqs || [] },
      messages
    );

    let appointment = null;

    if (extracted?.intent === "book" && extracted.service && extracted.date && extracted.time) {
      const matchedService = (services || []).find(
        (s) => s.name.toLowerCase() === extracted.service!.toLowerCase()
      );

      if (matchedService) {
        const bookingData = {
          business_id,
          service_id: (matchedService as { id?: string }).id || "",
          customer_name: extracted.name,
          customer_email: extracted.email,
          customer_phone: extracted.phone,
          appointment_date: extracted.date,
          appointment_time: extracted.time,
        };

        const { data: svc } = await supabase
          .from("services")
          .select("id")
          .eq("business_id", business_id)
          .ilike("name", extracted.service)
          .single();

        if (svc) {
          bookingData.service_id = svc.id;
          const validationError = validateAppointmentInput(bookingData);
          if (!validationError) {
            const { data: created } = await supabase
              .from("appointments")
              .insert({ ...bookingData, status: "confirmed" })
              .select("*, services(name)")
              .single();

            if (created) {
              appointment = created;
              if (created.customer_email) {
                await sendEmail({
                  to: created.customer_email,
                  ...bookingConfirmationEmail({
                    customerName: created.customer_name || "Customer",
                    businessName: business.business_name,
                    serviceName: created.services?.name || extracted.service,
                    date: extracted.date,
                    time: extracted.time,
                  }),
                }).catch(console.error);
              }
              await triggerN8nWebhook({
                event: "appointment.created",
                appointment: {
                  id: created.id,
                  business_id,
                  customer_name: created.customer_name,
                  customer_email: created.customer_email,
                  customer_phone: created.customer_phone,
                  appointment_date: created.appointment_date,
                  appointment_time: created.appointment_time,
                  status: created.status,
                  service_name: created.services?.name,
                  business_name: business.business_name,
                },
              }).catch(console.error);
            }
          }
        }
      }
    }

  let conversationId: string | null = null;
  const { data: existingConv } = await supabase
    .from("ai_conversations")
    .select("id")
    .eq("session_id", session_id)
    .maybeSingle();

  if (existingConv) {
    conversationId = existingConv.id;
    await supabase
      .from("ai_conversations")
      .update({
        last_intent: extracted?.intent || "unknown",
        summary: message.slice(0, 200),
      })
      .eq("id", conversationId);
  } else {
    const { data: newConv } = await supabase
      .from("ai_conversations")
      .insert({
        business_id,
        session_id,
        last_intent: extracted?.intent || "unknown",
        summary: message.slice(0, 200),
      })
      .select("id")
      .single();
    conversationId = newConv?.id || null;
  }

  if (conversationId) {
    await supabase.from("chat_messages").insert([
      { conversation_id: conversationId, role: "user", content: message },
      { conversation_id: conversationId, role: "assistant", content: reply },
    ]);
  }

    return NextResponse.json({
      reply,
      intent: extracted?.intent || "unknown",
      appointment,
    });
  } catch (error) {
    console.error("[chat]", error);
    return NextResponse.json(
      { error: "Failed to process chat message" },
      { status: 500 }
    );
  }
}
