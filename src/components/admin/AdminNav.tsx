"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Role = "manager" | "rop" | "admin" | "viewer";
type Tab = { href: string; label: string; roles?: Role[] };

const TABS: Tab[] = [
  { href: "/admin/leads", label: "Канбан" },
  { href: "/admin/analytics", label: "Аналитика", roles: ["rop", "admin", "viewer"] },
  { href: "/admin/catalog", label: "Каталог", roles: ["admin"] },
  { href: "/admin/users", label: "Пользователи", roles: ["admin"] },
];

export default function AdminNav({ role }: { role: string | null }) {
  const pathname = usePathname();

  const tabs = TABS.filter((tab) => !tab.roles || tab.roles.includes(role as Role));

  return (
    <nav className="mt-8 flex gap-1 border-b border-white/10">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              isActive
                ? "border-fuchsia-400 text-white"
                : "border-transparent text-white/50 hover:text-white/80"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
