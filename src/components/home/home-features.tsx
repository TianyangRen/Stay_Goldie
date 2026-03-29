"use client";

import { FeatureCard } from "@/components/cards/feature-card";
import { StaggerContainer, StaggerItem } from "@/components/motion/stagger";

function IconCalendar() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5a2.25 2.25 0 002.25-2.25m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5a2.25 2.25 0 012.25 2.25v7.5"
      />
    </svg>
  );
}

function IconShop() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974a1.125 1.125 0 011.119 1.007z"
      />
    </svg>
  );
}

function IconSparkles() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"
      />
    </svg>
  );
}

export function HomeFeatures() {
  return (
    <section className="section-surface-alt py-12 md:py-16" aria-labelledby="home-features-heading">
      <div className="section-wrap">
        <div className="mx-auto mb-10 max-w-2xl text-center md:mb-12">
          <p className="text-sm font-medium uppercase tracking-wide text-[var(--sg-primary)]">What we offer</p>
          <h2 id="home-features-heading" className="mt-2 text-3xl font-semibold text-[var(--sg-green)] md:text-4xl">
            Everything in one friendly flow
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--sg-muted)] md:text-base">
            Clear scheduling, a small shop for essentials, and private updates—styled like a modern pet spa site, built for
            real operations.
          </p>
        </div>
        <StaggerContainer className="grid gap-5 md:grid-cols-3">
          <StaggerItem>
            <FeatureCard title="Smart booking & capacity" icon={<IconCalendar />}>
              Choose dates, combine multiple pets in one quote, and collect a deposit with a straightforward checkout
              path.
            </FeatureCard>
          </StaggerItem>
          <StaggerItem>
            <FeatureCard title="Shop & inventory" icon={<IconShop />}>
              Publish products with sale pricing, stock, and order tracking—checkout in CAD via Stripe.
            </FeatureCard>
          </StaggerItem>
          <StaggerItem>
            <FeatureCard title="Pet update feed" icon={<IconSparkles />}>
              Post photo updates per pet; owners only see their own pets when they sign in.
            </FeatureCard>
          </StaggerItem>
        </StaggerContainer>
      </div>
    </section>
  );
}
