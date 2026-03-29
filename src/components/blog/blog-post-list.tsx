"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { FeedPostEngagement } from "@/components/blog/feed-post-engagement";
import { springSnappy } from "@/lib/motion";

export type BlogPostItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImage: string | null;
  categoryName: string | null;
  publishedLabel: string | null;
  authorName: string | null;
  authorImage: string | null;
  likeCount: number;
  commentCount: number;
  liked: boolean;
  previewComments: { id: string; content: string; createdAt: string; authorLabel: string }[];
};

function AuthorAvatar({ name, image }: { name: string; image: string | null }) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  if (image) {
    return (
      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-[var(--sg-border-subtle)] bg-[var(--sg-surface-alt)]">
        <Image src={image} alt="" fill className="object-cover" sizes="40px" />
      </div>
    );
  }
  return (
    <div
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--sg-border-subtle)] bg-[var(--sg-surface-alt)] text-sm font-semibold text-[var(--sg-green)]"
      aria-hidden
    >
      {initial}
    </div>
  );
}

/** Vertical feed of image-first posts — closer to IG/X than article rows. */
export function BlogPostList({ posts }: { posts: BlogPostItem[] }) {
  const rd = useReducedMotion() ?? false;

  return (
    <div className="mx-auto mt-10 flex w-full max-w-md flex-col gap-8">
      {posts.map((post, index) => {
        const author = post.authorName ?? "Stay Goldie";
        return (
          <motion.article
            key={post.id}
            initial={rd ? false : { opacity: 0, y: 20 }}
            whileInView={rd ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.12 }}
            transition={{ ...springSnappy, delay: rd ? 0 : index * 0.05 }}
            className="overflow-hidden rounded-3xl border border-[var(--sg-border-subtle)] bg-[var(--sg-surface-elevated)] shadow-[var(--sg-shadow-soft)]"
          >
            <div className="flex items-center gap-3 border-b border-[var(--sg-border-subtle)] px-3 py-2.5">
              <AuthorAvatar name={author} image={post.authorImage} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[var(--sg-text)]">{author}</p>
                <p className="text-xs text-zinc-500">
                  {post.publishedLabel ?? ""}
                  {post.categoryName ? (
                    <>
                      {" "}
                      · <span className="text-zinc-400">{post.categoryName}</span>
                    </>
                  ) : null}
                </p>
              </div>
            </div>

            <Link href={`/blog/${post.slug}`} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sg-cta)] focus-visible:ring-offset-2">
              <div className="relative aspect-[4/5] w-full bg-[var(--sg-surface-alt)]">
                {post.coverImage ? (
                  <Image src={post.coverImage} alt="" fill className="object-cover" sizes="(max-width: 768px) 100vw, 28rem" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-zinc-400">No photo</div>
                )}
              </div>
              <div className="px-3 py-3 text-left">
                <p className="text-sm font-semibold leading-snug text-[var(--sg-text)]">{post.title}</p>
                {post.excerpt ? (
                  <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-zinc-600">{post.excerpt}</p>
                ) : null}
                <span className="mt-2 inline-block text-xs font-medium text-[var(--sg-cta)]">Open post</span>
              </div>
            </Link>

            <FeedPostEngagement
              compact
              postId={post.id}
              slug={post.slug}
              initialLiked={post.liked}
              initialLikeCount={post.likeCount}
              initialCommentCount={post.commentCount}
              comments={post.previewComments}
            />
          </motion.article>
        );
      })}
    </div>
  );
}
