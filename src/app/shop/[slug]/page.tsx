import { notFound } from "next/navigation";
import { ProductDetailView } from "@/components/shop/product-detail-view";
import { prisma } from "@/lib/prisma";
import { cad } from "@/lib/cad";

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

  if (!product || !product.isActive) {
    notFound();
  }

  const price = cad(product.salePriceCad ?? product.basePriceCad);
  const stock = product.inventory?.stock ?? 0;

  return (
    <ProductDetailView
      name={product.name}
      description={product.description}
      priceLabel={`CAD ${price.toFixed(2)}`}
      stock={stock}
      imageUrl={product.imageUrl}
      productId={product.id}
    />
  );
}
