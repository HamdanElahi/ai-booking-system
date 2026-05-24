import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailPayload) {
  if (!resend) {
    console.warn("[notifications] RESEND_API_KEY not set, skipping email to", to);
    return { success: false, skipped: true };
  }

  const from = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

  const { data, error } = await resend.emails.send({ from, to, subject, html });
  if (error) throw error;
  return { success: true, id: data?.id };
}

export function bookingConfirmationEmail(params: {
  customerName: string;
  businessName: string;
  serviceName: string;
  date: string;
  time: string;
}) {
  const { customerName, businessName, serviceName, date, time } = params;
  return {
    subject: `Appointment confirmed at ${businessName}`,
    html: `
      <h2>Hi ${customerName},</h2>
      <p>Your appointment has been confirmed!</p>
      <ul>
        <li><strong>Business:</strong> ${businessName}</li>
        <li><strong>Service:</strong> ${serviceName}</li>
        <li><strong>Date:</strong> ${date}</li>
        <li><strong>Time:</strong> ${time}</li>
      </ul>
      <p>We look forward to seeing you!</p>
    `,
  };
}

export function cancellationEmail(params: {
  customerName: string;
  businessName: string;
  date: string;
  time: string;
}) {
  const { customerName, businessName, date, time } = params;
  return {
    subject: `Appointment cancelled — ${businessName}`,
    html: `
      <h2>Hi ${customerName},</h2>
      <p>Your appointment on ${date} at ${time} has been cancelled.</p>
      <p>Contact ${businessName} if you'd like to rebook.</p>
    `,
  };
}

export function reminderEmail(params: {
  customerName: string;
  businessName: string;
  serviceName: string;
  date: string;
  time: string;
}) {
  const { customerName, businessName, serviceName, date, time } = params;
  return {
    subject: `Reminder: Your appointment tomorrow at ${businessName}`,
    html: `
      <h2>Hi ${customerName},</h2>
      <p>This is a friendly reminder about your upcoming appointment:</p>
      <ul>
        <li><strong>Service:</strong> ${serviceName}</li>
        <li><strong>Date:</strong> ${date}</li>
        <li><strong>Time:</strong> ${time}</li>
      </ul>
    `,
  };
}
