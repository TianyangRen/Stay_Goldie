import Image from "next/image";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PetFeedPage() {
  const session = await auth();
  const ownerId = session?.user?.id;
  if (!ownerId) {
    return null;
  }

  const posts = await prisma.petPost.findMany({
    where: { pet: { ownerId } },
    include: {
      pet: true,
      media: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <section className="section-wrap py-14">
      <h1 className="text-3xl font-semibold text-[var(--sg-green)]">宠物 Ins</h1>
      <p className="mt-2 text-sm text-zinc-600">仅展示当前登录账号关联宠物的动态。</p>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {posts.map((post) => {
          const image = post.media[0];
          return (
            <article
              key={post.id}
              className="overflow-hidden rounded-3xl border border-black/10 bg-white"
            >
              <div className="relative h-72">
                {image ? (
                  <Image
                    src={image.mediaUrl}
                    alt={image.altText ?? post.pet.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-zinc-100 text-sm text-zinc-500">
                    无图
                  </div>
                )}
              </div>
              <div className="p-5">
                <p className="text-sm font-medium text-zinc-800">{post.pet.name}</p>
                <p className="mt-2 text-sm text-zinc-600">{post.caption}</p>
              </div>
            </article>
          );
        })}
      </div>
      {posts.length === 0 ? (
        <p className="mt-6 text-sm text-zinc-600">暂无动态。</p>
      ) : null}
    </section>
  );
}
