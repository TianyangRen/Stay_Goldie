import { ShopProductCard } from "@/components/shop/shop-product-card";
import { Reveal } from "@/components/motion/reveal";
import { prisma } from "@/lib/prisma";
import { cad } from "@/lib/cad";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: { inventory: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <section className="section-surface py-14">
      <div className="section-wrap">
        <Reveal>
          <h1 className="text-3xl font-semibold text-[var(--sg-green)]">宠物用品商城</h1>
        </Reveal>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product, index) => {
            const price = cad(product.salePriceCad ?? product.basePriceCad);
            const stock = product.inventory?.stock ?? 0;
            return (
              <ShopProductCard
                key={product.id}
                index={index}
                slug={product.slug}
                name={product.name}
                description={product.description}
                priceLabel={`CAD ${price.toFixed(2)}`}
                stock={stock}
                imageUrl={product.imageUrl}
              />
            );
          })}
        </div>
        {products.length === 0 ? (
          <p className="mt-8 text-sm text-zinc-600">
            暂无商品。请配置数据库并运行{" "}
            <code className="rounded bg-[var(--sg-surface-alt)] px-1">npm run db:push:direct</code> 与{" "}
            <code className="rounded bg-[var(--sg-surface-alt)] px-1">npm run db:seed</code>。
          </p>
        ) : null}
      </div>
    </section>
  );
}
