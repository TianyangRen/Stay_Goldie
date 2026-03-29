"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { StaggerContainer, StaggerItem } from "@/components/motion/stagger";
import { Breath } from "@/components/motion/breath";
import { Pressable } from "@/components/motion/pressable";
import { springSnappy } from "@/lib/motion";

function IconCheck() {
  return (
    <svg className="h-3.5 w-3.5 shrink-0 text-[var(--sg-cta)]" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function HeroHeadline() {
  const reduced = useReducedMotion() ?? false;

  if (reduced) {
    return (
      <h1 className="max-w-xl text-4xl font-semibold leading-[1.1] text-[var(--sg-green)] md:max-w-2xl md:text-[2.75rem] md:leading-[1.08] lg:text-6xl">
        <span className="block">Grooming-soft care meets</span>
        <span className="mt-1 block text-[var(--sg-cta)]">cosy home boarding</span>
      </h1>
    );
  }

  return (
    <motion.h1
      className="max-w-xl text-4xl font-semibold leading-[1.1] text-[var(--sg-green)] md:max-w-2xl md:text-[2.75rem] md:leading-[1.08] lg:text-6xl"
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: {
          transition: { staggerChildren: 0.11, delayChildren: 0.12 },
        },
      }}
    >
      <motion.span
        className="block"
        variants={{
          hidden: { opacity: 0, y: 28, rotate: -0.5 },
          show: { opacity: 1, y: 0, rotate: 0, transition: springSnappy },
        }}
      >
        Grooming-soft care meets
      </motion.span>
      <motion.span
        className="mt-1 block text-[var(--sg-cta)]"
        variants={{
          hidden: { opacity: 0, y: 28, rotate: 0.5 },
          show: { opacity: 1, y: 0, rotate: 0, transition: springSnappy },
        }}
      >
        cosy home boarding
      </motion.span>
    </motion.h1>
  );
}

const trustItems = [
  { label: "Photo-ready updates" },
  { label: "Deposit secures dates" },
  { label: "Snacks on request" },
];

export function HomeHero() {
  const reduced = useReducedMotion() ?? false;

  return (
    <section className="pet-spa-hero relative border-b border-[var(--sg-border-subtle)]/80 pb-0">
      <div className="section-wrap relative z-10 flex flex-col gap-10 py-14 md:gap-12 md:py-20 lg:flex-row lg:items-center lg:gap-6 lg:py-24">
        {/* Copy: slightly wider + pulled forward on large screens */}
        <div className="relative z-20 min-w-0 flex-1 lg:max-w-[min(100%,32rem)] lg:pr-4 xl:max-w-[36rem]">
          <StaggerContainer className="space-y-5">
            <StaggerItem>
              <p className="inline-flex items-center gap-2 rounded-full border-[3px] border-white/80 bg-white/95 px-4 py-2 text-xs font-medium text-[var(--sg-text)] shadow-[var(--sg-clay-shadow-out)] transition-clay">
                <span
                  className="inline-block h-2 w-2 shrink-0 rounded-full bg-emerald-400 motion-safe:animate-pulse"
                  aria-hidden
                />
                Canada · boutique care for happy dogs
              </p>
            </StaggerItem>
            <StaggerItem>
              <HeroHeadline />
            </StaggerItem>
            <StaggerItem>
              <p className="max-w-lg text-base leading-8 text-[var(--sg-muted)] md:text-lg">
                One calm place for stays, supplies, and owner-only updates—so families trust the experience from the
                first click.
              </p>
            </StaggerItem>
            <StaggerItem>
              <ul className="flex flex-wrap gap-2" aria-label="Highlights">
                {trustItems.map((item) => (
                  <li
                    key={item.label}
                    className="inline-flex items-center gap-1.5 rounded-full border-2 border-dashed border-[var(--sg-primary)]/35 bg-white/90 px-3 py-1.5 text-xs font-medium text-[var(--sg-text)] shadow-sm"
                  >
                    <IconCheck />
                    {item.label}
                  </li>
                ))}
              </ul>
            </StaggerItem>
            <StaggerItem>
              <div className="flex flex-wrap items-center gap-3">
                <Pressable className="inline-block">
                  <Link
                    href="/booking"
                    className="focus-ring-clay inline-flex cursor-pointer rounded-full bg-[var(--sg-cta)] px-6 py-3 text-sm font-semibold text-white shadow-md transition-clay hover:shadow-lg hover:brightness-105"
                  >
                    Book a stay
                  </Link>
                </Pressable>
                <Pressable className="inline-block">
                  <Link
                    href="/pet-feed"
                    className="focus-ring-clay inline-flex cursor-pointer rounded-full border-[3px] border-white/85 bg-white/95 px-6 py-3 text-sm font-medium text-[var(--sg-text)] shadow-sm transition-clay hover:bg-white hover:shadow-md"
                  >
                    See pet updates
                  </Link>
                </Pressable>
                <Link
                  href="/services"
                  className="link-playful text-sm font-semibold text-[var(--sg-cta)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sg-cta)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--sg-bg)]"
                >
                  View services
                </Link>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </div>

        {/* Visual cluster: overlaps into copy on large screens */}
        <div className="relative z-10 mx-auto w-full max-w-md shrink-0 lg:mx-0 lg:mt-0 lg:max-w-none lg:flex-1 lg:self-center lg:-translate-y-2 xl:-ml-6">
          {/* min-h + flex self-stretch: avoids flex row height collapse; inner aspect gives Image(fill) a real box */}
          <div className="relative mx-auto flex w-full min-h-[320px] max-w-[500px] flex-col items-end lg:ml-auto lg:min-h-[380px] lg:max-w-[min(100%,520px)]">
            {/* Main image — wider than before; same % widths vs container + same rotations → overlap ratio unchanged */}
            <div className="group/main ml-auto block w-[92%] max-w-[468px] cursor-pointer sm:w-[90%] lg:w-[88%]">
              <Breath className="block w-full">
                <div
                  className="hero-photo-frame organic-mask relative aspect-[4/5] w-full -rotate-[2.5deg] overflow-hidden transition-transform duration-500 ease-out group-hover/main:rotate-0"
                >
                  <Image
                    src="https://images.unsplash.com/photo-1534361960057-19889db9621e?q=80&w=1100&auto=format&fit=crop"
                    alt="Happy dog in a bright, cosy home"
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 1024px) 90vw, 520px"
                  />
                  <div className="absolute right-3 top-3 z-10 rounded-2xl border-2 border-white/90 bg-white/95 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wide text-[var(--sg-cta)]">
                    Today!
                  </div>
                </div>
              </Breath>
            </div>

            {/* Secondary card — same clay + shadow language; default tilt 6deg unchanged; hover straightens like main */}
            <div className="group/secondary absolute bottom-[6%] left-0 z-20 w-[44%] cursor-pointer">
              <div className="origin-bottom rotate-[6deg] transition-transform duration-500 ease-out group-hover/secondary:rotate-0">
                <motion.div
                  animate={
                    reduced
                      ? undefined
                      : {
                          y: [0, -6, 0],
                        }
                  }
                  transition={
                    reduced
                      ? undefined
                      : {
                          duration: 4.2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }
                  }
                >
                  <div className="hero-photo-frame flex w-full flex-col overflow-hidden">
                    <div className="relative aspect-square w-full">
                      <Image
                        src="https://images.unsplash.com/photo-1517849845537-4d257902454a?q=80&w=600&auto=format&fit=crop"
                        alt="Second dog peeking into frame"
                        fill
                        className="object-cover"
                        sizes="200px"
                      />
                    </div>
                    <p className="border-t border-[var(--sg-border-subtle)] bg-white/95 px-2 py-1.5 text-center font-heading text-[10px] font-semibold text-[var(--sg-muted)]">
                      From the feed
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Wave into next section */}
      <div className="relative z-[1] -mb-px mt-4 md:mt-6" aria-hidden>
        <svg
          className="h-10 w-full text-[var(--sg-surface-alt)] md:h-14"
          viewBox="0 0 1440 56"
          preserveAspectRatio="none"
        >
          <path
            fill="currentColor"
            d="M0,32 C180,8 360,48 540,28 C720,8 900,40 1080,32 C1260,24 1380,16 1440,20 L1440,56 L0,56 Z"
          />
        </svg>
      </div>
    </section>
  );
}
