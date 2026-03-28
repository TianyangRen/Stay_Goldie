import { Prisma } from "@prisma/client";
import type Stripe from "stripe";
import {
  sendBookingConfirmationEmailBestEffort,
  sendOrderPaidEmailBestEffort,
} from "@/lib/email";
import { prisma } from "@/lib/prisma";

/** Prisma interactive transaction handle passed to helpers. */
type TransactionClient = Prisma.TransactionClient;

/** Decrements stock for each paid line item. */
async function decrementInventoryForOrderItems(
  tx: TransactionClient,
  items: { productId: string; quantity: number }[],
): Promise<void> {
  for (const item of items) {
    await tx.inventory.update({
      where: { productId: item.productId },
      data: { stock: { decrement: item.quantity } },
    });
  }
}

/** Marks a pending order paid and adjusts inventory. */
async function fulfillShopOrderIfPending(
  tx: TransactionClient,
  orderId: string,
  checkoutSessionId: string,
): Promise<void> {
  const existing = await tx.order.findUnique({ where: { id: orderId } });
  if (existing?.status !== "PENDING") {
    return;
  }

  const order = await tx.order.update({
    where: { id: orderId },
    data: { status: "PAID", stripeSessionId: checkoutSessionId },
    include: { items: true, owner: true },
  });

  await decrementInventoryForOrderItems(tx, order.items);

  if (order.owner.email) {
    await sendOrderPaidEmailBestEffort(order.owner.email, order.id);
  }
}

/** Confirms a pending booking after deposit payment. */
async function fulfillBookingIfPending(
  tx: TransactionClient,
  bookingId: string,
  checkoutSessionId: string,
): Promise<void> {
  const bookingRow = await tx.booking.findUnique({ where: { id: bookingId } });
  if (!bookingRow || bookingRow.status !== "PENDING") {
    return;
  }

  const booking = await tx.booking.update({
    where: { id: bookingId },
    data: { status: "CONFIRMED", stripeSessionId: checkoutSessionId },
    include: { owner: true },
  });

  if (booking.owner.email) {
    await sendBookingConfirmationEmailBestEffort(booking.owner.email, booking.id);
  }
}

/**
 * Runs inside a DB transaction: records event idempotency, then fulfills order and/or booking.
 * Throws on unexpected DB errors (caller maps to HTTP 500).
 */
export async function fulfillCheckoutSessionInTransaction(
  tx: TransactionClient,
  stripeEventId: string,
  checkoutSession: Stripe.Checkout.Session,
): Promise<void> {
  await tx.processedStripeEvent.create({ data: { id: stripeEventId } });

  const orderId = checkoutSession.metadata?.orderId;
  const bookingId = checkoutSession.metadata?.bookingId;

  if (orderId) {
    await fulfillShopOrderIfPending(tx, orderId, checkoutSession.id);
  }
  if (bookingId) {
    await fulfillBookingIfPending(tx, bookingId, checkoutSession.id);
  }
}

/**
 * Idempotent webhook handling: duplicate Stripe event id → Prisma P2002 (caller may treat as OK).
 */
export async function runCheckoutSessionCompletedFulfillment(
  stripeEventId: string,
  checkoutSession: Stripe.Checkout.Session,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await fulfillCheckoutSessionInTransaction(tx, stripeEventId, checkoutSession);
  });
}

/** Stripe may retry; duplicate processedStripeEvent id is treated as success. */
export function isPrismaUniqueViolation(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}
