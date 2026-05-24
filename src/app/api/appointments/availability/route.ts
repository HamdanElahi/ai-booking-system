import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateTimeSlots } from "@/services/availability";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const businessId = searchParams.get("business_id");
  const serviceId = searchParams.get("service_id");
  const date = searchParams.get("date");

  if (!businessId || !serviceId || !date) {
    return NextResponse.json(
      { error: "business_id, service_id, and date are required" },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  const [{ data: service }, { data: hours }, { data: booked }] = await Promise.all([
    supabase.from("services").select("duration").eq("id", serviceId).single(),
    supabase.from("business_hours").select("*").eq("business_id", businessId),
    supabase
      .from("appointments")
      .select("appointment_time")
      .eq("business_id", businessId)
      .eq("appointment_date", date)
      .neq("status", "cancelled"),
  ]);

  if (!service) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

  const bookedTimes = (booked || []).map((a) =>
    String(a.appointment_time).slice(0, 5)
  );

  const slots = generateTimeSlots(
    date,
    service.duration,
    hours || [],
    bookedTimes
  );

  return NextResponse.json({ slots });
}
