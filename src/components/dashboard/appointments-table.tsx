"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Appointment } from "@/types/database";
import { toast } from "sonner";

interface AppointmentsTableProps {
  appointments: Appointment[];
  onUpdate?: () => void;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  completed: "bg-blue-100 text-blue-800",
  no_show: "bg-gray-100 text-gray-800",
};

export function AppointmentsTable({
  appointments,
  onUpdate,
}: AppointmentsTableProps) {
  async function updateStatus(id: string, status: string) {
    const res = await fetch("/api/appointments/update", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      toast.success(`Appointment ${status}`);
      onUpdate?.();
    } else {
      toast.error("Failed to update appointment");
    }
  }

  if (appointments.length === 0) {
    return (
      <p className="py-8 text-center text-muted-foreground">
        No appointments yet.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Customer</TableHead>
          <TableHead>Service</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Time</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {appointments.map((apt) => (
          <TableRow key={apt.id}>
            <TableCell>
              <div>
                <p className="font-medium">{apt.customer_name || "—"}</p>
                <p className="text-xs text-muted-foreground">{apt.customer_email}</p>
              </div>
            </TableCell>
            <TableCell>{apt.services?.name || "—"}</TableCell>
            <TableCell>{apt.appointment_date}</TableCell>
            <TableCell>{String(apt.appointment_time).slice(0, 5)}</TableCell>
            <TableCell>
              <Badge className={statusColors[apt.status] || ""}>
                {apt.status}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex gap-1">
                {apt.status !== "cancelled" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateStatus(apt.id, "cancelled")}
                  >
                    Cancel
                  </Button>
                )}
                {apt.status === "confirmed" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateStatus(apt.id, "completed")}
                  >
                    Complete
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
