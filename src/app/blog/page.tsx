import { BlogPostList } from "@/components/blog/blog-post-list";
import { Reveal } from "@/components/motion/reveal";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: { publishedAt: { not: null } },
    include: { category: true },
    orderBy: { publishedAt: "desc" },
  });

  const items = posts.map((post) => ({
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    coverImage: post.coverImage,
    categoryName: post.category?.name ?? null,
    publishedLabel: post.publishedAt?.toLocaleDateString("zh-CN") ?? null,
  }));

  return (
    <section className="section-surface py-14">
      <div className="section-wrap">
        <Reveal>
          <h1 className="text-3xl font-semibold text-[var(--sg-green)]">博客 / 指南</h1>
        </Reveal>
        <BlogPostList posts={items} />
        {posts.length === 0 ? (
          <p className="mt-8 text-sm text-zinc-600">暂无文章。</p>
        ) : null}
      </div>
    </section>
  );
}
