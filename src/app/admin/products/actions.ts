"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import {
  insertAdminProduct,
  parseAdminProductInput,
  type AdminProductFormInput,
  updateAdminProductRecord,
} from "@/lib/admin-product-service";
import { prisma } from "@/lib/prisma";

export type AdminProductState = { ok: true } | { ok: false; message: string };

/** Ensures the current session is an admin (mutations are admin-only). */
async function requireAdminSession() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return null;
  }
  return session;
}

function revalidateProductPaths(slugs: string[]) {
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  for (const slug of slugs) {
    if (slug) revalidatePath(`/shop/${slug}`);
  }
}

export async function createProduct(input: AdminProductFormInput): Promise<AdminProductState> {
  if (!(await requireAdminSession())) {
    return { ok: false, message: "Administrator access required." };
  }

  const parsed = parseAdminProductInput(input);
  if (!parsed.ok) {
    return { ok: false, message: parsed.message };
  }

  try {
    const product = await insertAdminProduct(parsed.value);
    revalidateProductPaths([product.slug]);
    return { ok: true };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { ok: false, message: "That slug is already taken—try another." };
    }
    console.error(e);
    return { ok: false, message: "Create failed." };
  }
}

export async function updateProduct(
  productId: string,
  input: AdminProductFormInput,
): Promise<AdminProductState> {
  if (!(await requireAdminSession())) {
    return { ok: false, message: "Administrator access required." };
  }

  const existing = await prisma.product.findUnique({ where: { id: productId } });
  if (!existing) {
    return { ok: false, message: "Product not found." };
  }

  const parsed = parseAdminProductInput(input);
  if (!parsed.ok) {
    return { ok: false, message: parsed.message };
  }

  try {
    await updateAdminProductRecord(productId, parsed.value);
    const slugs = [existing.slug, parsed.value.slug].filter(Boolean);
    revalidateProductPaths(slugs);
    return { ok: true };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { ok: false, message: "That slug is already taken." };
    }
    console.error(e);
    return { ok: false, message: "Save failed." };
  }
}

export async function deleteProduct(productId: string): Promise<AdminProductState> {
  if (!(await requireAdminSession())) {
    return { ok: false, message: "Administrator access required." };
  }

  const existing = await prisma.product.findUnique({
    where: { id: productId },
    include: { _count: { select: { orderItems: true } } },
  });
  if (!existing) {
    return { ok: false, message: "Product not found." };
  }
  if (existing._count.orderItems > 0) {
    return { ok: false, message: "This product has orders and cannot be deleted—mark it inactive instead." };
  }

  try {
    await prisma.$transaction([
      prisma.inventory.deleteMany({ where: { productId } }),
      prisma.product.delete({ where: { id: productId } }),
    ]);
    revalidateProductPaths([existing.slug]);
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, message: "Delete failed—related data may still exist." };
  }
}
