"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { springSnappy } from "@/lib/motion";

export type ShopProductCardProps = {
  slug: string;
  name: string;
  description: string;
  priceLabel: string;
  stock: number;
  imageUrl: string | null;
  index: number;
};

export function ShopProductCard({
  slug,
  name,
  description,
  priceLabel,
  stock,
  imageUrl,
  index,
}: ShopProductCardProps) {
  const rd = useReducedMotion() ?? false;
  return (
    <motion.article
      initial={rd ? false : { opacity: 0, y: 22 }}
      whileInView={rd ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{
        ...springSnappy,
        delay: rd ? 0 : index * 0.07,
      }}
      whileHover={rd ? undefined : { y: -3 }}
      whileTap={rd ? undefined : { scale: 0.97 }}
      className="card-elevated overflow-hidden rounded-3xl"
    >
      <div className="relative h-52">
        {imageUrl ? (
          <Image src={imageUrl} alt={name} fill className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center bg-[var(--sg-surface-alt)] text-sm text-zinc-500">
            暂无图片
          </div>
        )}
      </div>
      <div className="p-5">
        <h2 className="font-semibold">{name}</h2>
        <p className="mt-2 line-clamp-3 text-sm text-zinc-600">{description}</p>
        <p className="mt-3 text-sm">
          {priceLabel} · 库存 {stock}
        </p>
        <Link
          href={`/shop/${slug}`}
          className="mt-4 inline-block rounded-full bg-[var(--sg-cta)] px-4 py-2 text-xs text-white"
        >
          查看商品
        </Link>
      </div>
    </motion.article>
  );
}
