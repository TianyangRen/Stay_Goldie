import { Prisma } from "@prisma/client";
import { getBoardingBaseNightlyCad } from "@/lib/boarding";
import { prisma } from "@/lib/prisma";
import { estimateBookingTotal } from "@/lib/pricing";

/** Input from booking UI / Server Action (date strings as YYYY-MM-DD). */
export type BookingDraftInput = {
  checkIn: string;
  checkOut: string;
  petIds: string[];
};

export type BookingDraftResult =
  | { ok: true; bookingId: string }
  | { ok: false; message: string };

type DateRange =
  | { ok: true; checkInDate: Date; checkOutDate: Date }
  | { ok: false; message: string };

/** Parses noon-local date strings and enforces check-out after check-in. */
function parseStayDateRange(checkIn: string, checkOut: string): DateRange {
  const checkInDate = new Date(`${checkIn}T12:00:00`);
  const checkOutDate = new Date(`${checkOut}T12:00:00`);

  if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime())) {
    return { ok: false, message: "Invalid date format." };
  }
  if (checkOutDate <= checkInDate) {
    return { ok: false, message: "Check-out must be after check-in." };
  }
  return { ok: true, checkInDate, checkOutDate };
}

/**
 * Core booking draft persistence: pets must belong to owner; totals from pricing lib.
 * Caller must enforce auth (OWNER) before invoking.
 */
export async function persistBookingDraft(
  ownerId: string,
  input: BookingDraftInput,
): Promise<BookingDraftResult> {
  if (input.petIds.length === 0) {
    return { ok: false, message: "Select at least one pet." };
  }

  const pets = await prisma.pet.findMany({
    where: { ownerId, id: { in: input.petIds } },
  });

  if (pets.length !== input.petIds.length) {
    return { ok: false, message: "Invalid pet selection." };
  }

  const range = parseStayDateRange(input.checkIn, input.checkOut);
  if (!range.ok) {
    return range;
  }

  const tiers = pets.map((pet) => pet.sizeTier ?? "medium");
  const baseNightlyCad = getBoardingBaseNightlyCad();
  const estimate = estimateBookingTotal({
    baseNightlyCad,
    petSizeTiers: tiers,
    checkIn: input.checkIn,
    checkOut: input.checkOut,
  });

  const booking = await prisma.booking.create({
    data: {
      ownerId,
      checkInDate: range.checkInDate,
      checkOutDate: range.checkOutDate,
      nightlyRateCad: new Prisma.Decimal(baseNightlyCad),
      estimatedTotalCad: new Prisma.Decimal(estimate.estimatedTotal),
      depositCad: new Prisma.Decimal(estimate.deposit),
      status: "PENDING",
      pets: {
        create: input.petIds.map((petId) => ({ petId })),
      },
    },
  });

  return { ok: true, bookingId: booking.id };
}
