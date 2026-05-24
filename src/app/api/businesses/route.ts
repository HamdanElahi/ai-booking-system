import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { defaultBusinessHours } from "@/services/availability";

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("owner_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ businesses: data });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { business_name, industry, timezone } = body;

    if (!business_name) {
      return NextResponse.json(
        { error: "business_name is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const slug = slugify(business_name);

    const { data: business, error } = await supabase
      .from("businesses")
      .insert({
        owner_id: user.id,
        business_name,
        industry,
        timezone: timezone || "UTC",
        slug,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await supabase.from("business_hours").insert(
      defaultBusinessHours(business.id)
    );

    await supabase.from("profiles").update({ role: "owner" }).eq("id", user.id);

    return NextResponse.json({ business }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create business" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Business ID required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: business, error } = await supabase
      .from("businesses")
      .update(updates)
      .eq("id", id)
      .eq("owner_id", user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ business });
  } catch {
    return NextResponse.json({ error: "Failed to update business" }, { status: 500 });
  }
}
