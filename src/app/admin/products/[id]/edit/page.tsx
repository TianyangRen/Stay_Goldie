import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/product-form";
import { Reveal } from "@/components/motion/reveal";
import { cad } from "@/lib/cad";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function AdminEditProductPage({ params }: Props) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { inventory: true },
  });
  if (!product) {
    notFound();
  }

  const initial = {
    name: product.name,
    slug: product.slug,
    description: product.description,
    imageUrl: product.imageUrl,
    basePriceCad: cad(product.basePriceCad),
    salePriceCad: product.salePriceCad ? cad(product.salePriceCad) : null,
    stock: product.inventory?.stock ?? 0,
    lowStockLevel: product.inventory?.lowStockLevel ?? 5,
    isActive: product.isActive,
  };

  return (
    <section className="section-wrap py-14">
      <Reveal>
        <p className="text-sm text-zinc-600">
          <Link href="/admin/products" className="text-[var(--sg-green)] underline underline-offset-4">
            ← 商品列表
          </Link>
        </p>
      </Reveal>
      <Reveal delay={0.05}>
        <h1 className="mt-4 text-3xl font-semibold text-[var(--sg-green)]">编辑 · {product.name}</h1>
      </Reveal>
      <Reveal delay={0.08}>
        <p className="mt-2 font-mono text-sm text-zinc-500">id: {product.id}</p>
      </Reveal>
      <div className="mt-8">
        <ProductForm mode="edit" productId={product.id} initial={initial} />
      </div>
    </section>
  );
}
