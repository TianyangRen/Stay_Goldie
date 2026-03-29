import { Resend } from "resend";

/** Resend client; null when RESEND_API_KEY is unset (emails are skipped). */
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const from =
  process.env.RESEND_FROM_EMAIL ?? "Stay Goldie <onboarding@resend.dev>";

/**
 * Sends booking confirmation when Resend is configured.
 * No-op if API key missing (local/dev without email).
 */
export async function sendBookingConfirmationEmail(to: string, bookingId: string) {
  if (!resend) return;
  await resend.emails.send({
    from,
    to,
    subject: "Booking confirmed",
    html: `<p>Your booking ${bookingId} is confirmed. Thank you for choosing Stay Goldie.</p>`,
  });
}

/**
 * Sends order paid notice when Resend is configured.
 * No-op if API key missing.
 */
export async function sendOrderPaidEmail(to: string, orderId: string) {
  if (!resend) return;
  await resend.emails.send({
    from,
    to,
    subject: "Order paid",
    html: `<p>Order ${orderId} was paid successfully. We will prepare it for fulfillment.</p>`,
  });
}

/**
 * Post-payment path: log failures without failing the webhook transaction.
 * Payment and inventory are already committed; email is best-effort.
 */
export async function sendBookingConfirmationEmailBestEffort(
  to: string,
  bookingId: string,
): Promise<void> {
  try {
    await sendBookingConfirmationEmail(to, bookingId);
  } catch (error) {
    console.error("[email] sendBookingConfirmationEmail failed", { bookingId, error });
  }
}

/** @see sendBookingConfirmationEmailBestEffort */
export async function sendOrderPaidEmailBestEffort(to: string, orderId: string): Promise<void> {
  try {
    await sendOrderPaidEmail(to, orderId);
  } catch (error) {
    console.error("[email] sendOrderPaidEmail failed", { orderId, error });
  }
}
