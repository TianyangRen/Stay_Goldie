import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const from =
  process.env.RESEND_FROM_EMAIL ?? "Stay Goldie <onboarding@resend.dev>";

export async function sendBookingConfirmationEmail(to: string, bookingId: string) {
  if (!resend) return;
  await resend.emails.send({
    from,
    to,
    subject: "预约确认",
    html: `<p>你的预约 ${bookingId} 已确认。感谢选择 Stay Goldie。</p>`,
  });
}

export async function sendOrderPaidEmail(to: string, orderId: string) {
  if (!resend) return;
  await resend.emails.send({
    from,
    to,
    subject: "订单已支付",
    html: `<p>订单 ${orderId} 已支付成功，我们会尽快安排发货。</p>`,
  });
}
