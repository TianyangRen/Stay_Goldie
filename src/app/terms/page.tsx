import type { Metadata } from "next";
import { LegalDoc } from "@/components/legal/legal-doc";

export const metadata: Metadata = {
  title: "Terms | Stay Goldie",
  description: "Summary placeholder for Stay Goldie terms—replace with counsel-reviewed copy before launch.",
};

export default function TermsPage() {
  return (
    <LegalDoc
      badge="Placeholder · Path B"
      title="Terms of service"
      intro="This is a plain-language placeholder. Before you take real payments or ship boarding or retail programs, expand it to cover services, pricing, deposits and refunds, cancellations, liability limits, governing law, and dispute resolution."
      bullets={[
        "Booking or purchasing through this site means you agree to the full terms once they are published (replace this placeholder).",
        "Prices, inventory, and boarding availability follow the records shown at checkout and confirmation.",
        "Questions? Use the footer contact details. Configure email and phone via environment variables (see .env.example).",
      ]}
    />
  );
}
