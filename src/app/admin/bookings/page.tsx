import { prisma } from "@/lib/prisma";
import { Reveal } from "@/components/motion/reveal";
import { StaggerSurfaceItem } from "@/components/motion/stagger-surface-item";
import { cad } from "@/lib/cad";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage() {
  const bookings = await prisma.booking.findMany({
    include: {
      owner: true,
      pets: { include: { pet: true } },
    },
    orderBy: { checkInDate: "desc" },
  });

  return (
    <section className="section-wrap py-14">
      <Reveal>
        <h1 className="text-3xl font-semibold text-[var(--sg-green)]">Admin · Bookings & calendar</h1>
      </Reveal>
      <div className="mt-6 grid gap-4">
        {bookings.map((booking, index) => (
          <StaggerSurfaceItem
            key={booking.id}
            index={index}
            className="card-elevated rounded-2xl p-5"
          >
            <p className="text-sm font-medium">
              {booking.checkInDate.toLocaleDateString("en-CA")} –{" "}
              {booking.checkOutDate.toLocaleDateString("en-CA")}
            </p>
            <p className="mt-2 text-sm text-zinc-600">
              Owner: {booking.owner.email} · Status: {booking.status} · Deposit CAD{" "}
              {cad(booking.depositCad).toFixed(2)}
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              Pets: {booking.pets.map((bp) => bp.pet.name).join(", ")}
            </p>
          </StaggerSurfaceItem>
        ))}
      </div>
      {bookings.length === 0 ? (
        <Reveal>
          <p className="mt-6 text-sm text-zinc-600">No bookings yet.</p>
        </Reveal>
      ) : null}
    </section>
  );
}
