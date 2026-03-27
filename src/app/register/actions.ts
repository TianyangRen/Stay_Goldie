"use server";

import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "密码至少 8 位"),
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
    const msg = parsed.error.flatten().fieldErrors.password?.[0] ?? "请检查输入。";
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
      return { ok: false, message: "该邮箱已注册，请直接登录。" };
    }
    console.error(e);
    return { ok: false, message: "注册失败，请稍后重试。" };
  }
}
