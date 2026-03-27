import Image from "next/image";
import Link from "next/link";
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
    <section className="section-wrap py-14">
      <h1 className="text-3xl font-semibold text-[var(--sg-green)]">宠物用品商城</h1>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => {
          const price = cad(product.salePriceCad ?? product.basePriceCad);
          const stock = product.inventory?.stock ?? 0;
          return (
            <article
              key={product.id}
              className="overflow-hidden rounded-3xl border border-black/10 bg-white"
            >
              <div className="relative h-52">
                {product.imageUrl ? (
                  <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center bg-zinc-100 text-sm text-zinc-500">
                    暂无图片
                  </div>
                )}
              </div>
              <div className="p-5">
                <h2 className="font-semibold">{product.name}</h2>
                <p className="mt-2 text-sm text-zinc-600">{product.description}</p>
                <p className="mt-3 text-sm">
                  CAD {price.toFixed(2)} · 库存 {stock}
                </p>
                <Link
                  href={`/shop/${product.slug}`}
                  className="mt-4 inline-block rounded-full bg-zinc-900 px-4 py-2 text-xs text-white"
                >
                  查看商品
                </Link>
              </div>
            </article>
          );
        })}
      </div>
      {products.length === 0 ? (
        <p className="mt-8 text-sm text-zinc-600">
          暂无商品。请配置数据库并运行 <code className="rounded bg-zinc-100 px-1">npx prisma migrate dev</code>{" "}
          与 <code className="rounded bg-zinc-100 px-1">npm run db:seed</code>。
        </p>
      ) : null}
    </section>
  );
}
