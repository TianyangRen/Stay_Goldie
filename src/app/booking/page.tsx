import { auth } from "@/auth";
import { BookingForm } from "@/components/booking/booking-form";
import { getBoardingBaseNightlyCad } from "@/lib/boarding";
import { prisma } from "@/lib/prisma";
import { cad } from "@/lib/cad";

export const dynamic = "force-dynamic";

export default async function BookingPage() {
  const session = await auth();
  const ownerId = session?.user?.id;
  const isLoggedIn = !!ownerId;

  const pets = ownerId
    ? await prisma.pet.findMany({
        where: { ownerId },
        orderBy: { name: "asc" },
        select: { id: true, name: true, sizeTier: true },
      })
    : [];

  const baseNightlyCad = getBoardingBaseNightlyCad();

  const recent = await prisma.booking.findMany({
    where: ownerId ? { ownerId } : undefined,
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const defaultCheckIn = new Date();
  defaultCheckIn.setDate(defaultCheckIn.getDate() + 7);
  const defaultCheckOut = new Date(defaultCheckIn);
  defaultCheckOut.setDate(defaultCheckOut.getDate() + 4);

  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  return (
    <section className="section-wrap py-14">
      <div className="grid gap-6 lg:grid-cols-3">
        <article className="rounded-3xl border border-black/10 bg-white p-7 lg:col-span-2">
          <h1 className="text-3xl font-semibold text-[var(--sg-green)]">寄养预约</h1>
          <p className="mt-3 text-sm leading-7 text-zinc-600">
            选择日期与宠物，系统将创建预约并跳转 Stripe 支付订金（CAD）。支付成功后预约状态将更新为已确认。
          </p>
          <div className="mt-8">
            <BookingForm
              pets={pets}
              isLoggedIn={isLoggedIn}
              baseNightlyCad={baseNightlyCad}
              defaultCheckIn={fmt(defaultCheckIn)}
              defaultCheckOut={fmt(defaultCheckOut)}
            />
          </div>
        </article>

        <aside className="rounded-3xl border border-black/10 bg-white p-6">
          <h2 className="text-lg font-semibold text-zinc-900">近期预约</h2>
          <ul className="mt-4 space-y-3 text-sm text-zinc-600">
            {recent.map((booking) => (
              <li key={booking.id} className="rounded-xl bg-zinc-50 p-3">
                {booking.checkInDate.toLocaleDateString("zh-CN")} -{" "}
                {booking.checkOutDate.toLocaleDateString("zh-CN")} · {booking.status} · CAD{" "}
                {cad(booking.estimatedTotalCad).toFixed(2)}
              </li>
            ))}
          </ul>
          {recent.length === 0 ? (
            <p className="mt-4 text-sm text-zinc-500">暂无记录。登录并预约后将显示在此。</p>
          ) : null}
        </aside>
      </div>
    </section>
  );
}
