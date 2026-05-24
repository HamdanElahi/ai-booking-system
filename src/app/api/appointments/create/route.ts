import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validateAppointmentInput } from "@/services/booking";
import {
  bookingConfirmationEmail,
  sendEmail,
} from "@/services/notifications";
import { triggerN8nWebhook } from "@/services/automation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validationError = validateAppointmentInput(body);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: existing } = await supabase
      .from("appointments")
      .select("id")
      .eq("business_id", body.business_id)
      .eq("appointment_date", body.appointment_date)
      .eq("appointment_time", body.appointment_time)
      .neq("status", "cancelled")
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "This time slot is no longer available" },
        { status: 409 }
      );
    }

    const { data: appointment, error } = await supabase
      .from("appointments")
      .insert({
        business_id: body.business_id,
        service_id: body.service_id,
        customer_id: body.customer_id || null,
        customer_name: body.customer_name,
        customer_email: body.customer_email,
        customer_phone: body.customer_phone,
        appointment_date: body.appointment_date,
        appointment_time: body.appointment_time,
        notes: body.notes,
        status: "confirmed",
      })
      .select("*, services(name), businesses(business_name)")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (body.customer_email) {
      const emailContent = bookingConfirmationEmail({
        customerName: body.customer_name || "Customer",
        businessName: appointment.businesses?.business_name || "Business",
        serviceName: appointment.services?.name || "Service",
        date: body.appointment_date,
        time: body.appointment_time,
      });
      await sendEmail({
        to: body.customer_email,
        ...emailContent,
      }).catch(console.error);
    }

    await triggerN8nWebhook({
      event: "appointment.created",
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

    return NextResponse.json({ appointment }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create appointment" },
      { status: 500 }
    );
  }
}
