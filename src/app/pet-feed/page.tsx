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
          <h1 className="text-3xl font-semibold text-[var(--sg-green)]">Pet feed</h1>
        </Reveal>
        <Reveal delay={0.05}>
          <p className="mt-2 text-sm text-zinc-600">Photo updates for pets linked to your signed-in account only.</p>
        </Reveal>
        <PetFeedGrid posts={items} />
        {posts.length === 0 ? (
          <p className="mt-6 text-sm text-zinc-600">No updates yet.</p>
        ) : null}
      </div>
    </section>
  );
}
