"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().min(1).max(80),
  image: z.string().url().optional().nullable().or(z.literal("")),
});

export type ProfileResult = { ok: true } | { ok: false; message: string };

export async function updateProfile(input: { name: string; image?: string | null }): Promise<ProfileResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, message: "Not signed in." };
  }

  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Check display name and image URL." };
  }

  const imageRaw = parsed.data.image?.trim();
  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: parsed.data.name.trim(),
      image: imageRaw && imageRaw.length > 0 ? imageRaw : null,
    },
  });

  revalidatePath("/account/profile");
  revalidatePath("/blog");
  return { ok: true };
}
