import Link from "next/link";
import { auth } from "@/auth";
import { AccountPetsGrid } from "@/components/account/account-pets-grid";
import { Pressable } from "@/components/motion/pressable";
import { Reveal } from "@/components/motion/reveal";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AccountPetsPage() {
  const session = await auth();
  const ownerId = session?.user?.id;
  if (!ownerId) {
    return null;
  }

  const pets = await prisma.pet.findMany({
    where: { ownerId },
    orderBy: { createdAt: "asc" },
  });

  const cards = pets.map((pet) => ({
    id: pet.id,
    name: pet.name,
    breedLine: `${pet.breed ?? "品种未填"} · ${pet.sizeTier ?? "体型未填"}`,
    avatarUrl: pet.avatarUrl,
  }));

  return (
    <section className="section-surface py-14">
      <div className="section-wrap">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <Reveal>
            <div>
              <h1 className="text-3xl font-semibold text-[var(--sg-green)]">我的宠物</h1>
              <p className="mt-2 text-sm text-zinc-600">一个账号可管理多只狗狗，信息用于预约估价与健康档案。</p>
            </div>
          </Reveal>
          <Reveal delay={0.06}>
            <Pressable className="inline-block shrink-0">
              <Link
                href="/account/pets/new"
                className="inline-flex items-center justify-center rounded-full bg-[var(--sg-green)] px-5 py-2.5 text-sm font-medium text-white"
              >
                添加宠物
              </Link>
            </Pressable>
          </Reveal>
        </div>
        <AccountPetsGrid pets={cards} />
        {pets.length === 0 ? (
          <Reveal>
            <div className="mt-10 rounded-3xl border border-dashed border-[var(--sg-border-subtle)] bg-[var(--sg-surface)] p-10 text-center">
              <p className="text-sm text-zinc-600">还没有宠物档案。</p>
              <Pressable className="mt-4 inline-block">
                <Link
                  href="/account/pets/new"
                  className="inline-block rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white"
                >
                  添加第一只宠物
                </Link>
              </Pressable>
            </div>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
