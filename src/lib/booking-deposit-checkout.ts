import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";

/**
 * Creates a Stripe Checkout session for an existing booking deposit and stores session id.
 */
export async function createStripeSessionForBookingDeposit(
  stripe: Stripe,
  params: { bookingId: string; ownerId: string },
  baseUrl: string,
): Promise<{ url: string | null } | { error: "not_found" }> {
  const booking = await prisma.booking.findFirst({
    where: { id: params.bookingId, ownerId: params.ownerId },
  });

  if (!booking) {
    return { error: "not_found" };
  }

  const amountCents = Math.round(Number(booking.depositCad) * 100);

  const stripeSession = await stripe.checkout.sessions.create({
    mode: "payment",
    currency: "cad",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "cad",
          unit_amount: amountCents,
          product_data: { name: "Boarding deposit" },
        },
      },
    ],
    success_url: `${baseUrl}/account/bookings?checkout=success`,
    cancel_url: `${baseUrl}/booking`,
    metadata: { bookingId: booking.id },
  });

  await prisma.booking.update({
    where: { id: booking.id },
    data: { stripeSessionId: stripeSession.id },
  });

  return { url: stripeSession.url ?? null };
}
