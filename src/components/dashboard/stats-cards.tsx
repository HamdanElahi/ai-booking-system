import { Calendar, DollarSign, TrendingUp, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalyticsSummary } from "@/types/database";

interface StatsCardsProps {
  analytics: AnalyticsSummary;
}

export function StatsCards({ analytics }: StatsCardsProps) {
  const stats = [
    {
      title: "Total Bookings",
      value: analytics.totalBookings,
      icon: Calendar,
    },
    {
      title: "Upcoming",
      value: analytics.upcomingAppointments,
      icon: TrendingUp,
    },
    {
      title: "Active Customers",
      value: analytics.activeCustomers,
      icon: Users,
    },
    {
      title: "Revenue",
      value: `$${analytics.revenue.toFixed(0)}`,
      icon: DollarSign,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
