import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/supabase/profiles";

export async function POST(request: Request) {
  try {
    const { email, password, name, role } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role: role || "owner" },
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (data.user) {
      try {
        await ensureProfile({
          id: data.user.id,
          email: data.user.email,
          name,
          role: role || "owner",
        });
      } catch (profileError) {
        console.error("[signup] profile creation failed:", profileError);
        return NextResponse.json(
          {
            error:
              profileError instanceof Error
                ? profileError.message
                : "Failed to create user profile",
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ user: data.user });
  } catch (err) {
    console.error("[signup]", err);
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}
