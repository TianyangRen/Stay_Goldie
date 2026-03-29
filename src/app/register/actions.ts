"use server";

/** Owner self-registration: Zod + bcrypt + Prisma user row. */

import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().max(80).optional(),
});

export type RegisterState =
  | { ok: true }
  | { ok: false; message: string };

export async function registerUser(input: {
  email: string;
  password: string;
  name?: string;
}): Promise<RegisterState> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    const msg = parsed.error.flatten().fieldErrors.password?.[0] ?? "Check your input.";
    return { ok: false, message: msg };
  }

  const email = parsed.data.email.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  try {
    await prisma.user.create({
      data: {
        email,
        name: parsed.data.name?.trim() || null,
        passwordHash,
        role: "OWNER",
      },
    });
    return { ok: true };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { ok: false, message: "That email is already registered. Sign in instead." };
    }
    console.error(e);
    return { ok: false, message: "Registration failed. Try again in a moment." };
  }
}
