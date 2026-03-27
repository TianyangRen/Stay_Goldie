"use client";

import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/reveal";
import { StaggerContainer, StaggerItem } from "@/components/motion/stagger";

export function AuthFormShell({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <section className="section-surface py-16">
      <div className="section-wrap">
        <Reveal>
          <div className="mx-auto max-w-xl card-elevated rounded-3xl p-8">
            <StaggerContainer className="space-y-4">
              <StaggerItem>
                <h1 className="text-2xl font-semibold text-zinc-900">{title}</h1>
              </StaggerItem>
              <StaggerItem>
                <p className="text-sm text-zinc-600">{description}</p>
              </StaggerItem>
              <StaggerItem>{children}</StaggerItem>
              {footer ? <StaggerItem>{footer}</StaggerItem> : null}
            </StaggerContainer>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
