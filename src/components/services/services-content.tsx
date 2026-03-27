"use client";

import { StaggerContainer, StaggerItem } from "@/components/motion/stagger";

const items = [
  "家庭式寄养环境，每日活动与休息节奏平衡。",
  "支持多宠家庭同单预约，减少拆单沟通成本。",
  "可上传疫苗证明与健康信息，提升交接效率。",
  "可选订金锁定档期，剩余费用入住前结清。",
];

export function ServicesContent() {
  return (
    <div className="card-elevated rounded-3xl p-8">
      <StaggerContainer className="space-y-4">
        <StaggerItem>
          <h1 className="text-3xl font-semibold text-[var(--sg-green)]">寄养服务说明</h1>
        </StaggerItem>
        <ul className="mt-2 space-y-3 text-sm leading-7 text-zinc-700">
          {items.map((text) => (
            <StaggerItem key={text}>
              <li className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600/80" aria-hidden />
                <span>{text}</span>
              </li>
            </StaggerItem>
          ))}
        </ul>
      </StaggerContainer>
    </div>
  );
}
