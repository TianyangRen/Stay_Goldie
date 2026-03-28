import Stripe from "stripe";

/** Stripe API version pinned for Checkout + Webhooks compatibility. */
export const STRIPE_API_VERSION = "2026-03-25.dahlia" as const;

let cachedClient: Stripe | null | undefined;

/**
 * Lazily constructs the Stripe SDK using STRIPE_SECRET_KEY.
 * Returns null when the key is unset (routes should respond 503).
 */
export function getStripeClient(): Stripe | null {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    return null;
  }
  if (cachedClient === undefined) {
    cachedClient = new Stripe(secret, { apiVersion: STRIPE_API_VERSION });
  }
  return cachedClient;
}

/** Reads webhook signing secret; null if misconfigured. */
export function getStripeWebhookSecret(): string | null {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  return secret?.trim() ? secret : null;
}
