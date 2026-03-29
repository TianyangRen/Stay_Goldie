"use client";

import Image from "next/image";
import { Breath } from "@/components/motion/breath";
import { Reveal } from "@/components/motion/reveal";
import { StaggerContainer, StaggerItem } from "@/components/motion/stagger";
import { CheckoutButton } from "@/components/shop/checkout-button";

type Props = {
  name: string;
  description: string;
  priceLabel: string;
  stock: number;
  imageUrl: string | null;
  productId: string;
};

export function ProductDetailView({
  name,
  description,
  priceLabel,
  stock,
  imageUrl,
  productId,
}: Props) {
  return (
    <section className="section-surface py-14">
      <div className="section-wrap">
        <div className="grid gap-6 card-elevated rounded-3xl p-6 md:grid-cols-2">
          <Reveal y={12} amount={0.2}>
            <Breath>
              <div className="relative h-72 overflow-hidden rounded-2xl border border-[var(--sg-border-subtle)]">
                {imageUrl ? (
                  <Image src={imageUrl} alt={name} fill className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center bg-[var(--sg-surface-alt)] text-sm text-zinc-500">
                    No image
                  </div>
                )}
              </div>
            </Breath>
          </Reveal>
          <StaggerContainer className="space-y-4">
            <StaggerItem>
              <h1 className="text-2xl font-semibold">{name}</h1>
            </StaggerItem>
            <StaggerItem>
              <p className="text-sm leading-7 text-zinc-600">{description}</p>
            </StaggerItem>
            <StaggerItem>
              <p className="text-sm font-medium">
                {priceLabel} · Stock {stock}
              </p>
            </StaggerItem>
            <StaggerItem>
              <CheckoutButton productId={productId} />
            </StaggerItem>
          </StaggerContainer>
        </div>
      </div>
    </section>
  );
}
