"use client";

import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/reveal";
import { StaggerContainer, StaggerItem } from "@/components/motion/stagger";

type Props = {
  formSlot: ReactNode;
  aside: ReactNode;
};

export function BookingPageShell({ formSlot, aside }: Props) {
  return (
    <section className="section-surface py-14">
      <div className="section-wrap">
        <div className="grid gap-6 lg:grid-cols-3">
          <Reveal className="lg:col-span-2" y={16}>
            <article className="card-elevated rounded-3xl p-7">
              <h1 className="text-3xl font-semibold text-[var(--sg-green)]">寄养预约</h1>
              <p className="mt-3 text-sm leading-7 text-zinc-600">
                选择日期与宠物，系统将创建预约并跳转 Stripe 支付订金（CAD）。支付成功后预约状态将更新为已确认。
              </p>
              <div className="mt-8">{formSlot}</div>
            </article>
          </Reveal>
          <Reveal y={20} delay={0.08}>
            <aside className="card-elevated rounded-3xl p-6">{aside}</aside>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function BookingRecentList({
  items,
}: {
  items: { id: string; line: string }[];
}) {
  return (
    <>
      <h2 className="text-lg font-semibold text-zinc-900">近期预约</h2>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-500">暂无记录。登录并预约后将显示在此。</p>
      ) : (
        <StaggerContainer className="mt-4 space-y-3">
          {items.map((row) => (
            <StaggerItem key={row.id}>
              <div className="rounded-xl bg-[var(--sg-surface-alt)] p-3 text-sm text-zinc-600">
                {row.line}
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}
    </>
  );
}
