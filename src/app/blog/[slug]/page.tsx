import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({
    where: { slug },
    include: { category: true },
  });

  if (!post) {
    notFound();
  }

  return (
    <article className="section-wrap py-14">
      <div className="mx-auto max-w-3xl rounded-3xl border border-black/10 bg-white p-8">
        <p className="text-xs text-zinc-500">
          {post.category?.name ?? "未分类"} ·{" "}
          {post.publishedAt?.toLocaleDateString("zh-CN")}
        </p>
        <h1 className="mt-2 text-3xl font-semibold">{post.title}</h1>
        <p className="mt-4 text-sm leading-8 text-zinc-700 whitespace-pre-wrap">{post.content}</p>
      </div>
    </article>
  );
}
