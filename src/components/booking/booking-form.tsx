"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useMemo, useState, useTransition } from "react";
import { createBookingDraft } from "@/app/booking/actions";
import { StaggerContainer, StaggerItem } from "@/components/motion/stagger";
import { estimateBookingTotal } from "@/lib/pricing";
import { springTap } from "@/lib/motion";

type Pet = { id: string; name: string; sizeTier: string | null };

type Props = {
  pets: Pet[];
  isLoggedIn: boolean;
  baseNightlyCad: number;
  defaultCheckIn: string;
  defaultCheckOut: string;
};

export function BookingForm({
  pets,
  isLoggedIn,
  baseNightlyCad,
  defaultCheckIn,
  defaultCheckOut,
}: Props) {
  const [checkIn, setCheckIn] = useState(defaultCheckIn);
  const [checkOut, setCheckOut] = useState(defaultCheckOut);
  const [selected, setSelected] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    pets.forEach((p) => {
      init[p.id] = true;
    });
    return init;
  });
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const reduced = useReducedMotion() ?? false;

  const petIdsSelected = useMemo(
    () => Object.entries(selected).filter(([, v]) => v).map(([id]) => id),
    [selected],
  );

  const preview = useMemo(() => {
    if (petIdsSelected.length === 0) {
      return null;
    }
    const tiers = pets
      .filter((p) => petIdsSelected.includes(p.id))
      .map((p) => p.sizeTier ?? "medium");
    return estimateBookingTotal({
      baseNightlyCad,
      petSizeTiers: tiers,
      checkIn,
      checkOut,
    });
  }, [baseNightlyCad, checkIn, checkOut, petIdsSelected, pets]);

  function toggle(id: string) {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function onPayDeposit() {
    setError(null);
    if (!isLoggedIn) {
      setError("Please sign in first.");
      return;
    }
    if (petIdsSelected.length === 0) {
      setError("Select at least one pet.");
      return;
    }

    startTransition(async () => {
      const draft = await createBookingDraft({
        checkIn,
        checkOut,
        petIds: petIdsSelected,
      });

      if (!draft.ok) {
        setError(draft.message);
        return;
      }

      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "booking_deposit",
          bookingId: draft.bookingId,
        }),
      });

      const data = (await res.json()) as { url?: string; error?: string };

      if (res.status === 503) {
        setError("Stripe is not configured. Set STRIPE_SECRET_KEY to pay the deposit.");
        return;
      }

      if (!res.ok || !data.url) {
        setError(data.error ?? "Could not create checkout session.");
        return;
      }

      window.location.href = data.url;
    });
  }

  if (!isLoggedIn) {
    return (
      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-950">
        Sign in to book and pay your deposit.{" "}
        <Link href="/login?next=/booking" className="font-medium underline">
          Go to login
        </Link>
        .
      </div>
    );
  }

  if (pets.length === 0) {
    return (
      <div className="rounded-3xl border border-[var(--sg-border-subtle)] bg-[var(--sg-surface)] p-6 text-sm text-zinc-600">
        <p>Add a pet profile before you can create a booking.</p>
        <p className="mt-3">
          <Link href="/account/pets/new" className="font-medium text-[var(--sg-green)] underline underline-offset-4">
            Add a pet
          </Link>
        </p>
      </div>
    );
  }

  return (
    <StaggerContainer className="space-y-6">
      <StaggerItem>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm text-zinc-700">
            Check-in
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="mt-2 w-full rounded-xl border border-[var(--sg-border-subtle)] bg-[var(--sg-surface)] p-3"
            />
          </label>
          <label className="text-sm text-zinc-700">
            Check-out
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="mt-2 w-full rounded-xl border border-[var(--sg-border-subtle)] bg-[var(--sg-surface)] p-3"
            />
          </label>
        </div>
      </StaggerItem>

      <StaggerItem>
        <div>
          <p className="text-sm font-medium text-zinc-800">Pets on this stay (pricing combines selections)</p>
          <ul className="mt-2 space-y-2">
            {pets.map((pet) => (
              <li key={pet.id}>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700">
                  <input
                    type="checkbox"
                    checked={!!selected[pet.id]}
                    onChange={() => toggle(pet.id)}
                  />
                  {pet.name}
                  <span className="text-zinc-500">({pet.sizeTier ?? "medium"})</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      </StaggerItem>

      <StaggerItem>
        <div className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">
          {preview ? (
            <>
              Est. {preview.nights} night{preview.nights === 1 ? "" : "s"} · Total ~ CAD {preview.estimatedTotal} ·
              Deposit CAD {preview.deposit} (base nightly CAD {baseNightlyCad}; override with BOARDING_BASE_NIGHTLY_CAD)
            </>
          ) : (
            <>Select at least one pet to see the estimate.</>
          )}
        </div>
      </StaggerItem>

      <StaggerItem>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <motion.button
          type="button"
          onClick={onPayDeposit}
          disabled={pending}
          whileTap={reduced ? undefined : { scale: 0.97 }}
          transition={springTap}
          className="mt-2 rounded-full bg-[var(--sg-cta)] px-6 py-3 text-sm font-medium text-white disabled:opacity-60"
        >
          {pending ? "Working…" : "Create booking & pay deposit (Stripe)"}
        </motion.button>
      </StaggerItem>
    </StaggerContainer>
  );
}
