"use client";

import { FeatureCard } from "@/components/cards/feature-card";
import { StaggerContainer, StaggerItem } from "@/components/motion/stagger";

export function HomeFeatures() {
  return (
    <section className="section-surface-alt py-10 md:py-14">
      <div className="section-wrap">
        <StaggerContainer className="grid gap-5 md:grid-cols-3">
          <StaggerItem>
            <FeatureCard title="智能预约与档期">
              支持起止日期、容量控制、多宠合并计价与订金支付，流程清晰。
            </FeatureCard>
          </StaggerItem>
          <StaggerItem>
            <FeatureCard title="商城与库存">
              上架商品、动态定价、库存管理与订单状态追踪，支持 CAD 支付。
            </FeatureCard>
          </StaggerItem>
          <StaggerItem>
            <FeatureCard title="专属宠物动态">
              以宠物名义发布图文动态，主人登录后仅可查看自己的宠物内容。
            </FeatureCard>
          </StaggerItem>
        </StaggerContainer>
      </div>
    </section>
  );
}
