"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { springSnappy } from "@/lib/motion";

type Props = {
  index: number;
  className?: string;
  children: ReactNode;
};

/** One list/card row with staggered entrance; pass rich markup as children from a Server Component. */
export function StaggerSurfaceItem({ index, className, children }: Props) {
  const rd = useReducedMotion() ?? false;
  return (
    <motion.article
      initial={rd ? false : { opacity: 0, y: 16 }}
      whileInView={rd ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.08 }}
      transition={{ ...springSnappy, delay: rd ? 0 : index * 0.06 }}
      whileHover={rd ? undefined : { y: -2 }}
      className={className}
    >
      {children}
    </motion.article>
  );
}
