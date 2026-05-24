export type UserRole = "owner" | "customer" | "admin";

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed"
  | "no_show";

export type ChatIntent =
  | "book"
  | "faq"
  | "cancel"
  | "reschedule"
  | "greeting"
  | "unknown";

export interface Profile {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  role: UserRole;
  created_at: string;
}

export interface Business {
  id: string;
  owner_id: string;
  business_name: string;
  industry: string | null;
  timezone: string;
  slug: string | null;
  ai_tone: string | null;
  ai_custom_prompt: string | null;
  created_at: string;
}

export interface Service {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  duration: number;
  price: number;
  created_at: string;
}

export interface Appointment {
  id: string;
  business_id: string;
  customer_id: string | null;
  service_id: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  appointment_date: string;
  appointment_time: string;
  status: AppointmentStatus;
  notes: string | null;
  created_at: string;
  services?: Service;
}

export interface Faq {
  id: string;
  business_id: string;
  question: string;
  answer: string;
}

export interface AiConversation {
  id: string;
  business_id: string;
  customer_id: string | null;
  session_id: string;
  summary: string | null;
  last_intent: ChatIntent | null;
  created_at: string;
}

export interface BusinessHours {
  id: string;
  business_id: string;
  day_of_week: number;
  open_time: string;
  close_time: string;
  is_closed: boolean;
}

export interface AnalyticsSummary {
  totalBookings: number;
  upcomingAppointments: number;
  activeCustomers: number;
  revenue: number;
  conversionRate: number;
}
