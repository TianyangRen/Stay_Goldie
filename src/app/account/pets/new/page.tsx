import Link from "next/link";
import { PetForm } from "@/components/account/pet-form";
import { Reveal } from "@/components/motion/reveal";

export default function NewPetPage() {
  return (
    <section className="section-surface py-14">
      <div className="section-wrap">
        <div className="mx-auto max-w-lg">
          <Reveal>
            <p className="text-sm text-zinc-600">
              <Link href="/account/pets" className="text-[var(--sg-green)] underline underline-offset-4">
                ← My pets
              </Link>
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="mt-4 text-3xl font-semibold text-[var(--sg-green)]">Add a pet</h1>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mt-2 text-sm text-zinc-600">Basics help us quote boarding using each dog&apos;s size tier.</p>
          </Reveal>
          <div className="mt-8">
            <PetForm mode="create" />
          </div>
        </div>
      </div>
    </section>
  );
}
