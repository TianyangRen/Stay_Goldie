"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { springSnappy } from "@/lib/motion";

export type PetFeedCardData = {
  id: string;
  petName: string;
  caption: string;
  mediaUrl: string | null;
  altText: string | null;
};

export function PetFeedGrid({ posts }: { posts: PetFeedCardData[] }) {
  const rd = useReducedMotion() ?? false;
  return (
    <div className="mt-8 grid gap-6 md:grid-cols-2">
      {posts.map((post, index) => (
        <motion.article
          key={post.id}
          initial={rd ? false : { opacity: 0, y: 20 }}
          whileInView={rd ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.12 }}
          transition={{ ...springSnappy, delay: rd ? 0 : index * 0.08 }}
          whileHover={rd ? undefined : { y: -3 }}
          whileTap={rd ? undefined : { scale: 0.98 }}
          className="card-elevated overflow-hidden rounded-3xl"
        >
          <div className="relative h-72">
            {post.mediaUrl ? (
              <Image
                src={post.mediaUrl}
                alt={post.altText ?? post.petName}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-[var(--sg-surface-alt)] text-sm text-zinc-500">
                No media
              </div>
            )}
          </div>
          <div className="p-5">
            <p className="text-sm font-medium text-zinc-800">{post.petName}</p>
            <p className="mt-2 text-sm text-zinc-600">{post.caption}</p>
          </div>
        </motion.article>
      ))}
    </div>
  );
}
