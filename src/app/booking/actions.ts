"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { getBoardingBaseNightlyCad } from "@/lib/boarding";
import { prisma } from "@/lib/prisma";
import { estimateBookingTotal } from "@/lib/pricing";

export type CreateBookingState =
  | { ok: true; bookingId: string }
  | { ok: false; message: string };

export async function createBookingDraft(input: {
  checkIn: string;
  checkOut: string;
  petIds: string[];
}): Promise<CreateBookingState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, message: "请先登录。" };
  }

  if (input.petIds.length === 0) {
    return { ok: false, message: "请至少选择一只宠物。" };
  }

  const pets = await prisma.pet.findMany({
    where: { ownerId: session.user.id, id: { in: input.petIds } },
  });

  if (pets.length !== input.petIds.length) {
    return { ok: false, message: "宠物选择无效。" };
  }

  const inDate = new Date(`${input.checkIn}T12:00:00`);
  const outDate = new Date(`${input.checkOut}T12:00:00`);

  if (Number.isNaN(inDate.getTime()) || Number.isNaN(outDate.getTime())) {
    return { ok: false, message: "日期格式无效。" };
  }

  if (outDate <= inDate) {
    return { ok: false, message: "离店日期须晚于入住日期。" };
  }

  const tiers = pets.map((p) => p.sizeTier ?? "medium");
  const base = getBoardingBaseNightlyCad();
  const estimate = estimateBookingTotal({
    baseNightlyCad: base,
    petSizeTiers: tiers,
    checkIn: input.checkIn,
    checkOut: input.checkOut,
  });

  const booking = await prisma.booking.create({
    data: {
      ownerId: session.user.id,
      checkInDate: inDate,
      checkOutDate: outDate,
      nightlyRateCad: new Prisma.Decimal(base),
      estimatedTotalCad: new Prisma.Decimal(estimate.estimatedTotal),
      depositCad: new Prisma.Decimal(estimate.deposit),
      status: "PENDING",
      pets: {
        create: input.petIds.map((petId) => ({ petId })),
      },
    },
  });

  revalidatePath("/booking");
  revalidatePath("/account/bookings");

  return { ok: true, bookingId: booking.id };
}
