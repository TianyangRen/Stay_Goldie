"use client";

import Image from "next/image";
import { Breath } from "@/components/motion/breath";
import { Reveal } from "@/components/motion/reveal";
import { StaggerContainer, StaggerItem } from "@/components/motion/stagger";

type Props = {
  meta: string;
  title: string;
  content: string;
  coverImage: string | null;
};

export function BlogArticle({ meta, title, content, coverImage }: Props) {
  return (
    <article className="section-surface-alt py-14">
      <div className="section-wrap">
        <div className="mx-auto max-w-3xl card-elevated rounded-3xl p-8">
          {coverImage ? (
            <Reveal className="mb-6">
              <Breath>
                <div className="relative aspect-[21/9] overflow-hidden rounded-2xl border border-[var(--sg-border-subtle)]">
                  <Image src={coverImage} alt={title} fill className="object-cover" />
                </div>
              </Breath>
            </Reveal>
          ) : null}
          <StaggerContainer className="space-y-3">
            <StaggerItem>
              <p className="text-xs text-zinc-500">{meta}</p>
            </StaggerItem>
            <StaggerItem>
              <h1 className="text-3xl font-semibold">{title}</h1>
            </StaggerItem>
            <StaggerItem>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-8 text-zinc-700">{content}</p>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </div>
    </article>
  );
}
