import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createStripeSessionForBookingDeposit } from "@/lib/booking-deposit-checkout";
import { checkoutPostBodySchema } from "@/lib/checkout-post-body";
import {
  createPendingShopOrder,
  createStripeSessionForShopOrder,
  ShopOrderCheckoutError,
} from "@/lib/shop-order-checkout";
import { getStripeClient } from "@/lib/stripe-client";

export const runtime = "nodejs";

/**
 * HTTP adapter: OWNER-only Stripe Checkout for shop orders or booking deposits.
 * Business rules live under src/lib/*checkout*.ts.
 */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Checkout is for owner accounts only" }, { status: 403 });
  }

  const stripe = getStripeClient();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const parsedBody = checkoutPostBodySchema.safeParse(await request.json());
  if (!parsedBody.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const ownerId = session.user.id;

  if (parsedBody.data.type === "shop_order") {
    try {
      const order = await createPendingShopOrder(ownerId, parsedBody.data.items);
      const { url } = await createStripeSessionForShopOrder(stripe, order, baseUrl);
      return NextResponse.json({ url });
    } catch (error) {
      if (error instanceof ShopOrderCheckoutError) {
        console.error("[checkout] shop order", error.message);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      console.error("[checkout] shop order unexpected", error);
      return NextResponse.json({ error: "Could not create checkout" }, { status: 500 });
    }
  }

  try {
    const depositResult = await createStripeSessionForBookingDeposit(
      stripe,
      { bookingId: parsedBody.data.bookingId, ownerId },
      baseUrl,
    );

    if ("error" in depositResult) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json({ url: depositResult.url });
  } catch (error) {
    console.error("[checkout] booking deposit", error);
    return NextResponse.json({ error: "Could not create checkout" }, { status: 500 });
  }
}
