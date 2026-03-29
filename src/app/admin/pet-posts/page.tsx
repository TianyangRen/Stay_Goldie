import { prisma } from "@/lib/prisma";
import { PetPostForm } from "@/components/admin/pet-post-form";
import { Reveal } from "@/components/motion/reveal";
import { StaggerSurfaceItem } from "@/components/motion/stagger-surface-item";

export const dynamic = "force-dynamic";

export default async function AdminPetPostsPage() {
  const [pets, posts] = await Promise.all([
    prisma.pet.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.petPost.findMany({
      include: { pet: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  return (
    <section className="section-wrap py-14">
      <Reveal>
        <h1 className="text-3xl font-semibold text-[var(--sg-green)]">Admin · Pet feed composer</h1>
      </Reveal>
      <Reveal delay={0.05}>
        <div className="mt-6 card-elevated rounded-3xl p-6">
          <p className="text-sm text-zinc-600">
            Uploads request a presigned URL (configure S3/R2). You can also paste public image URLs. Published posts show
            on the owner-facing pet feed.
          </p>
          {pets.length === 0 ? (
            <p className="mt-4 text-sm text-amber-800">No pets in the database yet—create pet profiles first.</p>
          ) : (
            <PetPostForm pets={pets} />
          )}
        </div>
      </Reveal>
      <div className="mt-6 space-y-3">
        {posts.map((post, index) => (
          <StaggerSurfaceItem
            key={post.id}
            index={index}
            className="card-elevated rounded-2xl p-4 text-sm text-zinc-600"
          >
            <span className="font-medium text-zinc-800">{post.pet.name}</span> · {post.caption}
          </StaggerSurfaceItem>
        ))}
      </div>
    </section>
  );
}
