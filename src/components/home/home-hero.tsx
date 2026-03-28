"use client";

import Image from "next/image";
import Link from "next/link";
import { StaggerContainer, StaggerItem } from "@/components/motion/stagger";
import { Breath } from "@/components/motion/breath";
import { Pressable } from "@/components/motion/pressable";

export function HomeHero() {
  return (
    <section className="section-wrap grid items-center gap-8 py-16 md:grid-cols-5 md:py-24">
      <div className="md:col-span-3">
        <StaggerContainer className="space-y-5">
          <StaggerItem>
            <p className="inline-block rounded-full border border-[var(--sg-primary)]/25 bg-white/90 px-4 py-2 text-xs text-[var(--sg-text)] shadow-sm">
              Boutique Family Dog Boarding in Canada
            </p>
          </StaggerItem>
          <StaggerItem>
            <h1 className="max-w-2xl text-4xl font-semibold leading-tight text-[var(--sg-green)] md:text-6xl">
              高端、温暖、家庭式的狗狗寄养体验
            </h1>
          </StaggerItem>
          <StaggerItem>
            <p className="max-w-xl text-base leading-8 text-[var(--sg-muted)] md:text-lg">
              预约管理、用品商城、每日宠物动态一体化。主人随时查看毛孩子状态，你随时运营寄养业务。
            </p>
          </StaggerItem>
          <StaggerItem>
            <div className="flex flex-wrap gap-3">
              <Pressable className="inline-block">
                <Link
                  href="/booking"
                  className="inline-flex rounded-full bg-[var(--sg-cta)] px-6 py-3 text-sm font-medium text-white shadow-md transition-shadow hover:shadow-lg"
                >
                  立即预约
                </Link>
              </Pressable>
              <Pressable className="inline-block">
                <Link
                  href="/pet-feed"
                  className="inline-flex rounded-full border border-[var(--sg-border-strong)] bg-white px-6 py-3 text-sm font-medium text-zinc-800"
                >
                  查看宠物Ins
                </Link>
              </Pressable>
            </div>
          </StaggerItem>
        </StaggerContainer>
      </div>
      <div className="md:col-span-2">
        <Breath>
          <div className="organic-mask relative h-[340px] overflow-hidden border border-[var(--sg-border-subtle)] shadow-xl md:h-[460px]">
            <Image
              src="https://images.unsplash.com/photo-1534361960057-19889db9621e?q=80&w=1100&auto=format&fit=crop"
              alt="Happy dog in cozy home"
              fill
              className="object-cover"
              priority
            />
          </div>
        </Breath>
      </div>
    </section>
  );
}
