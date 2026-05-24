import { NextResponse } from "next/server";
import { reminderEmail, sendEmail } from "@/services/notifications";
import { sendWhatsAppReminder } from "@/services/automation";

export async function POST(request: Request) {
  const secret = request.headers.get("x-n8n-secret");
  if (process.env.N8N_WEBHOOK_SECRET && secret !== process.env.N8N_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { action, appointment } = await request.json();

    if (action === "send_reminder" && appointment) {
      const results: Record<string, unknown> = {};

      if (appointment.customer_email) {
        results.email = await sendEmail({
          to: appointment.customer_email,
          ...reminderEmail({
            customerName: appointment.customer_name || "Customer",
            businessName: appointment.business_name || "Business",
            serviceName: appointment.service_name || "Service",
            date: appointment.appointment_date,
            time: appointment.appointment_time,
          }),
        });
      }

      if (appointment.customer_phone) {
        results.whatsapp = await sendWhatsAppReminder({
          to: appointment.customer_phone,
          body: `Reminder: Your ${appointment.service_name} appointment at ${appointment.business_name} is on ${appointment.appointment_date} at ${appointment.appointment_time}.`,
        });
      }

      return NextResponse.json({ success: true, results });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[n8n webhook]", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
