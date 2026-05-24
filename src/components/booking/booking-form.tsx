"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Service } from "@/types/database";
import { toast } from "sonner";

interface BookingFormProps {
  businessId: string;
  businessName?: string;
}

export function BookingForm({ businessId, businessName }: BookingFormProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState("");
  const [date, setDate] = useState<Date>();
  const [slots, setSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    fetch(`/api/services?business_id=${businessId}`)
      .then((r) => r.json())
      .then((d) => setServices(d.services || []));
  }, [businessId]);

  useEffect(() => {
    if (!selectedService || !date) return;
    const dateStr = format(date, "yyyy-MM-dd");
    fetch(
      `/api/appointments/availability?business_id=${businessId}&service_id=${selectedService}&date=${dateStr}`
    )
      .then((r) => r.json())
      .then((d) => setSlots(d.slots || []));
  }, [businessId, selectedService, date]);

  async function handleBook() {
    if (!selectedService || !date || !selectedSlot || !name || !email) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/appointments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_id: businessId,
          service_id: selectedService,
          customer_name: name,
          customer_email: email,
          customer_phone: phone,
          appointment_date: format(date, "yyyy-MM-dd"),
          appointment_time: selectedSlot,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setConfirmed(true);
      toast.success("Appointment booked!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Booking failed");
    } finally {
      setLoading(false);
    }
  }

  const selectedServiceData = services.find((s) => s.id === selectedService);

  return (
    <div className="mx-auto max-w-lg space-y-6 rounded-xl border bg-card p-6 shadow-sm">
      <div>
        <h2 className="text-2xl font-bold">Book an appointment</h2>
        {businessName && (
          <p className="text-muted-foreground">{businessName}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Service</Label>
        <Select value={selectedService} onValueChange={(v) => v && setSelectedService(v)}>
          <SelectTrigger>
            <SelectValue placeholder="Select a service" />
          </SelectTrigger>
          <SelectContent>
            {services.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name} — ${s.price} ({s.duration} min)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Date</Label>
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
          className="rounded-md border"
        />
      </div>

      {slots.length > 0 && (
        <div className="space-y-2">
          <Label>Available times</Label>
          <div className="grid grid-cols-3 gap-2">
            {slots.map((slot) => (
              <Button
                key={slot}
                variant={selectedSlot === slot ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedSlot(slot)}
              >
                {slot}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
      </div>

      <Button
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
        onClick={handleBook}
        disabled={loading}
      >
        {loading ? "Booking..." : "Confirm booking"}
      </Button>

      <Dialog open={confirmed} onOpenChange={setConfirmed}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Appointment confirmed!</DialogTitle>
            <DialogDescription>
              {selectedServiceData?.name} on{" "}
              {date && format(date, "PPP")} at {selectedSlot}.
              A confirmation email has been sent to {email}.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => setConfirmed(false)}>Close</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
