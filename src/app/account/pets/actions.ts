"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const petFields = z.object({
  name: z.string().min(1, "Pet name is required").max(80),
  breed: z.string().max(120).optional(),
  sizeTier: z.preprocess(
    (v) => (v === "" || v === undefined ? undefined : v),
    z.enum(["small", "medium", "large"]).optional(),
  ),
  birthDate: z.string().optional(),
  avatarUrl: z.string().max(2048).optional(),
});

export type PetMutationState =
  | { ok: true }
  | { ok: false; message: string };

function parseOptionalUrl(raw: string | undefined): string | null {
  const s = raw?.trim();
  if (!s) return null;
  try {
    const u = new URL(s);
    if (u.protocol === "http:" || u.protocol === "https:") return u.href;
  } catch {
    return null;
  }
  return null;
}

export async function createPet(input: {
  name: string;
  breed?: string;
  sizeTier?: string;
  birthDate?: string;
  avatarUrl?: string;
}): Promise<PetMutationState> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, message: "Please sign in first." };
  if (session.user.role !== "OWNER") {
    return { ok: false, message: "Only owner accounts can manage pets. Admins should use the dashboard." };
  }

  const parsed = petFields.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.flatten().fieldErrors.name?.[0] ?? "Invalid input." };
  }

  const birth =
    parsed.data.birthDate && parsed.data.birthDate.length >= 8
      ? new Date(`${parsed.data.birthDate}T12:00:00`)
      : null;
  if (birth && Number.isNaN(birth.getTime())) {
    return { ok: false, message: "Birthday is invalid." };
  }

  const avatarUrl = parseOptionalUrl(parsed.data.avatarUrl);

  await prisma.pet.create({
    data: {
      ownerId: session.user.id,
      name: parsed.data.name.trim(),
      breed: parsed.data.breed?.trim() || null,
      sizeTier: parsed.data.sizeTier ?? null,
      birthDate: birth,
      avatarUrl: avatarUrl ?? null,
    },
  });

  revalidatePath("/account/pets");
  revalidatePath("/booking");
  return { ok: true };
}

export async function updatePet(
  petId: string,
  input: {
    name: string;
    breed?: string;
    sizeTier?: string;
    birthDate?: string;
    avatarUrl?: string;
  },
): Promise<PetMutationState> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, message: "Please sign in first." };
  if (session.user.role !== "OWNER") {
    return { ok: false, message: "Only owner accounts can manage pets. Admins should use the dashboard." };
  }

  const pet = await prisma.pet.findFirst({
    where: { id: petId, ownerId: session.user.id },
  });
  if (!pet) return { ok: false, message: "Pet not found." };

  const parsed = petFields.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.flatten().fieldErrors.name?.[0] ?? "Invalid input." };
  }

  const birth =
    parsed.data.birthDate && parsed.data.birthDate.length >= 8
      ? new Date(`${parsed.data.birthDate}T12:00:00`)
      : null;
  if (birth && Number.isNaN(birth.getTime())) {
    return { ok: false, message: "Birthday is invalid." };
  }

  const avatarUrl = parseOptionalUrl(parsed.data.avatarUrl);

  await prisma.pet.update({
    where: { id: petId },
    data: {
      name: parsed.data.name.trim(),
      breed: parsed.data.breed?.trim() || null,
      sizeTier: parsed.data.sizeTier ?? null,
      birthDate: birth,
      avatarUrl: avatarUrl ?? null,
    },
  });

  revalidatePath("/account/pets");
  revalidatePath("/booking");
  revalidatePath(`/account/pets/${petId}/edit`);
  return { ok: true };
}

export async function deletePet(petId: string): Promise<PetMutationState> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, message: "Please sign in first." };
  if (session.user.role !== "OWNER") {
    return { ok: false, message: "Only owner accounts can manage pets." };
  }

  const pet = await prisma.pet.findFirst({
    where: { id: petId, ownerId: session.user.id },
    include: { _count: { select: { bookingPets: true, posts: true } } },
  });
  if (!pet) return { ok: false, message: "Pet not found." };

  if (pet._count.bookingPets > 0) {
    return { ok: false, message: "This pet has bookings and cannot be deleted—contact support." };
  }

  if (pet._count.posts > 0) {
    return { ok: false, message: "This pet has feed posts and cannot be deleted." };
  }

  const hasHealth = await prisma.petHealthProfile.findUnique({
    where: { petId },
    select: { id: true },
  });
  if (hasHealth) {
    return { ok: false, message: "Health records exist for this pet—contact an admin to remove it." };
  }

  await prisma.pet.delete({ where: { id: petId } });

  revalidatePath("/account/pets");
  revalidatePath("/booking");
  return { ok: true };
}
