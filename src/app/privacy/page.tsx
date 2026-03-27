import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "隐私政策 | Stay Goldie",
  description: "Stay Goldie 隐私政策（占位摘要，正式运营前请由法律顾问定稿）。",
};

export default function PrivacyPage() {
  return (
    <section className="section-wrap py-14">
      <div className="mx-auto max-w-2xl">
        <p className="text-xs font-medium uppercase tracking-wide text-amber-800">占位页面 · Path B</p>
        <h1 className="mt-2 text-3xl font-semibold text-zinc-900">隐私政策</h1>
        <p className="mt-6 text-sm leading-7 text-zinc-600">
          本页为上线前<strong>摘要占位</strong>，不构成完整法律文件。正式对外收款与服务前，请结合业务实际（采集的个人信息类型、存储位置、第三方服务商如支付/邮件/云存储）由律师或合规顾问定稿，并替换本页全文。
        </p>
        <ul className="mt-6 list-disc space-y-2 pl-5 text-sm leading-7 text-zinc-600">
          <li>我们可能处理您提供的联系信息与订单、预约相关信息，用于履约与客户支持。</li>
          <li>支付由 Stripe 等第三方处理；请同时查阅其隐私说明。</li>
          <li>您可通过页脚的联系方式向我们咨询隐私相关请求（具体权利以适用法律为准）。</li>
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
