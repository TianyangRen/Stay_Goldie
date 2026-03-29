import { notFound } from "next/navigation";
import { BlogArticle } from "@/components/blog/blog-article";
import { FeedPostEngagement } from "@/components/blog/feed-post-engagement";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();

  const post = await prisma.blogPost.findUnique({
    where: { slug },
    include: {
      category: true,
      persona: true,
      author: { select: { name: true, image: true, email: true } },
    },
  });

  if (!post) {
    notFound();
  }

  const metaLine = `${post.category?.name ?? "Update"} · ${post.publishedAt?.toLocaleDateString("en-CA") ?? ""}`;
  const authorName =
    post.persona?.name ?? post.author.name ?? post.author.email?.split("@")[0] ?? "Member";
  const authorImage = post.persona?.avatarUrl ?? post.author.image ?? null;

  const [comments, likeCount, userLike] = await Promise.all([
    prisma.blogPostComment.findMany({
      where: { postId: post.id },
      orderBy: { createdAt: "asc" },
      include: { user: { select: { name: true, image: true, email: true } } },
    }),
    prisma.blogPostLike.count({ where: { postId: post.id } }),
    session?.user?.id
      ? prisma.blogPostLike.findUnique({
          where: { postId_userId: { postId: post.id, userId: session.user.id } },
        })
      : null,
  ]);

  const commentRows = comments.map((c) => ({
    id: c.id,
    content: c.content,
    createdAt: c.createdAt.toISOString(),
    authorLabel: c.user.name ?? c.user.email?.split("@")[0] ?? "Member",
  }));

  return (
    <BlogArticle
      metaLine={metaLine}
      title={post.title}
      content={post.content}
      coverImage={post.coverImage}
      authorName={authorName}
      authorImage={authorImage}
    >
      <FeedPostEngagement
        postId={post.id}
        slug={post.slug}
        initialLiked={Boolean(userLike)}
        initialLikeCount={likeCount}
        initialCommentCount={comments.length}
        comments={commentRows}
      />
    </BlogArticle>
  );
}
