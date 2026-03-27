import Image from "next/image";
import Link from "next/link";
import { FeatureCard } from "@/components/cards/feature-card";
import { Reveal } from "@/components/motion/reveal";

export default function Home() {
  return (
    <div className="pb-20">
      <section className="section-wrap grid items-center gap-8 py-16 md:grid-cols-5 md:py-24">
        <div className="md:col-span-3">
          <Reveal>
            <p className="mb-3 inline-block rounded-full bg-white px-4 py-2 text-xs text-zinc-600 shadow-sm">
              Boutique Family Dog Boarding in Canada
            </p>
            <h1 className="max-w-2xl text-4xl font-semibold leading-tight text-[var(--sg-green)] md:text-6xl">
              高端、温暖、家庭式的狗狗寄养体验
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-[var(--sg-muted)] md:text-lg">
              预约管理、用品商城、每日宠物动态一体化。主人随时查看毛孩子状态，你随时运营寄养业务。
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/booking" className="rounded-full bg-[var(--sg-green)] px-6 py-3 text-sm font-medium text-white">
                立即预约
              </Link>
              <Link href="/pet-feed" className="rounded-full border border-black/10 bg-white px-6 py-3 text-sm font-medium text-zinc-800">
                查看宠物Ins
              </Link>
            </div>
          </Reveal>
        </div>
        <div className="md:col-span-2">
          <Reveal>
            <div className="organic-mask relative h-[340px] overflow-hidden border border-black/10 shadow-xl md:h-[460px]">
              <Image
                src="https://images.unsplash.com/photo-1534361960057-19889db9621e?q=80&w=1100&auto=format&fit=crop"
                alt="Happy dog in cozy home"
                fill
                className="object-cover"
                priority
              />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section-wrap grid gap-5 py-8 md:grid-cols-3">
        <FeatureCard title="智能预约与档期">
          支持起止日期、容量控制、多宠合并计价与订金支付，流程清晰。
        </FeatureCard>
        <FeatureCard title="商城与库存">
          上架商品、动态定价、库存管理与订单状态追踪，支持 CAD 支付。
        </FeatureCard>
        <FeatureCard title="专属宠物动态">
          以宠物名义发布图文动态，主人登录后仅可查看自己的宠物内容。
        </FeatureCard>
      </section>
    </div>
  );
}
