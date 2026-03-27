"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

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

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/80 backdrop-blur">
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
              <span className="hidden text-xs text-zinc-500 sm:inline">
                {session.user.email}
              </span>
              <Link
                href="/account/pets"
                className="rounded-full border border-black/10 px-3 py-2 text-xs font-medium text-zinc-800"
              >
                账户
              </Link>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-full bg-emerald-900 px-4 py-2 text-xs font-medium text-white"
              >
                退出
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-emerald-900 px-4 py-2 text-xs font-medium text-white"
            >
              {status === "loading" ? "…" : "登录"}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
