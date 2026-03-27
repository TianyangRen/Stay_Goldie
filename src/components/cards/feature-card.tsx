"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { PropsWithChildren } from "react";
import { springSnappy } from "@/lib/motion";

export function FeatureCard({
  title,
  children,
}: PropsWithChildren<{ title: string }>) {
  const rd = useReducedMotion() ?? false;
  return (
    <motion.article
      whileHover={rd ? undefined : { y: -4 }}
      whileTap={rd ? undefined : { scale: 0.97 }}
      transition={rd ? { duration: 0.01 } : springSnappy}
      className="card-elevated rounded-3xl p-6"
    >
      <h3 className="text-lg font-semibold text-zinc-900">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-zinc-600">{children}</p>
    </motion.article>
  );
}
