/** Shared Framer Motion transitions / stagger variants (client components only). */
import type { Transition, Variants } from "framer-motion";

/** Primary spring — smooth, slight inertia */
export const springSnappy: Transition = {
  type: "spring",
  stiffness: 380,
  damping: 28,
};

export const springTap: Transition = {
  type: "spring",
  stiffness: 520,
  damping: 35,
};

export const reducedTransition: Transition = { duration: 0.01 };

export function staggerContainer(stagger: number): Variants {
  return {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: stagger, delayChildren: 0.06 },
    },
  };
}

export function staggerItem(): Variants {
  return {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: springSnappy,
    },
  };
}
