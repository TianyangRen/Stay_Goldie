import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { cad } from "@/lib/cad";

export const dynamic = "force-dynamic";

export default async function AccountBookingsPage() {
  const session = await auth();
  const ownerId = session?.user?.id;
  if (!ownerId) {
    return null;
  }

  const bookings = await prisma.booking.findMany({
    where: { ownerId },
    include: {
      pets: { include: { pet: true } },
    },
    orderBy: { checkInDate: "desc" },
  });

  return (
    <section className="section-wrap py-14">
      <h1 className="text-3xl font-semibold text-[var(--sg-green)]">我的预约</h1>
      <div className="mt-6 space-y-4">
        {bookings.map((booking) => (
          <article key={booking.id} className="rounded-2xl border border-black/10 bg-white p-5">
            <p className="text-sm text-zinc-700">
              {booking.checkInDate.toLocaleDateString("zh-CN")} -{" "}
              {booking.checkOutDate.toLocaleDateString("zh-CN")} · 状态 {booking.status}
            </p>
            <p className="mt-2 text-sm text-zinc-500">
              预估总价 CAD {cad(booking.estimatedTotalCad).toFixed(2)}（订金 CAD{" "}
              {cad(booking.depositCad).toFixed(2)}）
            </p>
            <p className="mt-2 text-xs text-zinc-500">
              宠物：
              {booking.pets.map((bp) => bp.pet.name).join("、") || "—"}
            </p>
          </article>
        ))}
      </div>
      {bookings.length === 0 ? (
        <p className="mt-6 text-sm text-zinc-600">暂无预约记录。</p>
      ) : null}
    </section>
  );
}
