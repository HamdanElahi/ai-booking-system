import type { AppointmentStatus } from "@/types/database";

export interface CreateAppointmentInput {
  business_id: string;
  service_id: string;
  customer_id?: string | null;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  appointment_date: string;
  appointment_time: string;
  notes?: string;
}

export interface UpdateAppointmentInput {
  id: string;
  status?: AppointmentStatus;
  appointment_date?: string;
  appointment_time?: string;
  notes?: string;
}

export function validateAppointmentInput(input: CreateAppointmentInput): string | null {
  if (!input.business_id) return "Business is required";
  if (!input.service_id) return "Service is required";
  if (!input.appointment_date) return "Date is required";
  if (!input.appointment_time) return "Time is required";
  if (!input.customer_email && !input.customer_phone && !input.customer_id) {
    return "Customer contact information is required";
  }
  return null;
}
