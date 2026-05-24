"use client";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { useBusiness } from "@/hooks/use-business";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { business, loading } = useBusiness();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Skeleton className="h-8 w-48" />
      </div>
    );
  }

  return (
    <DashboardShell businessName={business?.business_name}>
      {children}
    </DashboardShell>
  );
}
