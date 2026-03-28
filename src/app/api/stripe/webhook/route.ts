import { NextResponse } from "next/server";
import type Stripe from "stripe";
import {
  isPrismaUniqueViolation,
  runCheckoutSessionCompletedFulfillment,
} from "@/lib/stripe-checkout-fulfillment";
import { getStripeClient, getStripeWebhookSecret } from "@/lib/stripe-client";

export const runtime = "nodejs";

/**
 * Verifies Stripe signature and delegates payment fulfillment to lib layer.
 */
export async function POST(request: Request) {
  const webhookSecret = getStripeWebhookSecret();
  const stripe = getStripeClient();

  if (!webhookSecret || !stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  const payload = await request.text();

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    console.error("[webhook] signature", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const checkoutSession = event.data.object as Stripe.Checkout.Session;
    try {
      await runCheckoutSessionCompletedFulfillment(event.id, checkoutSession);
    } catch (error) {
      if (isPrismaUniqueViolation(error)) {
        return NextResponse.json({ received: true, duplicate: true });
      }
      console.error("[webhook] fulfillment", error);
      return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
