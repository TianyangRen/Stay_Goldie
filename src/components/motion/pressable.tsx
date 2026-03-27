"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { PropsWithChildren } from "react";
import { springTap } from "@/lib/motion";

type Props = PropsWithChildren<{
  className?: string;
}>;

/**
 * Block-level tap feedback. Wrap links or buttons (e.g. className="inline-block w-full sm:w-auto").
 */
export function Pressable({ children, className }: Props) {
  const reduced = useReducedMotion() ?? false;
  return (
    <motion.div
      className={className}
      whileHover={reduced ? undefined : { scale: 1.01 }}
      whileTap={reduced ? undefined : { scale: 0.97 }}
      transition={springTap}
    >
      {children}
    </motion.div>
  );
}
