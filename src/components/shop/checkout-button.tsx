"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { Breath } from "@/components/motion/breath";
import { springTap } from "@/lib/motion";

type Props = {
  productId: string;
  quantity?: number;
  label?: string;
};

export function CheckoutButton({ productId, quantity = 1, label = "Checkout with Stripe" }: Props) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const reduced = useReducedMotion() ?? false;

  async function onCheckout() {
    setPending(true);
    setMessage(null);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "shop_order",
        items: [{ productId, quantity }],
      }),
    });
    const data = (await res.json()) as { url?: string; error?: string };

    if (res.status === 401) {
      setMessage("Please sign in before checkout.");
      setPending(false);
      return;
    }

    if (!res.ok || !data.url) {
      setMessage(data.error ?? "Could not create checkout session. Check Stripe environment variables.");
      setPending(false);
      return;
    }

    window.location.href = data.url;
  }

  return (
    <div className="mt-5 space-y-2">
      <Breath className="inline-block">
        <motion.button
          type="button"
          onClick={onCheckout}
          disabled={pending}
          whileTap={reduced ? undefined : { scale: 0.97 }}
          transition={springTap}
          className="rounded-full bg-[var(--sg-cta)] px-5 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {pending ? "Redirecting…" : label}
        </motion.button>
      </Breath>
      {message ? <p className="text-xs text-amber-800">{message}</p> : null}
    </div>
  );
}
