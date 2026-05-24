"use client";

import { useMemo } from "react";
import { useBusiness } from "@/hooks/use-business";
import { useAppointments } from "@/hooks/use-appointments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CustomersPage() {
  const { business } = useBusiness();
  const { appointments, loading } = useAppointments(business?.id);

  const customers = useMemo(() => {
    const map = new Map<string, { name: string; email: string; phone: string; bookings: number }>();
    for (const apt of appointments) {
      const key = apt.customer_email || apt.customer_phone || apt.customer_name || "unknown";
      const existing = map.get(key);
      if (existing) {
        existing.bookings += 1;
      } else {
        map.set(key, {
          name: apt.customer_name || "—",
          email: apt.customer_email || "—",
          phone: apt.customer_phone || "—",
          bookings: 1,
        });
      }
    }
    return Array.from(map.values());
  }, [appointments]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Customers</h1>
        <p className="text-muted-foreground">Customers who have booked appointments</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Customer list</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : customers.length === 0 ? (
            <p className="text-muted-foreground">No customers yet.</p>
          ) : (
            <ul className="divide-y">
              {customers.map((c, i) => (
                <li key={i} className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-sm text-muted-foreground">{c.email}</p>
                  </div>
                  <span className="text-sm text-muted-foreground">{c.bookings} booking(s)</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
