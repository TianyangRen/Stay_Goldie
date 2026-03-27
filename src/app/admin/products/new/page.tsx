import Link from "next/link";
import { ProductForm } from "@/components/admin/product-form";
import { Reveal } from "@/components/motion/reveal";

export default function AdminNewProductPage() {
  return (
    <section className="section-wrap py-14">
      <Reveal>
        <p className="text-sm text-zinc-600">
          <Link href="/admin/products" className="text-emerald-900 underline underline-offset-4">
            ← 商品列表
          </Link>
        </p>
      </Reveal>
      <Reveal delay={0.05}>
        <h1 className="mt-4 text-3xl font-semibold text-[var(--sg-green)]">新建商品</h1>
      </Reveal>
      <Reveal delay={0.08}>
        <p className="mt-2 text-sm text-zinc-600">
          slug 创建后尽量不要改，以免外链失效；促销价留空则结账按基础价。
        </p>
      </Reveal>
      <div className="mt-8">
        <ProductForm mode="create" />
      </div>
    </section>
  );
}
