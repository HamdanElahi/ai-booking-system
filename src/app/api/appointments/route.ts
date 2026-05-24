import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const businessId = searchParams.get("business_id");

  const supabase = await createClient();
  let query = supabase
    .from("appointments")
    .select("*, services(name, duration, price)")
    .order("appointment_date", { ascending: true })
    .order("appointment_time", { ascending: true });

  if (businessId) {
    query = query.eq("business_id", businessId);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ appointments: data });
}
