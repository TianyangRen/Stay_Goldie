import type { Metadata } from "next";
import { LegalDoc } from "@/components/legal/legal-doc";

export const metadata: Metadata = {
  title: "隐私政策 | Stay Goldie",
  description: "Stay Goldie 隐私政策（占位摘要，正式运营前请由法律顾问定稿）。",
};

export default function PrivacyPage() {
  return (
    <LegalDoc
      badge="占位页面 · Path B"
      title="隐私政策"
      intro="本页为上线前摘要占位，不构成完整法律文件。正式对外收款与服务前，请结合业务实际（采集的个人信息类型、存储位置、第三方服务商如支付/邮件/云存储）由律师或合规顾问定稿，并替换本页全文。"
      bullets={[
        "我们可能处理您提供的联系信息与订单、预约相关信息，用于履约与客户支持。",
        "支付由 Stripe 等第三方处理；请同时查阅其隐私说明。",
        "您可通过页脚的联系方式向我们咨询隐私相关请求（具体权利以适用法律为准）。",
      ]}
    />
  );
}
