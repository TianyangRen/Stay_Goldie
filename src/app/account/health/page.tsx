import { auth } from "@/auth";
import { Reveal } from "@/components/motion/reveal";
import { StaggerSurfaceItem } from "@/components/motion/stagger-surface-item";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AccountHealthPage() {
  const session = await auth();
  const ownerId = session?.user?.id;
  if (!ownerId) {
    return null;
  }

  const pets = await prisma.pet.findMany({
    where: { ownerId },
    include: {
      healthProfile: {
        include: {
          preferredClinics: true,
          vaccineDocuments: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const empty = "Not provided";

  return (
    <section className="section-surface py-14">
      <div className="section-wrap">
        <Reveal>
          <h1 className="text-3xl font-semibold text-[var(--sg-green)]">Intake & health records</h1>
        </Reveal>
        <Reveal delay={0.05}>
          <p className="mt-2 text-sm text-zinc-600">
            Every field is optional for now. Vaccine uploads should flow through the presigned URL flow into private
            storage.
          </p>
        </Reveal>
        <div className="mt-8 grid gap-5">
          {pets.map((pet, index) => {
            const profile = pet.healthProfile;
            const clinic = profile?.preferredClinics[0];
            return (
              <StaggerSurfaceItem
                key={pet.id}
                index={index}
                className="card-elevated rounded-3xl p-6"
              >
                <h2 className="text-lg font-semibold">{pet.name}</h2>
                <div className="mt-4 grid gap-3 text-sm text-zinc-700 md:grid-cols-2">
                  <p>Diet restrictions: {profile?.dietRestrictions ?? empty}</p>
                  <p>Medications: {profile?.medications ?? empty}</p>
                  <p>Social behaviour: {profile?.socialBehavior ?? empty}</p>
                  <p>Emergency contact: {profile?.emergencyContactName ?? empty}</p>
                  <p>Veterinarian: {profile?.vetName ?? empty}</p>
                  <p>Preferred clinic: {clinic?.clinicName ?? empty}</p>
                </div>
                {profile?.vaccineDocuments.length ? (
                  <p className="mt-3 text-xs text-zinc-500">
                    {profile.vaccineDocuments.length} vaccine file
                    {profile.vaccineDocuments.length === 1 ? "" : "s"} on file (stored securely server-side).
                  </p>
                ) : null}
              </StaggerSurfaceItem>
            );
          })}
        </div>
      </div>
    </section>
  );
}
