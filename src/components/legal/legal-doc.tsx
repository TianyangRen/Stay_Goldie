"use client";

import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { StaggerContainer, StaggerItem } from "@/components/motion/stagger";

type Props = {
  badge: string;
  title: string;
  /** Plain text; use multiple paragraphs via `\n\n` if needed. */
  intro: string;
  bullets: string[];
  homeHref?: string;
};

export function LegalDoc({ badge, title, intro, bullets, homeHref = "/" }: Props) {
  const introParts = intro.split("\n\n").filter(Boolean);
  return (
    <section className="section-surface py-14">
      <div className="section-wrap">
        <Reveal>
          <div className="mx-auto max-w-2xl card-elevated rounded-3xl p-8">
            <StaggerContainer className="space-y-6">
              <StaggerItem>
                <p className="text-xs font-medium uppercase tracking-wide text-amber-800">{badge}</p>
              </StaggerItem>
              <StaggerItem>
                <h1 className="text-3xl font-semibold text-zinc-900">{title}</h1>
              </StaggerItem>
              {introParts.map((part, i) => (
                <StaggerItem key={i}>
                  <p className="text-sm leading-7 text-zinc-600">{part}</p>
                </StaggerItem>
              ))}
              <StaggerItem>
                <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-zinc-600">
                  {bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </StaggerItem>
              <StaggerItem>
                <p className="text-sm">
                  <Link href={homeHref} className="text-emerald-900 underline underline-offset-4">
                    返回首页
                  </Link>
                </p>
              </StaggerItem>
            </StaggerContainer>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
