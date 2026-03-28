"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { persistBookingDraft, type BookingDraftInput } from "@/lib/booking-draft-service";

export type CreateBookingState =
  | { ok: true; bookingId: string }
  | { ok: false; message: string };

/**
 * Server Action entry: auth + role, then delegates draft persistence to booking-draft-service.
 */
export async function createBookingDraft(input: BookingDraftInput): Promise<CreateBookingState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, message: "请先登录。" };
  }
  if (session.user.role !== "OWNER") {
    return { ok: false, message: "预约仅支持主人账号，管理员请通过后台管理档期。" };
  }

  const result = await persistBookingDraft(session.user.id, input);
  if (!result.ok) {
    return result;
  }

  revalidatePath("/booking");
  revalidatePath("/account/bookings");

  return result;
}
