"use client";

import { useEffect, useState } from "react";
import { useBusiness } from "@/hooks/use-business";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function SettingsPage() {
  const { business, refresh } = useBusiness();
  const [businessName, setBusinessName] = useState(business?.business_name || "");
  const [industry, setIndustry] = useState(business?.industry || "");
  const [timezone, setTimezone] = useState(business?.timezone || "UTC");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (business) {
      setBusinessName(business.business_name);
      setIndustry(business.industry || "");
      setTimezone(business.timezone);
    }
  }, [business]);

  async function handleCreateOrUpdate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const method = business ? "PATCH" : "POST";
    const body = business
      ? { id: business.id, business_name: businessName, industry, timezone }
      : { business_name: businessName, industry, timezone };

    const res = await fetch("/api/businesses", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      toast.success(business ? "Business updated" : "Business created");
      refresh();
    } else {
      const data = await res.json();
      toast.error(data.error || "Failed to save");
    }
    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Business Settings</h1>
        <p className="text-muted-foreground">Configure your business profile</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{business ? "Update business" : "Create business"}</CardTitle>
          <CardDescription>
            This information powers your booking pages and AI receptionist.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateOrUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business name</Label>
              <Input
                id="businessName"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Demo Salon"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="Salon, Clinic, Gym..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Input
                id="timezone"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                placeholder="America/New_York"
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : business ? "Update business" : "Create business"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
