import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { UpdateComposer } from "@/components/blog/update-composer";
import { Reveal } from "@/components/motion/reveal";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function NewAccountUpdatePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?next=/account/updates/new");
  }
  if (session.user.role !== "OWNER") {
    redirect("/admin/blog");
  }

  const categories = await prisma.blogCategory.findMany({ orderBy: { name: "asc" } });

  return (
    <section className="section-surface py-14">
      <div className="section-wrap">
        <Reveal>
          <h1 className="text-3xl font-semibold text-[var(--sg-green)]">Publish an update</h1>
          <p className="mt-2 text-sm text-zinc-600">Appears on the public Updates feed for everyone.</p>
        </Reveal>
        <div className="mt-8 max-w-xl card-elevated rounded-3xl p-6">
          <UpdateComposer categories={categories.map((c) => ({ id: c.id, name: c.name }))} redirectAfter="/account/updates" />
        </div>
      </div>
    </section>
  );
}
