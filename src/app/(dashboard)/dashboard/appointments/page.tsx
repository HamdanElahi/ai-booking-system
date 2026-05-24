"use client";

import { AppointmentsTable } from "@/components/dashboard/appointments-table";
import { useBusiness } from "@/hooks/use-business";
import { useAppointments } from "@/hooks/use-appointments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AppointmentsPage() {
  const { business } = useBusiness();
  const { appointments, loading, refresh } = useAppointments(business?.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Appointments</h1>
        <p className="text-muted-foreground">Manage and update booking statuses</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All appointments</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : (
            <AppointmentsTable appointments={appointments} onUpdate={refresh} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
