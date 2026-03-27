import { auth } from "@/auth";
import { BookingPageShell, BookingRecentList } from "@/components/booking/booking-page-shell";
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

  const recentItems = recent.map((booking) => ({
    id: booking.id,
    line: `${booking.checkInDate.toLocaleDateString("zh-CN")} - ${booking.checkOutDate.toLocaleDateString("zh-CN")} · ${
      booking.status
    } · CAD ${cad(booking.estimatedTotalCad).toFixed(2)}`,
  }));

  return (
    <BookingPageShell
      formSlot={
        <BookingForm
          pets={pets}
          isLoggedIn={isLoggedIn}
          baseNightlyCad={baseNightlyCad}
          defaultCheckIn={fmt(defaultCheckIn)}
          defaultCheckOut={fmt(defaultCheckOut)}
        />
      }
      aside={<BookingRecentList items={recentItems} />}
    />
  );
}
