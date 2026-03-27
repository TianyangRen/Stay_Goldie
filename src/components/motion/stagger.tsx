"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { PropsWithChildren } from "react";
import { staggerContainer, staggerItem } from "@/lib/motion";

type RootProps = PropsWithChildren<{
  className?: string;
  stagger?: number;
}>;

export function StaggerContainer({ children, className, stagger = 0.09 }: RootProps) {
  const reduced = useReducedMotion() ?? false;
  if (reduced) {
    return <div className={className}>{children}</div>;
  }
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.12 }}
      variants={staggerContainer(stagger)}
    >
      {children}
    </motion.div>
  );
}

type ItemProps = PropsWithChildren<{ className?: string }>;

export function StaggerItem({ children, className }: ItemProps) {
  const reduced = useReducedMotion() ?? false;
  if (reduced) {
    return <div className={className}>{children}</div>;
  }
  return (
    <motion.div className={className} variants={staggerItem()}>
      {children}
    </motion.div>
  );
}
