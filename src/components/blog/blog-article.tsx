"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Breath } from "@/components/motion/breath";
import { Reveal } from "@/components/motion/reveal";

type Props = {
  metaLine: string;
  title: string;
  content: string;
  coverImage: string | null;
  authorName: string;
  authorImage: string | null;
  children?: ReactNode;
};

function AuthorAvatar({ name, image }: { name: string; image: string | null }) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  if (image) {
    return (
      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border border-[var(--sg-border-subtle)] bg-[var(--sg-surface-alt)]">
        <Image src={image} alt="" fill className="object-cover" sizes="44px" />
      </div>
    );
  }
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--sg-border-subtle)] bg-[var(--sg-surface-alt)] text-base font-semibold text-[var(--sg-green)]">
      {initial}
    </div>
  );
}

/** Single-post view: tall media + caption block, not a long-form article layout. */
export function BlogArticle({ metaLine, title, content, coverImage, authorName, authorImage, children }: Props) {
  return (
    <article className="section-surface-alt py-10 pb-16">
      <div className="section-wrap">
        <Reveal>
          <Link
            href="/blog"
            className="mb-6 inline-flex text-sm font-medium text-[var(--sg-cta)] underline-offset-4 hover:underline"
          >
            ← Updates
          </Link>
        </Reveal>

        <div className="mx-auto max-w-md overflow-hidden rounded-3xl border border-[var(--sg-border-subtle)] bg-[var(--sg-surface-elevated)] shadow-[var(--sg-shadow-soft)]">
          <div className="flex items-center gap-3 border-b border-[var(--sg-border-subtle)] px-3 py-3">
            <AuthorAvatar name={authorName} image={authorImage} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{authorName}</p>
              <p className="text-xs text-zinc-500">{metaLine}</p>
            </div>
          </div>

          {coverImage ? (
            <Reveal>
              <Breath>
                <div className="relative aspect-[4/5] w-full bg-[var(--sg-surface-alt)]">
                  <Image src={coverImage} alt="" fill className="object-cover" sizes="(max-width: 768px) 100vw, 28rem" priority />
                </div>
              </Breath>
            </Reveal>
          ) : null}

          <div className="px-4 py-4">
            <h1 className="text-lg font-semibold leading-snug text-[var(--sg-text)]">{title}</h1>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">{content}</p>
          </div>
          {children}
        </div>
      </div>
    </article>
  );
}
