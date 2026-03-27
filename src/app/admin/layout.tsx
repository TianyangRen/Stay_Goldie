import type { ReactNode } from "react";
import { AdminNav } from "@/components/admin/admin-nav";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[60vh] bg-[var(--sg-surface-alt)]">
      <AdminNav />
      {children}
    </div>
  );
}
