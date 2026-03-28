import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PetForm } from "@/components/account/pet-form";
import { Reveal } from "@/components/motion/reveal";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function EditPetPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  const ownerId = session?.user?.id;
  if (!ownerId) {
    return null;
  }

  const pet = await prisma.pet.findFirst({
    where: { id, ownerId },
  });
  if (!pet) {
    notFound();
  }

  const initial = {
    name: pet.name,
    breed: pet.breed ?? "",
    sizeTier: pet.sizeTier,
    birthDate: pet.birthDate?.toISOString() ?? null,
    avatarUrl: pet.avatarUrl ?? null,
  };

  return (
    <section className="section-surface py-14">
      <div className="section-wrap">
        <div className="mx-auto max-w-lg">
          <Reveal>
            <p className="text-sm text-zinc-600">
              <Link href="/account/pets" className="text-[var(--sg-green)] underline underline-offset-4">
                ← 我的宠物
              </Link>
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="mt-4 text-3xl font-semibold text-[var(--sg-green)]">编辑 · {pet.name}</h1>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mt-2 text-sm text-zinc-600">修改档案后，预约页会立即使用最新信息。</p>
          </Reveal>
          <div className="mt-8">
            <PetForm mode="edit" petId={pet.id} initial={initial} />
          </div>
        </div>
      </div>
    </section>
  );
}
