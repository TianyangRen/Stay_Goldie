import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { cad } from "@/lib/cad";

export const dynamic = "force-dynamic";

export default async function AccountOrdersPage() {
  const session = await auth();
  const ownerId = session?.user?.id;
  if (!ownerId) {
    return null;
  }

  const orders = await prisma.order.findMany({
    where: { ownerId },
    include: {
      items: { include: { product: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <section className="section-wrap py-14">
      <h1 className="text-3xl font-semibold text-[var(--sg-green)]">我的订单</h1>
      <div className="mt-6 space-y-4">
        {orders.map((order) => (
          <article key={order.id} className="rounded-2xl border border-black/10 bg-white p-5">
            <p className="text-sm font-medium text-zinc-800">
              订单 {order.id.slice(0, 8)}… · {order.status}
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              {order.createdAt.toLocaleString("zh-CN")}
            </p>
            <ul className="mt-3 space-y-1 text-sm text-zinc-600">
              {order.items.map((item) => (
                <li key={item.id}>
                  {item.product.name} × {item.quantity} · CAD{" "}
                  {cad(item.unitPriceCad).toFixed(2)}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-sm font-medium">
              合计 CAD {cad(order.totalCad).toFixed(2)}
            </p>
          </article>
        ))}
      </div>
      {orders.length === 0 ? (
        <p className="mt-6 text-sm text-zinc-600">暂无订单。</p>
      ) : null}
    </section>
  );
}
