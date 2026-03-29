import { prisma } from "@/lib/prisma";
import { AdminPersonasPanel } from "@/components/admin/admin-personas-panel";
import { UpdateComposer } from "@/components/blog/update-composer";
import { Reveal } from "@/components/motion/reveal";
import { StaggerSurfaceItem } from "@/components/motion/stagger-surface-item";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/login?next=/admin/blog");
  }

  const [posts, categories, personas] = await Promise.all([
    prisma.blogPost.findMany({
      orderBy: { createdAt: "desc" },
      take: 40,
      include: {
        persona: true,
        author: { select: { email: true, name: true } },
        _count: { select: { likes: true, comments: true } },
      },
    }),
    prisma.blogCategory.findMany({ orderBy: { name: "asc" } }),
    prisma.postingPersona.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  return (
    <section className="section-wrap py-14">
      <Reveal>
        <h1 className="text-3xl font-semibold text-[var(--sg-green)]">Admin · Updates feed</h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-600">
          Publish short updates for the public feed. Use personas to post in a pup’s voice — owners post from{" "}
          <span className="font-medium">Account → My updates</span>.
        </p>
      </Reveal>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <Reveal delay={0.04}>
          <AdminPersonasPanel
            initial={personas.map((p) => ({ id: p.id, name: p.name, avatarUrl: p.avatarUrl }))}
          />
        </Reveal>
        <Reveal delay={0.06}>
          <div className="card-elevated rounded-3xl p-6">
            <h2 className="text-lg font-semibold text-[var(--sg-green)]">New update</h2>
            <div className="mt-4">
              <UpdateComposer
                categories={categories.map((c) => ({ id: c.id, name: c.name }))}
                personas={personas.map((p) => ({ id: p.id, name: p.name }))}
                redirectAfter="/admin/blog"
              />
            </div>
          </div>
        </Reveal>
      </div>

      <div className="mt-10">
        <Reveal>
          <h2 className="text-lg font-semibold text-zinc-800">Recent posts</h2>
        </Reveal>
        <div className="mt-4 grid gap-3">
          {posts.map((post, index) => (
            <StaggerSurfaceItem
              key={post.id}
              index={index}
              className="flex flex-col gap-1 rounded-xl border border-[var(--sg-border-subtle)] bg-[var(--sg-surface)] px-4 py-3 text-sm"
            >
              <span className="font-medium">{post.title}</span>
              <span className="text-xs text-zinc-500">
                {post.persona ? `As ${post.persona.name}` : post.author.name ?? post.author.email} · ♥{" "}
                {post._count.likes} · {post._count.comments} comments · /blog/{post.slug}
              </span>
            </StaggerSurfaceItem>
          ))}
        </div>
        {posts.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-600">No posts yet.</p>
        ) : null}
      </div>
    </section>
  );
}
