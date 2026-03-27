import { prisma } from "@/lib/prisma";
import { Reveal } from "@/components/motion/reveal";
import { StaggerContainer, StaggerItem } from "@/components/motion/stagger";
import { StaggerSurfaceItem } from "@/components/motion/stagger-surface-item";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return (
    <section className="section-wrap py-14">
      <Reveal>
        <h1 className="text-3xl font-semibold text-[var(--sg-green)]">管理端：博客发布</h1>
      </Reveal>
      <Reveal delay={0.05}>
        <div className="mt-6 card-elevated rounded-3xl p-6">
          <StaggerContainer className="grid gap-4">
            <StaggerItem>
              <input
                className="w-full rounded-xl border border-[var(--sg-border-subtle)] bg-[var(--sg-surface)] p-3 text-sm"
                placeholder="文章标题"
                disabled
              />
            </StaggerItem>
            <StaggerItem>
              <input
                className="w-full rounded-xl border border-[var(--sg-border-subtle)] bg-[var(--sg-surface)] p-3 text-sm"
                placeholder="slug"
                disabled
              />
            </StaggerItem>
            <StaggerItem>
              <textarea
                className="w-full rounded-xl border border-[var(--sg-border-subtle)] bg-[var(--sg-surface)] p-3 text-sm"
                rows={7}
                placeholder="正文"
                disabled
              />
            </StaggerItem>
            <StaggerItem>
              <p className="text-xs text-zinc-500">
                生产发布建议使用 MDX/CMS 或 Server Action 写入 BlogPost。
              </p>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </Reveal>
      <div className="mt-6 space-y-2">
        {posts.map((post, index) => (
          <StaggerSurfaceItem
            key={post.id}
            index={index}
            className="rounded-xl border border-[var(--sg-border-subtle)] bg-[var(--sg-surface)] px-4 py-3 text-sm"
          >
            {post.title}
          </StaggerSurfaceItem>
        ))}
      </div>
    </section>
  );
}
