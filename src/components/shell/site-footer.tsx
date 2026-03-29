import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";

const defaultEmail = "hello@staygoldie.app";

export function SiteFooter() {
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? defaultEmail;
  const phone = process.env.NEXT_PUBLIC_CONTACT_PHONE?.trim();
  const label = process.env.NEXT_PUBLIC_BUSINESS_NAME ?? "Stay Goldie";

  return (
    <Reveal y={12} amount={0.05}>
      <footer className="mt-auto border-t border-[var(--sg-border-subtle)] bg-[var(--sg-surface)]/75">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 text-sm text-zinc-600 md:flex-row md:flex-wrap md:items-center md:justify-between md:px-6">
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/privacy" className="underline-offset-4 hover:text-zinc-900 hover:underline">
              Privacy
            </Link>
            <Link href="/terms" className="underline-offset-4 hover:text-zinc-900 hover:underline">
              Terms
            </Link>
          </div>
          <div className="flex flex-col gap-1 md:items-end md:text-right">
            <span className="font-medium text-zinc-800">{label}</span>
            <a href={`mailto:${email}`} className="underline-offset-4 hover:text-zinc-900 hover:underline">
              {email}
            </a>
            {phone ? <span>{phone}</span> : null}
          </div>
        </div>
      </footer>
    </Reveal>
  );
}
