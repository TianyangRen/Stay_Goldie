import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

/** URL slug: lowercase, digits, hyphen segments. */
const slugSchema = z
  .string()
  .min(2)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only, e.g. low-allergy-food-2kg");

/** Raw admin form / Server Action payload before DB write. */
export const adminProductFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  slug: slugSchema,
  description: z.string().min(1, "Description is required").max(10000),
  imageUrl: z.string().max(2048).optional(),
  basePriceCad: z.coerce.number().positive("Base price must be greater than 0"),
  salePriceCad: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    z.coerce.number().positive().optional(),
  ),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative"),
  lowStockLevel: z.coerce.number().int().min(0),
  isActive: z.boolean(),
});

export type AdminProductFormInput = z.input<typeof adminProductFormSchema>;

/** Normalized row ready for Prisma create/update. */
export type ParsedAdminProduct = {
  name: string;
  slug: string;
  description: string;
  imageUrl: string | null;
  basePriceCad: Prisma.Decimal;
  salePriceCad: Prisma.Decimal | null;
  stock: number;
  lowStockLevel: number;
  isActive: boolean;
};

function parseHttpsImageUrl(raw: string | undefined): string | null {
  const trimmed = raw?.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    if (url.protocol === "http:" || url.protocol === "https:") return url.href;
  } catch {
    return null;
  }
  return null;
}

function firstZodMessage(zodError: z.ZodError): string {
  const err = zodError.flatten().fieldErrors as Partial<
    Record<keyof z.infer<typeof adminProductFormSchema>, string[] | undefined>
  >;
  return (
    err.slug?.[0] ??
    err.name?.[0] ??
    err.description?.[0] ??
    err.basePriceCad?.[0] ??
    "Invalid input"
  );
}

/**
 * Validates and normalizes admin product input (Zod + image URL rules).
 */
export function parseAdminProductInput(
  input: AdminProductFormInput,
): { ok: true; value: ParsedAdminProduct } | { ok: false; message: string } {
  const parsed = adminProductFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: firstZodMessage(parsed.error) };
  }

  const imageUrl = parseHttpsImageUrl(parsed.data.imageUrl);
  if (parsed.data.imageUrl?.trim() && !imageUrl) {
    return { ok: false, message: "Image URL is invalid." };
  }

  const salePriceCad =
    parsed.data.salePriceCad !== undefined
      ? new Prisma.Decimal(parsed.data.salePriceCad)
      : null;

  return {
    ok: true,
    value: {
      name: parsed.data.name.trim(),
      slug: parsed.data.slug.trim(),
      description: parsed.data.description.trim(),
      imageUrl: imageUrl ?? null,
      basePriceCad: new Prisma.Decimal(parsed.data.basePriceCad),
      salePriceCad,
      stock: parsed.data.stock,
      lowStockLevel: parsed.data.lowStockLevel,
      isActive: parsed.data.isActive,
    },
  };
}

/** Inserts product + inventory row (admin create flow). */
export async function insertAdminProduct(row: ParsedAdminProduct) {
  return prisma.product.create({
    data: {
      name: row.name,
      slug: row.slug,
      description: row.description,
      imageUrl: row.imageUrl,
      basePriceCad: row.basePriceCad,
      salePriceCad: row.salePriceCad,
      isActive: row.isActive,
      inventory: {
        create: {
          stock: row.stock,
          lowStockLevel: row.lowStockLevel,
        },
      },
    },
  });
}

/** Updates product + upserts inventory (admin edit flow). */
export async function updateAdminProductRecord(productId: string, row: ParsedAdminProduct) {
  await prisma.$transaction(async (tx) => {
    await tx.product.update({
      where: { id: productId },
      data: {
        name: row.name,
        slug: row.slug,
        description: row.description,
        imageUrl: row.imageUrl,
        basePriceCad: row.basePriceCad,
        salePriceCad: row.salePriceCad,
        isActive: row.isActive,
      },
    });

    await tx.inventory.upsert({
      where: { productId },
      create: {
        productId,
        stock: row.stock,
        lowStockLevel: row.lowStockLevel,
      },
      update: {
        stock: row.stock,
        lowStockLevel: row.lowStockLevel,
      },
    });
  });
}
