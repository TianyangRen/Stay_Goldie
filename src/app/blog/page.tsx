import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: { publishedAt: { not: null } },
    include: { category: true },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <section className="section-wrap py-14">
      <h1 className="text-3xl font-semibold text-[var(--sg-green)]">博客 / 指南</h1>
      <div className="mt-8 space-y-5">
        {posts.map((post) => (
          <article
            key={post.id}
            className="grid gap-4 rounded-3xl border border-black/10 bg-white p-4 md:grid-cols-4"
          >
            <div className="relative h-40 overflow-hidden rounded-2xl md:col-span-1">
              {post.coverImage ? (
                <Image src={post.coverImage} alt={post.title} fill className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center bg-zinc-100 text-xs text-zinc-500">
                  无封面
                </div>
              )}
            </div>
            <div className="md:col-span-3">
              <p className="text-xs text-zinc-500">
                {post.category?.name ?? "未分类"} ·{" "}
                {post.publishedAt?.toLocaleDateString("zh-CN")}
              </p>
              <h2 className="mt-1 text-xl font-semibold">{post.title}</h2>
              <p className="mt-2 text-sm text-zinc-600">{post.excerpt}</p>
              <Link
                href={`/blog/${post.slug}`}
                className="mt-3 inline-block text-sm font-medium text-[var(--sg-green)]"
              >
                阅读全文
              </Link>
            </div>
          </article>
        ))}
      </div>
      {posts.length === 0 ? (
        <p className="mt-8 text-sm text-zinc-600">暂无文章。</p>
      ) : null}
    </section>
  );
}
