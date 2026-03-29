"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Pressable } from "@/components/motion/pressable";

const links = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/booking", label: "Book" },
  { href: "/shop", label: "Shop" },
  { href: "/pet-feed", label: "Pet feed" },
  { href: "/blog", label: "Updates" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b border-[var(--sg-border-subtle)] bg-[var(--sg-surface)]/90 backdrop-blur transition-shadow duration-300 ${
        scrolled ? "shadow-[var(--sg-shadow-soft)]" : ""
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 md:gap-4 md:px-6">
        <Link
          href="/"
          className="focus-ring-clay shrink-0 rounded-md text-sm font-semibold tracking-wide text-[var(--sg-green)]"
        >
          Stay Goldie
        </Link>
        <nav className="hidden items-center gap-6 md:flex" aria-label="Primary">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`focus-ring-clay rounded-md text-sm transition-clay ${
                  active ? "font-medium text-[var(--sg-green)]" : "text-zinc-600 hover:text-[var(--sg-text)]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex flex-1 items-center justify-end gap-2 sm:gap-3">
          <Pressable className="inline-block md:hidden">
            <Link
              href="/booking"
              className="focus-ring-clay inline-flex cursor-pointer rounded-full bg-[var(--sg-cta)] px-3 py-1.5 text-xs font-semibold text-white transition-clay hover:brightness-105"
            >
              Book
            </Link>
          </Pressable>
          <Pressable className="hidden md:inline-block">
            <Link
              href="/booking"
              className="focus-ring-clay inline-flex cursor-pointer rounded-full bg-[var(--sg-cta)] px-4 py-2 text-xs font-semibold text-white shadow-sm transition-clay hover:brightness-105 hover:shadow-md"
            >
              Book now
            </Link>
          </Pressable>
          {session?.user ? (
            <>
              <span className="hidden max-w-[140px] truncate text-xs text-zinc-500 lg:inline">
                {session.user.email}
              </span>
              <Pressable className="inline-block">
                <Link
                  href="/account/profile"
                  className="focus-ring-clay rounded-full border border-[var(--sg-border-subtle)] bg-[var(--sg-surface-elevated)] px-3 py-2 text-xs font-medium text-zinc-700 transition-clay hover:border-[var(--sg-primary)]/25"
                >
                  Profile
                </Link>
              </Pressable>
              <Pressable className="inline-block">
                <Link
                  href={session.user.role === "ADMIN" ? "/admin" : "/account/pets"}
                  className="focus-ring-clay rounded-full border-[2px] border-[var(--sg-border-subtle)] bg-[var(--sg-surface-elevated)] px-3 py-2 text-xs font-medium text-zinc-800 transition-clay hover:border-[var(--sg-primary)]/25"
                >
                  {session.user.role === "ADMIN" ? "Admin" : "Account"}
                </Link>
              </Pressable>
              <Pressable className="inline-block">
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="focus-ring-clay rounded-full border border-[var(--sg-border-strong)] bg-[var(--sg-surface-elevated)] px-3 py-2 text-xs font-medium text-[var(--sg-text)] transition-clay hover:bg-[var(--sg-surface)] sm:px-4"
                >
                  Sign out
                </button>
              </Pressable>
            </>
          ) : (
            <>
              <Pressable className="inline-block">
                <Link
                  href="/register"
                  className="focus-ring-clay rounded-full border-[2px] border-[var(--sg-green)]/35 px-3 py-2 text-xs font-medium text-[var(--sg-green)] transition-clay hover:bg-white/80 sm:px-4"
                >
                  Register
                </Link>
              </Pressable>
              <Pressable className="inline-block">
                <Link
                  href="/login"
                  className="focus-ring-clay rounded-full bg-[var(--sg-cta)] px-3 py-2 text-xs font-semibold text-white transition-clay hover:brightness-105 sm:px-4"
                >
                  {status === "loading" ? "…" : "Log in"}
                </Link>
              </Pressable>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
