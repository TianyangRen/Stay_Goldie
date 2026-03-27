import Link from "next/link";
import { PetForm } from "@/components/account/pet-form";
import { Reveal } from "@/components/motion/reveal";

export default function NewPetPage() {
  return (
    <section className="section-surface py-14">
      <div className="section-wrap">
        <div className="mx-auto max-w-lg">
          <Reveal>
            <p className="text-sm text-zinc-600">
              <Link href="/account/pets" className="text-emerald-900 underline underline-offset-4">
                ← 我的宠物
              </Link>
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="mt-4 text-3xl font-semibold text-[var(--sg-green)]">添加宠物</h1>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mt-2 text-sm text-zinc-600">填写基本信息，预约寄养时会用体型参与估价。</p>
          </Reveal>
          <div className="mt-8">
            <PetForm mode="create" />
          </div>
        </div>
      </div>
    </section>
  );
}
