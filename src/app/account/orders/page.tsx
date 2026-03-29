import { auth } from "@/auth";
import { Reveal } from "@/components/motion/reveal";
import { StaggerSurfaceItem } from "@/components/motion/stagger-surface-item";
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
    <section className="section-surface py-14">
      <div className="section-wrap">
        <Reveal>
          <h1 className="text-3xl font-semibold text-[var(--sg-green)]">My orders</h1>
        </Reveal>
        <div className="mt-6 space-y-4">
          {orders.map((order, index) => (
            <StaggerSurfaceItem
              key={order.id}
              index={index}
              className="card-elevated rounded-2xl p-5"
            >
              <p className="text-sm font-medium text-zinc-800">
                Order {order.id.slice(0, 8)}… · {order.status}
              </p>
              <p className="mt-1 text-xs text-zinc-500">{order.createdAt.toLocaleString("en-CA")}</p>
              <ul className="mt-3 space-y-1 text-sm text-zinc-600">
                {order.items.map((item) => (
                  <li key={item.id}>
                    {item.product.name} × {item.quantity} · CAD {cad(item.unitPriceCad).toFixed(2)}
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-sm font-medium">Total CAD {cad(order.totalCad).toFixed(2)}</p>
            </StaggerSurfaceItem>
          ))}
        </div>
        {orders.length === 0 ? (
          <Reveal>
            <p className="mt-6 text-sm text-zinc-600">No orders yet.</p>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
