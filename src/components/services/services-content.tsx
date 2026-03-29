"use client";

import { StaggerContainer, StaggerItem } from "@/components/motion/stagger";

const items = [
  "Home-style spaces with a steady rhythm of play, rest, and calm supervision.",
  "Multi-dog households can book together on one reservation—less back-and-forth.",
  "Upload vaccine records and health notes so handoffs stay smooth.",
  "Optional deposit to hold dates; balance can be settled before check-in.",
];

export function ServicesContent() {
  return (
    <div className="card-elevated rounded-3xl p-8">
      <StaggerContainer className="space-y-4">
        <StaggerItem>
          <h1 className="text-3xl font-semibold text-[var(--sg-green)]">Boarding care, spa-day clarity</h1>
        </StaggerItem>
        <ul className="mt-2 space-y-3 text-sm leading-7 text-zinc-700">
          {items.map((text) => (
            <StaggerItem key={text}>
              <li className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600/80" aria-hidden />
                <span>{text}</span>
              </li>
            </StaggerItem>
          ))}
        </ul>
      </StaggerContainer>
    </div>
  );
}
