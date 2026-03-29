"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { springSnappy } from "@/lib/motion";

export type BlogPostItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImage: string | null;
  categoryName: string | null;
  publishedLabel: string | null;
};

export function BlogPostList({ posts }: { posts: BlogPostItem[] }) {
  const rd = useReducedMotion() ?? false;
  return (
    <div className="mt-8 space-y-5">
      {posts.map((post, index) => (
        <motion.article
          key={post.id}
          initial={rd ? false : { opacity: 0, y: 18 }}
          whileInView={rd ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ ...springSnappy, delay: rd ? 0 : index * 0.06 }}
          whileHover={rd ? undefined : { y: -2 }}
          whileTap={rd ? undefined : { scale: 0.985 }}
          className="card-elevated grid gap-4 rounded-3xl p-4 md:grid-cols-4"
        >
          <div className="relative h-40 overflow-hidden rounded-2xl md:col-span-1">
            {post.coverImage ? (
              <Image src={post.coverImage} alt={post.title} fill className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center bg-[var(--sg-surface-alt)] text-xs text-zinc-500">
                No cover
              </div>
            )}
          </div>
          <div className="md:col-span-3">
            <p className="text-xs text-zinc-500">
              {post.categoryName ?? "Uncategorized"} · {post.publishedLabel ?? ""}
            </p>
            <h2 className="mt-1 text-xl font-semibold">{post.title}</h2>
            <p className="mt-2 text-sm text-zinc-600">{post.excerpt}</p>
            <Link
              href={`/blog/${post.slug}`}
              className="mt-3 inline-block text-sm font-medium text-[var(--sg-green)]"
            >
              Read article
            </Link>
          </div>
        </motion.article>
      ))}
    </div>
  );
}
