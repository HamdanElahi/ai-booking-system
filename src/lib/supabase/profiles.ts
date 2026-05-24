import type { UserRole } from "@/types/database";
import { createServiceClient } from "@/lib/supabase/server";

const VALID_ROLES: UserRole[] = ["owner", "customer", "admin"];

export function normalizeRole(role?: string | null): UserRole {
  if (role && VALID_ROLES.includes(role as UserRole)) {
    return role as UserRole;
  }
  return "owner";
}

export async function ensureProfile(params: {
  id: string;
  email?: string | null;
  name?: string | null;
  role?: string | null;
}) {
  const admin = await createServiceClient();

  const { error } = await admin.from("profiles").upsert(
    {
      id: params.id,
      email: params.email ?? null,
      name: params.name ?? null,
      role: normalizeRole(params.role),
    },
    { onConflict: "id" }
  );

  if (error) {
    throw new Error(error.message);
  }
}
