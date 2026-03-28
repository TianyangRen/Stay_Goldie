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
    return { ok: false, message: "需要管理员权限。" };
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
      return { ok: false, message: "该 slug 已被占用，请换一个。" };
    }
    console.error(e);
    return { ok: false, message: "创建失败。" };
  }
}

export async function updateProduct(
  productId: string,
  input: AdminProductFormInput,
): Promise<AdminProductState> {
  if (!(await requireAdminSession())) {
    return { ok: false, message: "需要管理员权限。" };
  }

  const existing = await prisma.product.findUnique({ where: { id: productId } });
  if (!existing) {
    return { ok: false, message: "商品不存在。" };
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
      return { ok: false, message: "该 slug 已被占用。" };
    }
    console.error(e);
    return { ok: false, message: "保存失败。" };
  }
}

export async function deleteProduct(productId: string): Promise<AdminProductState> {
  if (!(await requireAdminSession())) {
    return { ok: false, message: "需要管理员权限。" };
  }

  const existing = await prisma.product.findUnique({
    where: { id: productId },
    include: { _count: { select: { orderItems: true } } },
  });
  if (!existing) {
    return { ok: false, message: "商品不存在。" };
  }
  if (existing._count.orderItems > 0) {
    return { ok: false, message: "该商品已有订单记录，不能删除，请改为下架。" };
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
    return { ok: false, message: "删除失败，可能仍有关联数据。" };
  }
}
