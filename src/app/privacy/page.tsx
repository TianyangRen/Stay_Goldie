import type { Metadata } from "next";
import { LegalDoc } from "@/components/legal/legal-doc";

export const metadata: Metadata = {
  title: "Privacy | Stay Goldie",
  description: "Summary placeholder for Stay Goldie privacy practices—replace with counsel-reviewed copy before launch.",
};

export default function PrivacyPage() {
  return (
    <LegalDoc
      badge="Placeholder · Path B"
      title="Privacy policy"
      intro="This page is a pre-launch summary and not a complete legal document. Before accepting payments or providing boarding or retail services, work with counsel to cover what you collect, where it is stored, and subprocessors such as payments, email, and object storage—then replace this page in full."
      bullets={[
        "We may process contact details plus booking and order information to fulfill services and support pet parents.",
        "Payments are handled by Stripe and other vendors; review their privacy notices as well.",
        "Reach us through the contact details in the footer for privacy requests (subject to applicable law).",
      ]}
    />
  );
}
