import { prisma } from "@/lib/prisma";
import { cad } from "@/lib/cad";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: { inventory: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <section className="section-wrap py-14">
      <h1 className="text-3xl font-semibold text-[var(--sg-green)]">管理端：商品与库存</h1>
      <div className="mt-6 overflow-hidden rounded-3xl border border-black/10 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-4 py-3">商品</th>
              <th className="px-4 py-3">价格 (CAD)</th>
              <th className="px-4 py-3">库存</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-t border-black/5">
                <td className="px-4 py-3">{product.name}</td>
                <td className="px-4 py-3">
                  {cad(product.salePriceCad ?? product.basePriceCad).toFixed(2)}
                </td>
                <td className="px-4 py-3">{product.inventory?.stock ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {products.length === 0 ? (
        <p className="mt-6 text-sm text-zinc-600">暂无商品数据。</p>
      ) : null}
    </section>
  );
}
