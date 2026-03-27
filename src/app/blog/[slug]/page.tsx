import { notFound } from "next/navigation";
import { BlogArticle } from "@/components/blog/blog-article";
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

  const meta = `${post.category?.name ?? "未分类"} · ${post.publishedAt?.toLocaleDateString("zh-CN") ?? ""}`;

  return (
    <BlogArticle
      meta={meta}
      title={post.title}
      content={post.content}
      coverImage={post.coverImage}
    />
  );
}
