import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cancellationEmail, sendEmail } from "@/services/notifications";
import { triggerN8nWebhook } from "@/services/automation";

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Appointment ID required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: appointment, error } = await supabase
      .from("appointments")
      .update(updates)
      .eq("id", id)
      .select("*, services(name), businesses(business_name)")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (updates.status === "cancelled" && appointment.customer_email) {
      const emailContent = cancellationEmail({
        customerName: appointment.customer_name || "Customer",
        businessName: appointment.businesses?.business_name || "Business",
        date: appointment.appointment_date,
        time: appointment.appointment_time,
      });
      await sendEmail({
        to: appointment.customer_email,
        ...emailContent,
      }).catch(console.error);
    }

    const event =
      updates.status === "cancelled"
        ? "appointment.cancelled"
        : "appointment.updated";

    await triggerN8nWebhook({
      event,
      appointment: {
        id: appointment.id,
        business_id: appointment.business_id,
        customer_name: appointment.customer_name,
        customer_email: appointment.customer_email,
        customer_phone: appointment.customer_phone,
        appointment_date: appointment.appointment_date,
        appointment_time: appointment.appointment_time,
        status: appointment.status,
        service_name: appointment.services?.name,
        business_name: appointment.businesses?.business_name,
      },
    }).catch(console.error);

    return NextResponse.json({ appointment });
  } catch {
    return NextResponse.json(
      { error: "Failed to update appointment" },
      { status: 500 }
    );
  }
}
