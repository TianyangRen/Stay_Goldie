import type { Metadata } from "next";
import { LegalDoc } from "@/components/legal/legal-doc";

export const metadata: Metadata = {
  title: "服务条款 | Stay Goldie",
  description: "Stay Goldie 服务条款（占位摘要，正式运营前请由法律顾问定稿）。",
};

export default function TermsPage() {
  return (
    <LegalDoc
      badge="占位页面 · Path B"
      title="服务条款"
      intro="本页为摘要占位。在开启真实付款、寄养或电商履约前，请补充完整条款，至少覆盖：服务描述、价格与订金/退款规则、取消与改期、责任限制、适用法律与争议解决等。"
      bullets={[
        "通过本网站预约、下单即表示您同意届时公示的完整版条款（请替换本占位内容）。",
        "商品价格、库存与预约档期以系统展示与确认为准。",
        "有疑问请通过页脚联系方式联系；请将邮箱与电话配置为环境变量（见 .env.example）。",
      ]}
    />
  );
}
