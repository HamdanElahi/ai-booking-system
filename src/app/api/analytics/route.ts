import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const businessId = searchParams.get("business_id");

  if (!businessId) {
    return NextResponse.json({ error: "business_id required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("id", businessId)
    .eq("owner_id", user.id)
    .single();

  if (!business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  const today = new Date().toISOString().split("T")[0];

  const [
    { count: totalBookings },
    { count: upcomingAppointments },
    { data: revenueData },
    { data: customers },
  ] = await Promise.all([
    supabase
      .from("appointments")
      .select("*", { count: "exact", head: true })
      .eq("business_id", businessId)
      .neq("status", "cancelled"),
    supabase
      .from("appointments")
      .select("*", { count: "exact", head: true })
      .eq("business_id", businessId)
      .gte("appointment_date", today)
      .neq("status", "cancelled"),
    supabase
      .from("appointments")
      .select("services(price)")
      .eq("business_id", businessId)
      .eq("status", "confirmed"),
    supabase
      .from("appointments")
      .select("customer_email")
      .eq("business_id", businessId)
      .not("customer_email", "is", null),
  ]);

  const uniqueCustomers = new Set(
    (customers || []).map((c) => c.customer_email)
  ).size;

  const revenue = (revenueData || []).reduce((sum, apt) => {
    const price = (apt.services as { price?: number } | null)?.price || 0;
    return sum + Number(price);
  }, 0);

  const { count: conversations } = await supabase
    .from("ai_conversations")
    .select("*", { count: "exact", head: true })
    .eq("business_id", businessId);

  const conversionRate =
    conversations && conversations > 0
      ? Math.round(((totalBookings || 0) / conversations) * 100)
      : 0;

  return NextResponse.json({
    analytics: {
      totalBookings: totalBookings || 0,
      upcomingAppointments: upcomingAppointments || 0,
      activeCustomers: uniqueCustomers,
      revenue,
      conversionRate,
    },
  });
}
