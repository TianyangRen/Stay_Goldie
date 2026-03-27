import { auth } from "@/auth";
import { PetFeedGrid } from "@/components/pet-feed/pet-feed-grid";
import { Reveal } from "@/components/motion/reveal";
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

  const items = posts.map((post) => {
    const image = post.media[0];
    return {
      id: post.id,
      petName: post.pet.name,
      caption: post.caption,
      mediaUrl: image?.mediaUrl ?? null,
      altText: image?.altText ?? null,
    };
  });

  return (
    <section className="section-surface py-14">
      <div className="section-wrap">
        <Reveal>
          <h1 className="text-3xl font-semibold text-[var(--sg-green)]">宠物 Ins</h1>
        </Reveal>
        <Reveal delay={0.05}>
          <p className="mt-2 text-sm text-zinc-600">仅展示当前登录账号关联宠物的动态。</p>
        </Reveal>
        <PetFeedGrid posts={items} />
        {posts.length === 0 ? (
          <p className="mt-6 text-sm text-zinc-600">暂无动态。</p>
        ) : null}
      </div>
    </section>
  );
}
