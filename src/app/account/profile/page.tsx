import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ProfileForm } from "@/components/account/profile-form";
import { Pressable } from "@/components/motion/pressable";
import { Reveal } from "@/components/motion/reveal";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?next=/account/profile");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, name: true, image: true, role: true },
  });
  if (!user) {
    redirect("/login");
  }

  return (
    <section className="section-surface py-14">
      <div className="section-wrap">
        <Reveal>
          <h1 className="text-3xl font-semibold text-[var(--sg-green)]">Profile</h1>
          <p className="mt-2 text-sm text-zinc-600">
            Your display name and avatar appear on likes, comments, and updates you publish.
          </p>
        </Reveal>

        {user.role === "OWNER" ? (
          <Reveal delay={0.05}>
            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              <Pressable className="inline-block">
                <Link
                  href="/account/pets"
                  className="rounded-full border border-[var(--sg-border-subtle)] bg-[var(--sg-surface-elevated)] px-4 py-2 font-medium text-zinc-800"
                >
                  My pets
                </Link>
              </Pressable>
              <Pressable className="inline-block">
                <Link
                  href="/account/updates"
                  className="rounded-full border border-[var(--sg-border-subtle)] bg-[var(--sg-surface-elevated)] px-4 py-2 font-medium text-zinc-800"
                >
                  My updates
                </Link>
              </Pressable>
            </div>
          </Reveal>
        ) : (
          <Reveal delay={0.05}>
            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              <Pressable className="inline-block">
                <Link
                  href="/admin/blog"
                  className="rounded-full border border-[var(--sg-border-subtle)] bg-[var(--sg-surface-elevated)] px-4 py-2 font-medium text-zinc-800"
                >
                  Staff updates & personas
                </Link>
              </Pressable>
            </div>
          </Reveal>
        )}

        <div className="mt-8">
          <ProfileForm email={user.email} initialName={user.name ?? ""} initialImage={user.image} />
        </div>
      </div>
    </section>
  );
}
