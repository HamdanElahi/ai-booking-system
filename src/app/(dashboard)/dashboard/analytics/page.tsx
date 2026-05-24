"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { useBusiness } from "@/hooks/use-business";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalyticsSummary } from "@/types/database";

export default function AnalyticsPage() {
  const { business } = useBusiness();
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
      .then((d) => {
        if (d.analytics) setAnalytics(d.analytics);
      });
  }, [business?.id]);

  const chartData = [
    { name: "Bookings", value: analytics.totalBookings },
    { name: "Upcoming", value: analytics.upcomingAppointments },
    { name: "Customers", value: analytics.activeCustomers },
    { name: "Conversion %", value: analytics.conversionRate },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Track bookings, revenue, and conversion</p>
      </div>

      <StatsCards analytics={analytics} />

      <Card>
        <CardHeader>
          <CardTitle>Metrics overview</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="oklch(0.488 0.243 264.376)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
