"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { PropsWithChildren } from "react";
import { reducedTransition, springSnappy } from "@/lib/motion";

type Props = PropsWithChildren<{
  className?: string;
  /** seconds */
  delay?: number;
  y?: number;
  amount?: number | "some";
}>;

export function Reveal({
  children,
  className,
  delay = 0,
  y = 20,
  amount = 0.15,
}: Props) {
  const reduced = useReducedMotion() ?? false;
  return (
    <motion.div
      className={className}
      initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={
        reduced
          ? reducedTransition
          : {
              ...springSnappy,
              delay,
            }
      }
    >
      {children}
    </motion.div>
  );
}
