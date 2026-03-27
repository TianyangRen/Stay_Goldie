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
    return { ok: false, message: "需要管理员权限。" };
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
    return { ok: false, message: "请检查宠物、文案与图片 URL 格式。" };
  }

  const pet = await prisma.pet.findUnique({ where: { id: parsed.data.petId } });
  if (!pet) {
    return { ok: false, message: "未找到该宠物。" };
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
