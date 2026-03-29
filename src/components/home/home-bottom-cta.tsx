"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Pressable } from "@/components/motion/pressable";
import { springSnappy } from "@/lib/motion";

export function HomeBottomCta() {
  const reduced = useReducedMotion() ?? false;

  return (
    <section className="section-surface-alt py-14 md:py-20" aria-labelledby="home-bottom-cta-heading">
      <div className="section-wrap">
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 20 }}
          whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={springSnappy}
          className="card-elevated mx-auto max-w-3xl rounded-[1.75rem] px-6 py-10 text-center md:px-12 md:py-12"
        >
          <h2 id="home-bottom-cta-heading" className="text-2xl font-semibold text-[var(--sg-green)] md:text-3xl">
            Ready for a calm, tails-wagging stay?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-[var(--sg-muted)] md:text-base">
            Lock your dates with a deposit, or stock up on treats and gear—everything stays on-site for a smooth,
            spa-like experience.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Pressable className="inline-block">
              <Link
                href="/booking"
                className="focus-ring-clay inline-flex cursor-pointer rounded-full bg-[var(--sg-cta)] px-8 py-3.5 text-sm font-semibold text-white shadow-md transition-clay hover:brightness-105 hover:shadow-lg"
              >
                Book boarding
              </Link>
            </Pressable>
            <Pressable className="inline-block">
              <Link
                href="/shop"
                className="focus-ring-clay inline-flex cursor-pointer rounded-full border-[3px] border-white/80 bg-white/95 px-8 py-3.5 text-sm font-semibold text-[var(--sg-text)] shadow-sm transition-clay hover:bg-white"
              >
                Visit the shop
              </Link>
            </Pressable>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
