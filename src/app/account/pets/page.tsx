import Image from "next/image";
import { auth } from "@/auth";
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

  return (
    <section className="section-wrap py-14">
      <h1 className="text-3xl font-semibold text-[var(--sg-green)]">我的宠物</h1>
      <p className="mt-2 text-sm text-zinc-600">支持一个账号管理多只狗狗。</p>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {pets.map((pet) => (
          <article key={pet.id} className="rounded-3xl border border-black/10 bg-white p-4">
            <div className="relative h-48 overflow-hidden rounded-2xl">
              {pet.avatarUrl ? (
                <Image src={pet.avatarUrl} alt={pet.name} fill className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center bg-zinc-100 text-xs text-zinc-500">
                  无头像
                </div>
              )}
            </div>
            <h2 className="mt-3 font-semibold">{pet.name}</h2>
            <p className="text-sm text-zinc-600">
              {pet.breed ?? "品种未填"} · {pet.sizeTier ?? "体型未填"}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
