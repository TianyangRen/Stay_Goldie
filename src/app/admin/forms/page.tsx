import { Reveal } from "@/components/motion/reveal";

export default function AdminFormsPage() {
  return (
    <section className="section-wrap py-14">
      <Reveal>
        <h1 className="text-3xl font-semibold text-[var(--sg-green)]">Admin · Intake forms & records</h1>
      </Reveal>
      <Reveal delay={0.06}>
        <div className="mt-6 card-elevated rounded-3xl p-6">
          <p className="text-sm leading-7 text-zinc-600">
            Placeholder for configuring intake questions, reviewing health files, and vaccine uploads. Hook this to your
            database workflow when you are ready.
          </p>
        </div>
      </Reveal>
    </section>
  );
}
