"use client";

import { useCallback, useEffect, useState } from "react";
import type { Business } from "@/types/database";

export function useBusiness() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/businesses");
    const data = await res.json();
    setBusiness(data.businesses?.[0] || null);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { business, loading, refresh };
}
