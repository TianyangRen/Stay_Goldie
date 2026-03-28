import type { Metadata } from "next";
import { Geist_Mono, Nunito_Sans, Varela_Round } from "next/font/google";
import "./globals.css";
import { SiteFooter } from "@/components/shell/site-footer";
import { SiteHeader } from "@/components/shell/site-header";
import { AuthSessionProvider } from "@/components/providers/session-provider";

/** Body / UI copy — Soft Rounded pairing (UI UX Pro Max). */
const nunitoSans = Nunito_Sans({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

/** Display headings — rounded, friendly. */
const varelaRound = Varela_Round({
  variable: "--font-varela",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Stay Goldie | Boutique Dog Boarding",
  description: "高端温暖家庭式狗狗寄养，包含预约、商城与宠物动态。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${nunitoSans.variable} ${varelaRound.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--sg-bg)] text-[var(--sg-text)] font-sans">
        <AuthSessionProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </AuthSessionProvider>
      </body>
    </html>
  );
}
