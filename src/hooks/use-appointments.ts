"use client";

import { useCallback, useEffect, useState } from "react";
import type { Appointment } from "@/types/database";

export function useAppointments(businessId?: string) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    const res = await fetch(`/api/appointments?business_id=${businessId}`);
    const data = await res.json();
    setAppointments(data.appointments || []);
    setLoading(false);
  }, [businessId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { appointments, loading, refresh };
}
