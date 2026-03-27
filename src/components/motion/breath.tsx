"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { PropsWithChildren } from "react";

type Props = PropsWithChildren<{ className?: string }>;

/** Subtle continuous scale pulse — use sparingly (hero visual / primary CTA). */
export function Breath({ children, className }: Props) {
  const reduced = useReducedMotion() ?? false;
  if (reduced) {
    return <div className={className}>{children}</div>;
  }
  return (
    <motion.div
      className={className}
      animate={{ scale: [1, 1.015, 1] }}
      transition={{
        duration: 5.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );
}
