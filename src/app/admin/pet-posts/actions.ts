"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  petId: z.string().min(1),
  caption: z.string().min(1).max(4000),
  mediaUrls: z.array(z.string().url()).max(8),
});

export type CreatePetPostState =
  | { ok: true }
  | { ok: false; message: string };

export async function createPetPost(
  _prev: CreatePetPostState | undefined,
  formData: FormData,
): Promise<CreatePetPostState> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { ok: false, message: "Administrator access required." };
  }

  const mediaRaw = formData.get("mediaUrls");
  const mediaUrls =
    typeof mediaRaw === "string" && mediaRaw.length > 0
      ? mediaRaw
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

  const parsed = schema.safeParse({
    petId: String(formData.get("petId") ?? ""),
    caption: String(formData.get("caption") ?? ""),
    mediaUrls,
  });

  if (!parsed.success) {
    return { ok: false, message: "Check the pet, caption, and image URL format." };
  }

  const pet = await prisma.pet.findUnique({ where: { id: parsed.data.petId } });
  if (!pet) {
    return { ok: false, message: "Pet not found." };
  }

  await prisma.petPost.create({
    data: {
      petId: parsed.data.petId,
      caption: parsed.data.caption,
      media:
        parsed.data.mediaUrls.length > 0
          ? {
              create: parsed.data.mediaUrls.map((mediaUrl) => ({
                mediaUrl,
                altText: null,
              })),
            }
          : undefined,
    },
  });

  revalidatePath("/admin/pet-posts");
  revalidatePath("/pet-feed");

  return { ok: true };
}
