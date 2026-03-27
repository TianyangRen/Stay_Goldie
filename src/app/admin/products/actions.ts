"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const slugSchema = z
  .string()
  .min(2)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug 仅小写英文、数字与连字符，例如 low-allergy-food-2kg");

const productFields = z.object({
  name: z.string().min(1, "请填写名称").max(200),
  slug: slugSchema,
  description: z.string().min(1, "请填写描述").max(10000),
  imageUrl: z.string().max(2048).optional(),
  basePriceCad: z.coerce.number().positive("基础价须大于 0"),
  salePriceCad: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    z.coerce.number().positive().optional(),
  ),
  stock: z.coerce.number().int().min(0, "库存不能为负"),
  lowStockLevel: z.coerce.number().int().min(0),
  isActive: z.boolean(),
});

export type AdminProductState = { ok: true } | { ok: false; message: string };

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return null;
  }
  return session;
}

function parseImageUrl(raw: string | undefined): string | null {
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

export async function createProduct(
  input: z.input<typeof productFields>,
): Promise<AdminProductState> {
  if (!(await requireAdmin())) {
    return { ok: false, message: "需要管理员权限。" };
  }

  const parsed = productFields.safeParse(input);
  if (!parsed.success) {
    const err = parsed.error.flatten();
    const first =
      err.fieldErrors.slug?.[0] ??
      err.fieldErrors.name?.[0] ??
      err.fieldErrors.description?.[0] ??
      err.fieldErrors.basePriceCad?.[0] ??
      "输入无效";
    return { ok: false, message: first };
  }

  const imageUrl = parseImageUrl(parsed.data.imageUrl);
  if (parsed.data.imageUrl?.trim() && !imageUrl) {
    return { ok: false, message: "图片 URL 无效。" };
  }

  const sale =
    parsed.data.salePriceCad !== undefined ? new Prisma.Decimal(parsed.data.salePriceCad) : null;

  try {
    const product = await prisma.product.create({
      data: {
        name: parsed.data.name.trim(),
        slug: parsed.data.slug.trim(),
        description: parsed.data.description.trim(),
        imageUrl: imageUrl ?? null,
        basePriceCad: new Prisma.Decimal(parsed.data.basePriceCad),
        salePriceCad: sale,
        isActive: parsed.data.isActive,
        inventory: {
          create: {
            stock: parsed.data.stock,
            lowStockLevel: parsed.data.lowStockLevel,
          },
        },
      },
    });
    revalidatePath("/admin/products");
    revalidatePath("/shop");
    revalidatePath(`/shop/${product.slug}`);
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
  input: z.input<typeof productFields>,
): Promise<AdminProductState> {
  if (!(await requireAdmin())) {
    return { ok: false, message: "需要管理员权限。" };
  }

  const existing = await prisma.product.findUnique({ where: { id: productId } });
  if (!existing) {
    return { ok: false, message: "商品不存在。" };
  }

  const parsed = productFields.safeParse(input);
  if (!parsed.success) {
    const err = parsed.error.flatten();
    const first =
      err.fieldErrors.slug?.[0] ??
      err.fieldErrors.name?.[0] ??
      err.fieldErrors.description?.[0] ??
      err.fieldErrors.basePriceCad?.[0] ??
      "输入无效";
    return { ok: false, message: first };
  }

  const imageUrl = parseImageUrl(parsed.data.imageUrl);
  if (parsed.data.imageUrl?.trim() && !imageUrl) {
    return { ok: false, message: "图片 URL 无效。" };
  }

  const sale =
    parsed.data.salePriceCad !== undefined ? new Prisma.Decimal(parsed.data.salePriceCad) : null;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: productId },
        data: {
          name: parsed.data.name.trim(),
          slug: parsed.data.slug.trim(),
          description: parsed.data.description.trim(),
          imageUrl: imageUrl ?? null,
          basePriceCad: new Prisma.Decimal(parsed.data.basePriceCad),
          salePriceCad: sale,
          isActive: parsed.data.isActive,
        },
      });

      await tx.inventory.upsert({
        where: { productId },
        create: {
          productId,
          stock: parsed.data.stock,
          lowStockLevel: parsed.data.lowStockLevel,
        },
        update: {
          stock: parsed.data.stock,
          lowStockLevel: parsed.data.lowStockLevel,
        },
      });
    });

    revalidatePath("/admin/products");
    revalidatePath("/shop");
    revalidatePath(`/shop/${existing.slug}`);
    if (parsed.data.slug !== existing.slug) {
      revalidatePath(`/shop/${parsed.data.slug}`);
    }
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
  if (!(await requireAdmin())) {
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
    revalidatePath("/admin/products");
    revalidatePath("/shop");
    revalidatePath(`/shop/${existing.slug}`);
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, message: "删除失败，可能仍有关联数据。" };
  }
}
