import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/supabase/profiles";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      try {
        await ensureProfile({
          id: data.user.id,
          email: data.user.email,
          name:
            data.user.user_metadata?.name ||
            data.user.user_metadata?.full_name ||
            null,
          role: data.user.user_metadata?.role || "owner",
        });
      } catch (profileError) {
        console.error("[auth callback] profile creation failed:", profileError);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
