import { BlogPostList } from "@/components/blog/blog-post-list";
import { Reveal } from "@/components/motion/reveal";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const session = await auth();

  const posts = await prisma.blogPost.findMany({
    where: { publishedAt: { not: null } },
    include: {
      category: true,
      persona: true,
      author: { select: { name: true, image: true, email: true } },
      _count: { select: { likes: true, comments: true } },
    },
    orderBy: { publishedAt: "desc" },
  });

  const ids = posts.map((p) => p.id);
  const likedRows =
    session?.user?.id && ids.length > 0
      ? await prisma.blogPostLike.findMany({
          where: { userId: session.user.id, postId: { in: ids } },
          select: { postId: true },
        })
      : [];
  const likedSet = new Set(likedRows.map((r) => r.postId));

  const previewCommentsByPost = await Promise.all(
    posts.map((post) =>
      prisma.blogPostComment.findMany({
        where: { postId: post.id },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { user: { select: { name: true, email: true } } },
      }),
    ),
  );

  const items = posts.map((post, index) => {
    const displayName = post.persona?.name ?? post.author.name ?? post.author.email?.split("@")[0] ?? "Member";
    const displayImage = post.persona?.avatarUrl ?? post.author.image ?? null;
    const previewRows = previewCommentsByPost[index] ?? [];
    const previewComments = [...previewRows].reverse().map((c) => ({
      id: c.id,
      content: c.content,
      createdAt: c.createdAt.toISOString(),
      authorLabel: c.user.name ?? c.user.email?.split("@")[0] ?? "Member",
    }));
    return {
      id: post.id,
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      coverImage: post.coverImage,
      categoryName: post.category?.name ?? null,
      publishedLabel: post.publishedAt?.toLocaleDateString("en-CA") ?? null,
      authorName: displayName,
      authorImage: displayImage,
      likeCount: post._count.likes,
      commentCount: post._count.comments,
      liked: likedSet.has(post.id),
      previewComments,
    };
  });

  return (
    <section className="section-surface py-14">
      <div className="section-wrap">
        <Reveal>
          <h1 className="text-3xl font-semibold text-[var(--sg-green)]">Updates</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-600">
            Quick photos and notes from us — a light feed, not long articles. Guest pups have their own{" "}
            <a href="/pet-feed" className="font-medium text-[var(--sg-cta)] underline underline-offset-4">
              live feed
            </a>
            . Log in to like and comment.
          </p>
        </Reveal>
        <BlogPostList posts={items} />
        {posts.length === 0 ? (
          <p className="mt-8 text-sm text-zinc-600">No posts yet.</p>
        ) : null}
      </div>
    </section>
  );
}
