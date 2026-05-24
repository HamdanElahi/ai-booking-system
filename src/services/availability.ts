import {
  addMinutes,
  format,
  isAfter,
  isBefore,
  parse,
  setHours,
  setMinutes,
} from "date-fns";
import type { BusinessHours } from "@/types/database";

const SLOT_INTERVAL = 30;

export function generateTimeSlots(
  date: string,
  duration: number,
  businessHours: BusinessHours[],
  bookedTimes: string[]
): string[] {
  const dayOfWeek = new Date(date).getDay();
  const hours = businessHours.find((h) => h.day_of_week === dayOfWeek);

  if (!hours || hours.is_closed) return [];

  const slots: string[] = [];
  const open = parse(hours.open_time.slice(0, 5), "HH:mm", new Date(date));
  const close = parse(hours.close_time.slice(0, 5), "HH:mm", new Date(date));
  let current = open;

  while (isBefore(addMinutes(current, duration), close) || format(addMinutes(current, duration), "HH:mm") === format(close, "HH:mm")) {
    const slotTime = format(current, "HH:mm");
    const slotEnd = addMinutes(current, duration);
    if (!isAfter(slotEnd, close) && !bookedTimes.includes(slotTime)) {
      slots.push(slotTime);
    }
    current = addMinutes(current, SLOT_INTERVAL);
  }

  return slots;
}

export function defaultBusinessHours(businessId: string): Omit<BusinessHours, "id">[] {
  return Array.from({ length: 7 }, (_, day) => ({
    business_id: businessId,
    day_of_week: day,
    open_time: "09:00",
    close_time: "17:00",
    is_closed: day === 0,
  }));
}

export function formatAppointmentDateTime(date: string, time: string): Date {
  const [hours, minutes] = time.split(":").map(Number);
  const base = new Date(date);
  return setMinutes(setHours(base, hours), minutes);
}
