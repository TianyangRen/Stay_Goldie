import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Pressable } from "@/components/motion/pressable";
import { Reveal } from "@/components/motion/reveal";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AccountUpdatesPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?next=/account/updates");
  }
  if (session.user.role !== "OWNER") {
    redirect("/admin/blog");
  }

  const posts = await prisma.blogPost.findMany({
    where: { authorId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { persona: true },
  });

  return (
    <section className="section-surface py-14">
      <div className="section-wrap">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <Reveal>
            <div>
              <h1 className="text-3xl font-semibold text-[var(--sg-green)]">My updates</h1>
              <p className="mt-2 text-sm text-zinc-600">
                Short posts on the public Updates feed — same style as staff posts, without pet personas.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.05}>
            <Pressable className="inline-block">
              <Link
                href="/account/updates/new"
                className="inline-flex rounded-full bg-[var(--sg-cta)] px-5 py-2.5 text-sm font-medium text-white"
              >
                New update
              </Link>
            </Pressable>
          </Reveal>
        </div>

        <ul className="mt-10 space-y-3">
          {posts.map((post) => (
            <li
              key={post.id}
              className="rounded-2xl border border-[var(--sg-border-subtle)] bg-[var(--sg-surface-elevated)] px-4 py-3 text-sm"
            >
              <Link href={`/blog/${post.slug}`} className="font-medium text-[var(--sg-text)] hover:underline">
                {post.title}
              </Link>
              <p className="mt-1 text-xs text-zinc-500">
                {post.publishedAt?.toLocaleDateString("en-CA") ?? "Draft"} · {post.persona ? `As ${post.persona.name}` : "As you"}
              </p>
            </li>
          ))}
        </ul>
        {posts.length === 0 ? (
          <p className="mt-10 text-sm text-zinc-600">You have not published an update yet.</p>
        ) : null}
      </div>
    </section>
  );
}
