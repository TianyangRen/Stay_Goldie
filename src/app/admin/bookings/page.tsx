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
        <h1 className="text-3xl font-semibold text-[var(--sg-green)]">管理端：档期与预约</h1>
      </Reveal>
      <div className="mt-6 grid gap-4">
        {bookings.map((booking, index) => (
          <StaggerSurfaceItem
            key={booking.id}
            index={index}
            className="card-elevated rounded-2xl p-5"
          >
            <p className="text-sm font-medium">
              {booking.checkInDate.toLocaleDateString("zh-CN")} -{" "}
              {booking.checkOutDate.toLocaleDateString("zh-CN")}
            </p>
            <p className="mt-2 text-sm text-zinc-600">
              主人：{booking.owner.email} · 状态：{booking.status} · 订金 CAD{" "}
              {cad(booking.depositCad).toFixed(2)}
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              宠物：{booking.pets.map((bp) => bp.pet.name).join("、")}
            </p>
          </StaggerSurfaceItem>
        ))}
      </div>
      {bookings.length === 0 ? (
        <Reveal>
          <p className="mt-6 text-sm text-zinc-600">暂无预约。</p>
        </Reveal>
      ) : null}
    </section>
  );
}
