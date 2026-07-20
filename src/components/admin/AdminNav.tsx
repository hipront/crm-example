"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  LayoutGrid,
  BarChart3,
  Palette,
  Users,
} from "lucide-react";

type Role = "manager" | "rop" | "admin" | "viewer";
type Tab = { href: string; label: string; roles?: Role[]; Icon: typeof LayoutGrid };

const TABS: Tab[] = [
  { href: "/admin/leads", label: "Лиды", Icon: ClipboardList },
  { href: "/admin/kanban", label: "CRM", Icon: LayoutGrid },
  { href: "/admin/analytics", label: "Аналитика", roles: ["rop", "admin", "viewer"], Icon: BarChart3 },
  { href: "/admin/catalog", label: "Каталог", roles: ["admin", "viewer"], Icon: Palette },
  { href: "/admin/users", label: "Пользователи", roles: ["admin", "viewer"], Icon: Users },
];

function useVisibleTabs(role: string | null) {
  return TABS.filter((tab) => !tab.roles || tab.roles.includes(role as Role));
}

export default function AdminNav({ role }: { role: string | null }) {
  const pathname = usePathname();
  const tabs = useVisibleTabs(role);

  return (
    <nav className="flex flex-col gap-1">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-white/10 text-white"
                : "text-white/50 hover:bg-white/5 hover:text-white/80"
            }`}
          >
            <tab.Icon className="h-4 w-4 shrink-0" />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminMobileNav({ role }: { role: string | null }) {
  const pathname = usePathname();
  const tabs = useVisibleTabs(role);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-white/10 bg-black/95 px-2 py-2 backdrop-blur md:hidden">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-lg px-1 py-1.5 text-[10px] font-medium transition-colors ${
              isActive ? "text-brand-fuchsia" : "text-white/50"
            }`}
          >
            <tab.Icon className="h-5 w-5" />
            <span className="max-w-full truncate">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
