"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Pressable } from "@/components/motion/pressable";

const links = [
  { href: "/admin/bookings", label: "预约与档期" },
  { href: "/admin/products", label: "商品与库存" },
  { href: "/admin/pet-posts", label: "宠物动态" },
  { href: "/admin/blog", label: "博客" },
  { href: "/admin/forms", label: "问卷与资料" },
] as const;

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav
      className="border-b border-[var(--sg-border-subtle)] bg-[var(--sg-surface)]/90 backdrop-blur"
      aria-label="管理后台导航"
    >
      <div className="section-wrap py-3">
        <div className="flex flex-wrap gap-2 md:gap-1">
          {links.map(({ href, label }) => {
            const active =
              href === "/admin/products"
                ? pathname.startsWith("/admin/products")
                : pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Pressable key={href} className="inline-block">
                <Link
                  href={href}
                  className={`block rounded-full px-3 py-1.5 text-xs font-medium transition md:text-sm ${
                    active
                      ? "bg-[var(--sg-green)] text-white"
                      : "bg-[var(--sg-surface-alt)] text-zinc-700 hover:bg-[var(--sg-surface-elevated)]"
                  }`}
                >
                  {label}
                </Link>
              </Pressable>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
