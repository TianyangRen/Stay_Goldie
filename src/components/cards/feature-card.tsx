"use client";

import { motion } from "framer-motion";
import type { PropsWithChildren } from "react";

export function FeatureCard({
  title,
  children,
}: PropsWithChildren<{ title: string }>) {
  return (
    <motion.article
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm"
    >
      <h3 className="text-lg font-semibold text-zinc-900">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-zinc-600">{children}</p>
    </motion.article>
  );
}
