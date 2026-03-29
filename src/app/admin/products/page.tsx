import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Pressable } from "@/components/motion/pressable";
import { Reveal } from "@/components/motion/reveal";
import { cad } from "@/lib/cad";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: { inventory: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <section className="section-wrap py-14">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <Reveal>
          <div>
            <h1 className="text-3xl font-semibold text-[var(--sg-green)]">Admin · Products & inventory</h1>
            <p className="mt-2 text-sm text-zinc-600">
              Only administrators can edit. Inactive products stay hidden in the storefront.
            </p>
          </div>
        </Reveal>
        <Reveal delay={0.06}>
          <Pressable className="inline-block shrink-0">
            <Link
              href="/admin/products/new"
              className="inline-flex justify-center rounded-full bg-[var(--sg-cta)] px-5 py-2.5 text-sm font-medium text-white"
            >
              New product
            </Link>
          </Pressable>
        </Reveal>
      </div>
      <Reveal delay={0.08}>
        <div className="mt-6 overflow-hidden rounded-3xl border border-[var(--sg-border-subtle)] bg-[var(--sg-surface)]">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--sg-surface-alt)]">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">slug</th>
                <th className="px-4 py-3">Price (CAD)</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-t border-[var(--sg-border-subtle)]">
                  <td className="px-4 py-3 font-medium">{product.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-600">{product.slug}</td>
                  <td className="px-4 py-3">
                    {cad(product.salePriceCad ?? product.basePriceCad).toFixed(2)}
                    {product.salePriceCad ? (
                      <span className="ml-1 text-xs text-zinc-500">
                        (base {cad(product.basePriceCad).toFixed(2)})
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">{product.inventory?.stock ?? 0}</td>
                  <td className="px-4 py-3">
                    {product.isActive ? (
                      <span className="text-green-700">Active</span>
                    ) : (
                      <span className="text-zinc-500">Inactive</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Pressable className="inline-block">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="font-medium text-[var(--sg-green)] underline underline-offset-4"
                      >
                        Edit
                      </Link>
                    </Pressable>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Reveal>
      {products.length === 0 ? (
        <p className="mt-6 text-sm text-zinc-600">No products yet—use “New product” to add one.</p>
      ) : null}
    </section>
  );
}
