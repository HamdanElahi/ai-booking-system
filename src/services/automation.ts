interface AppointmentWebhookPayload {
  event: "appointment.created" | "appointment.cancelled" | "appointment.updated";
  appointment: {
    id: string;
    business_id: string;
    customer_name: string | null;
    customer_email: string | null;
    customer_phone: string | null;
    appointment_date: string;
    appointment_time: string;
    status: string;
    service_name?: string;
    business_name?: string;
  };
}

export async function triggerN8nWebhook(payload: AppointmentWebhookPayload) {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn("[automation] N8N_WEBHOOK_URL not set, skipping webhook");
    return { success: false, skipped: true };
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`n8n webhook failed: ${response.status}`);
  }

  return { success: true };
}

export async function sendWhatsAppReminder(params: {
  to: string;
  body: string;
}) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;

  if (!accountSid || !authToken || !from) {
    console.warn("[automation] Twilio not configured, skipping WhatsApp");
    return { success: false, skipped: true };
  }

  const twilio = await import("twilio");
  const client = twilio.default(accountSid, authToken);

  const message = await client.messages.create({
    from,
    to: params.to.startsWith("whatsapp:") ? params.to : `whatsapp:${params.to}`,
    body: params.body,
  });

  return { success: true, sid: message.sid };
}
