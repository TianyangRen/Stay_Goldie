import Link from "next/link";
import { ProductForm } from "@/components/admin/product-form";
import { Reveal } from "@/components/motion/reveal";

export default function AdminNewProductPage() {
  return (
    <section className="section-wrap py-14">
      <Reveal>
        <p className="text-sm text-zinc-600">
          <Link href="/admin/products" className="text-[var(--sg-green)] underline underline-offset-4">
            ← Products
          </Link>
        </p>
      </Reveal>
      <Reveal delay={0.05}>
        <h1 className="mt-4 text-3xl font-semibold text-[var(--sg-green)]">New product</h1>
      </Reveal>
      <Reveal delay={0.08}>
        <p className="mt-2 text-sm text-zinc-600">
          Avoid changing the slug after launch so links stay valid. Leave sale price empty to charge the base price.
        </p>
      </Reveal>
      <div className="mt-8">
        <ProductForm mode="create" />
      </div>
    </section>
  );
}
