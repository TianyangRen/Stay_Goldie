import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return (
    <section className="section-wrap py-14">
      <h1 className="text-3xl font-semibold text-[var(--sg-green)]">管理端：博客发布</h1>
      <div className="mt-6 rounded-3xl border border-black/10 bg-white p-6">
        <form className="grid gap-4">
          <input className="rounded-xl border border-black/10 p-3 text-sm" placeholder="文章标题" disabled />
          <input className="rounded-xl border border-black/10 p-3 text-sm" placeholder="slug" disabled />
          <textarea
            className="rounded-xl border border-black/10 p-3 text-sm"
            rows={7}
            placeholder="正文"
            disabled
          />
          <p className="text-xs text-zinc-500">
            生产发布建议使用 MDX/CMS 或 Server Action 写入 BlogPost。
          </p>
        </form>
      </div>
      <ul className="mt-6 space-y-2">
        {posts.map((post) => (
          <li
            key={post.id}
            className="rounded-xl border border-black/10 bg-white px-4 py-3 text-sm"
          >
            {post.title}
          </li>
        ))}
      </ul>
    </section>
  );
}
