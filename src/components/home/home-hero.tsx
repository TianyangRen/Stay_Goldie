"use client";

import Image from "next/image";
import Link from "next/link";
import { StaggerContainer, StaggerItem } from "@/components/motion/stagger";
import { Breath } from "@/components/motion/breath";
import { Pressable } from "@/components/motion/pressable";

const trustItems = [
  { label: "Photo-ready updates" },
  { label: "Deposit secures dates" },
  { label: "CAD pricing" },
];

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

export function HomeHero() {
  return (
    <section className="pet-spa-hero border-b border-[var(--sg-border-subtle)]/80">
      <div className="section-wrap grid items-center gap-8 py-16 md:grid-cols-5 md:gap-10 md:py-24">
        <div className="md:col-span-3">
          <StaggerContainer className="space-y-5">
            <StaggerItem>
              <p className="inline-block rounded-full border-[3px] border-white/80 bg-white/95 px-4 py-2 text-xs font-medium text-[var(--sg-text)] shadow-[var(--sg-clay-shadow-out)] transition-clay">
                Canada · boutique care for happy dogs
              </p>
            </StaggerItem>
            <StaggerItem>
              <h1 className="max-w-2xl text-4xl font-semibold leading-tight text-[var(--sg-green)] md:text-6xl">
                Grooming-soft care meets cosy home boarding
              </h1>
            </StaggerItem>
            <StaggerItem>
              <p className="max-w-xl text-base leading-8 text-[var(--sg-muted)] md:text-lg">
                One calm place for stays, supplies, and owner-only updates—so families trust the experience from the
                first click.
              </p>
            </StaggerItem>
            <StaggerItem>
              <ul className="flex flex-wrap gap-2" aria-label="Highlights">
                {trustItems.map((item) => (
                  <li
                    key={item.label}
                    className="inline-flex items-center gap-1.5 rounded-full border-[2px] border-white/90 bg-white/90 px-3 py-1.5 text-xs font-medium text-[var(--sg-text)] shadow-sm"
                  >
                    <IconCheck />
                    {item.label}
                  </li>
                ))}
              </ul>
            </StaggerItem>
            <StaggerItem>
              <div className="flex flex-wrap gap-3">
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
              </div>
            </StaggerItem>
          </StaggerContainer>
        </div>
        <div className="md:col-span-2">
          <Breath>
            <div className="clay-hero-frame organic-mask relative h-[340px] overflow-hidden md:h-[460px]">
              <Image
                src="https://images.unsplash.com/photo-1534361960057-19889db9621e?q=80&w=1100&auto=format&fit=crop"
                alt="Happy dog in a bright, cosy home"
                fill
                className="object-cover"
                priority
              />
            </div>
          </Breath>
        </div>
      </div>
    </section>
  );
}
