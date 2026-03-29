"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { PropsWithChildren, ReactNode } from "react";
import { springSnappy } from "@/lib/motion";

export function FeatureCard({
  title,
  children,
  icon,
}: PropsWithChildren<{ title: string; icon?: ReactNode }>) {
  const rd = useReducedMotion() ?? false;
  return (
    <motion.article
      whileHover={rd ? undefined : { y: -4 }}
      whileTap={rd ? undefined : { scale: 0.99 }}
      transition={rd ? { duration: 0.01 } : springSnappy}
      className="card-elevated h-full cursor-default rounded-3xl p-6 transition-clay hover:shadow-[6px_10px_28px_rgba(249,115,22,0.16),-2px_-2px_14px_rgba(255,255,255,0.9)]"
    >
      {icon ? (
        <div
          className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--sg-cta)]/12 text-[var(--sg-cta)]"
          aria-hidden
        >
          {icon}
        </div>
      ) : null}
      <h3 className="text-lg font-semibold text-[var(--sg-text)]">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-[var(--sg-muted)]">{children}</p>
    </motion.article>
  );
}
