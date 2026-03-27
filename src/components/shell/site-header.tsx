"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Pressable } from "@/components/motion/pressable";

const links = [
  { href: "/", label: "首页" },
  { href: "/services", label: "服务" },
  { href: "/booking", label: "预约" },
  { href: "/shop", label: "商城" },
  { href: "/pet-feed", label: "宠物Ins" },
  { href: "/blog", label: "博客" },
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
      className={`sticky top-0 z-50 border-b border-[var(--sg-border-subtle)] bg-[var(--sg-surface)]/85 backdrop-blur transition-shadow duration-300 ${
        scrolled ? "shadow-[var(--sg-shadow-soft)]" : ""
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
        <Link href="/" className="text-sm font-semibold tracking-wide text-emerald-900">
          Stay Goldie
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm transition ${active ? "text-emerald-900" : "text-zinc-600 hover:text-zinc-900"}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          {session?.user ? (
            <>
              <span className="hidden text-xs text-zinc-500 sm:inline">{session.user.email}</span>
              <Pressable className="inline-block">
                <Link
                  href={session.user.role === "ADMIN" ? "/admin" : "/account/pets"}
                  className="rounded-full border border-[var(--sg-border-subtle)] px-3 py-2 text-xs font-medium text-zinc-800"
                >
                  {session.user.role === "ADMIN" ? "后台" : "账户"}
                </Link>
              </Pressable>
              <Pressable className="inline-block">
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="rounded-full bg-emerald-900 px-4 py-2 text-xs font-medium text-white"
                >
                  退出
                </button>
              </Pressable>
            </>
          ) : (
            <>
              <Pressable className="inline-block">
                <Link
                  href="/register"
                  className="rounded-full border border-emerald-900/30 px-4 py-2 text-xs font-medium text-emerald-900"
                >
                  注册
                </Link>
              </Pressable>
              <Pressable className="inline-block">
                <Link
                  href="/login"
                  className="rounded-full bg-emerald-900 px-4 py-2 text-xs font-medium text-white"
                >
                  {status === "loading" ? "…" : "登录"}
                </Link>
              </Pressable>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
