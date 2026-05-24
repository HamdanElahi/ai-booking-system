"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { AppointmentsTable } from "@/components/dashboard/appointments-table";
import { useBusiness } from "@/hooks/use-business";
import { useAppointments } from "@/hooks/use-appointments";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalyticsSummary } from "@/types/database";
import { ExternalLink } from "lucide-react";

export default function DashboardOverviewPage() {
  const { business } = useBusiness();
  const { appointments, refresh } = useAppointments(business?.id);
  const [analytics, setAnalytics] = useState<AnalyticsSummary>({
    totalBookings: 0,
    upcomingAppointments: 0,
    activeCustomers: 0,
    revenue: 0,
    conversionRate: 0,
  });

  useEffect(() => {
    if (!business?.id) return;
    fetch(`/api/analytics?business_id=${business.id}`)
      .then((r) => r.json())
      .then((d) => setAnalytics(d.analytics || analytics));
  }, [business?.id]);

  const upcoming = appointments
    .filter((a) => a.status !== "cancelled")
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Overview</h1>
          <p className="text-muted-foreground">
            Welcome back{business ? `, ${business.business_name}` : ""}
          </p>
        </div>
        {business && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" render={<Link href={`/book/${business.id}`} target="_blank" />}>
              <ExternalLink className="mr-2 h-4 w-4" />
              Booking page
            </Button>
            <Button variant="outline" size="sm" render={<Link href={`/chat/${business.id}`} target="_blank" />}>
              <ExternalLink className="mr-2 h-4 w-4" />
              Chat page
            </Button>
          </div>
        )}
      </div>

      {!business ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="mb-4 text-muted-foreground">
              Set up your business profile to get started.
            </p>
            <Button render={<Link href="/dashboard/settings" />}>
              Create business
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <StatsCards analytics={analytics} />
          <Card>
            <CardHeader>
              <CardTitle>Upcoming appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <AppointmentsTable appointments={upcoming} onUpdate={refresh} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
