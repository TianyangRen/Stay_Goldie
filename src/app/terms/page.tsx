import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "服务条款 | Stay Goldie",
  description: "Stay Goldie 服务条款（占位摘要，正式运营前请由法律顾问定稿）。",
};

export default function TermsPage() {
  return (
    <section className="section-wrap py-14">
      <div className="mx-auto max-w-2xl">
        <p className="text-xs font-medium uppercase tracking-wide text-amber-800">占位页面 · Path B</p>
        <h1 className="mt-2 text-3xl font-semibold text-zinc-900">服务条款</h1>
        <p className="mt-6 text-sm leading-7 text-zinc-600">
          本页为<strong>摘要占位</strong>。在开启真实付款、寄养或电商履约前，请补充完整条款，至少覆盖：服务描述、价格与订金/退款规则、取消与改期、责任限制、适用法律与争议解决等。
        </p>
        <ul className="mt-6 list-disc space-y-2 pl-5 text-sm leading-7 text-zinc-600">
          <li>通过本网站预约、下单即表示您同意届时公示的完整版条款（请替换本占位内容）。</li>
          <li>商品价格、库存与预约档期以系统展示与确认为准。</li>
          <li>有疑问请通过页脚联系方式联系；请将邮箱与电话配置为环境变量（见 .env.example）。</li>
        </ul>
        <p className="mt-8 text-sm">
          <Link href="/" className="text-emerald-900 underline underline-offset-4">
            返回首页
          </Link>
        </p>
      </div>
    </section>
  );
}
