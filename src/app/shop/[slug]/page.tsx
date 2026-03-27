import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { cad } from "@/lib/cad";
import { CheckoutButton } from "@/components/shop/checkout-button";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { inventory: true },
  });

  if (!product) {
    notFound();
  }

  const price = cad(product.salePriceCad ?? product.basePriceCad);
  const stock = product.inventory?.stock ?? 0;

  return (
    <section className="section-wrap py-14">
      <div className="grid gap-6 rounded-3xl border border-black/10 bg-white p-6 md:grid-cols-2">
        <div className="relative h-72 overflow-hidden rounded-2xl">
          {product.imageUrl ? (
            <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center bg-zinc-100 text-sm text-zinc-500">
              暂无图片
            </div>
          )}
        </div>
        <div>
          <h1 className="text-2xl font-semibold">{product.name}</h1>
          <p className="mt-3 text-sm leading-7 text-zinc-600">{product.description}</p>
          <p className="mt-3 text-sm font-medium">
            CAD {price.toFixed(2)} · 库存 {stock}
          </p>
          <CheckoutButton productId={product.id} />
        </div>
      </div>
    </section>
  );
}
