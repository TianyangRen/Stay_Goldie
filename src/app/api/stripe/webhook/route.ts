import { NextResponse } from "next/server";
import Stripe from "stripe";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendBookingConfirmationEmail, sendOrderPaidEmail } from "@/lib/email";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripeSecret = process.env.STRIPE_SECRET_KEY;

  if (!webhookSecret || !stripeSecret) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const stripe = new Stripe(stripeSecret, {
    apiVersion: "2026-03-25.dahlia",
  });

  const signature = request.headers.get("stripe-signature");
  const payload = await request.text();

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const checkoutSession = event.data.object as Stripe.Checkout.Session;
    const orderId = checkoutSession.metadata?.orderId;
    const bookingId = checkoutSession.metadata?.bookingId;

    try {
      await prisma.$transaction(async (tx) => {
        await tx.processedStripeEvent.create({ data: { id: event.id } });

        if (orderId) {
          const existing = await tx.order.findUnique({ where: { id: orderId } });
          if (existing?.status === "PENDING") {
            const order = await tx.order.update({
              where: { id: orderId },
              data: { status: "PAID", stripeSessionId: checkoutSession.id },
              include: { items: true, owner: true },
            });

            for (const item of order.items) {
              await tx.inventory.update({
                where: { productId: item.productId },
                data: { stock: { decrement: item.quantity } },
              });
            }

            if (order.owner.email) {
              await sendOrderPaidEmail(order.owner.email, order.id);
            }
          }
        }

        if (bookingId) {
          const bookingRow = await tx.booking.findUnique({ where: { id: bookingId } });
          if (bookingRow && bookingRow.status === "PENDING") {
            const booking = await tx.booking.update({
              where: { id: bookingId },
              data: { status: "CONFIRMED", stripeSessionId: checkoutSession.id },
              include: { owner: true },
            });

            if (booking.owner.email) {
              await sendBookingConfirmationEmail(booking.owner.email, booking.id);
            }
          }
        }
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        return NextResponse.json({ received: true, duplicate: true });
      }
      console.error(error);
      return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
