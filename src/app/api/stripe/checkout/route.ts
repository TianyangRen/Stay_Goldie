import { NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const schema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("shop_order"),
    items: z
      .array(z.object({ productId: z.string().min(1), quantity: z.number().int().positive() }))
      .min(1),
  }),
  z.object({
    type: z.literal("booking_deposit"),
    bookingId: z.string().min(1),
  }),
]);

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Checkout is for owner accounts only" }, { status: 403 });
  }

  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecret) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const stripe = new Stripe(stripeSecret, {
    apiVersion: "2026-03-25.dahlia",
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (parsed.data.type === "shop_order") {
    const cartItems = parsed.data.items;
    try {
      const order = await prisma.$transaction(async (tx) => {
        let subtotal = 0;
        const lines: { productId: string; quantity: number; unit: number; name: string }[] = [];

        for (const line of cartItems) {
          const product = await tx.product.findUnique({
            where: { id: line.productId },
            include: { inventory: true },
          });

          if (!product?.isActive || !product.inventory) {
            throw new Error("Product unavailable");
          }

          if (product.inventory.stock < line.quantity) {
            throw new Error("Insufficient stock");
          }

          const unit = Number(product.salePriceCad ?? product.basePriceCad);
          subtotal += unit * line.quantity;
          lines.push({
            productId: product.id,
            quantity: line.quantity,
            unit,
            name: product.name,
          });
        }

        return tx.order.create({
          data: {
            ownerId: session.user.id,
            status: "PENDING",
            subtotalCad: new Prisma.Decimal(subtotal),
            totalCad: new Prisma.Decimal(subtotal),
            items: {
              create: lines.map((line) => ({
                productId: line.productId,
                quantity: line.quantity,
                unitPriceCad: new Prisma.Decimal(line.unit),
              })),
            },
          },
          include: { items: { include: { product: true } } },
        });
      });

      const stripeSession = await stripe.checkout.sessions.create({
        mode: "payment",
        currency: "cad",
        line_items: order.items.map((item) => ({
          quantity: item.quantity,
          price_data: {
            currency: "cad",
            unit_amount: Math.round(Number(item.unitPriceCad) * 100),
            product_data: { name: item.product.name },
          },
        })),
        success_url: `${baseUrl}/account/orders?checkout=success`,
        cancel_url: `${baseUrl}/shop`,
        metadata: { orderId: order.id },
      });

      await prisma.order.update({
        where: { id: order.id },
        data: { stripeSessionId: stripeSession.id },
      });

      return NextResponse.json({ url: stripeSession.url });
    } catch (error) {
      console.error(error);
      return NextResponse.json({ error: "Could not create checkout" }, { status: 400 });
    }
  }

  const booking = await prisma.booking.findFirst({
    where: { id: parsed.data.bookingId, ownerId: session.user.id },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
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

  return NextResponse.json({ url: stripeSession.url });
}
