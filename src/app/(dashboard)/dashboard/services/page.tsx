"use client";

import { useEffect, useState } from "react";
import { useBusiness } from "@/hooks/use-business";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Service } from "@/types/database";
import { toast } from "sonner";

export default function ServicesPage() {
  const { business } = useBusiness();
  const [services, setServices] = useState<Service[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("30");
  const [price, setPrice] = useState("0");

  function loadServices() {
    if (!business?.id) return;
    fetch(`/api/services?business_id=${business.id}`)
      .then((r) => r.json())
      .then((d) => setServices(d.services || []));
  }

  useEffect(() => {
    loadServices();
  }, [business?.id]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!business?.id) return;

    const res = await fetch("/api/services/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        business_id: business.id,
        name,
        description,
        duration: parseInt(duration, 10),
        price: parseFloat(price),
      }),
    });

    if (res.ok) {
      toast.success("Service created");
      setName("");
      setDescription("");
      loadServices();
    } else {
      toast.error("Failed to create service");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Services</h1>
        <p className="text-muted-foreground">Manage your service offerings and pricing</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Add service</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (min)</Label>
                  <Input id="duration" type="number" value={duration} onChange={(e) => setDuration(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input id="price" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
                </div>
              </div>
              <Button type="submit" disabled={!business}>Add service</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your services</CardTitle>
          </CardHeader>
          <CardContent>
            {services.length === 0 ? (
              <p className="text-muted-foreground">No services yet.</p>
            ) : (
              <ul className="space-y-3">
                {services.map((s) => (
                  <li key={s.id} className="rounded-lg border p-4">
                    <p className="font-medium">{s.name}</p>
                    <p className="text-sm text-muted-foreground">{s.description}</p>
                    <p className="text-sm">${s.price} · {s.duration} min</p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}