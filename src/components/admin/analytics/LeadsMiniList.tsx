"use client";

import { useState } from "react";
import type { LeadSummary } from "@/lib/analytics";

const PAGE_SIZE = 15;

function rub(n: number) {
  return n.toLocaleString("ru-RU") + " ₽";
}

export default function LeadsMiniList({ leads }: { leads: LeadSummary[] }) {
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  if (leads.length === 0) {
    return <p className="px-2 py-2 text-xs text-white/40">Пусто</p>;
  }

  const filtered = leads.filter((l) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return l.name.toLowerCase().includes(q) || l.managerName.toLowerCase().includes(q);
  });
  const visible = filtered.slice(0, visibleCount);
  const hasMore = filtered.length > visibleCount;
  const showSearch = leads.length > PAGE_SIZE;

  return (
    <div className="rounded-lg border border-white/10 bg-black/20">
      {showSearch && (
        <input
          type="search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setVisibleCount(PAGE_SIZE);
          }}
          placeholder="Поиск по имени/менеджеру…"
          className="w-full border-b border-white/10 bg-transparent px-3 py-2 text-sm text-white outline-none"
        />
      )}
      <div className="divide-y divide-white/10">
        {visible.map((l) => (
          <div key={l.id} className="flex items-center gap-3 px-3 py-2 text-sm">
            <span className="flex-1 truncate">{l.name}</span>
            <span className="shrink-0 text-white/50">{l.managerName}</span>
            {l.price > 0 && <span className="shrink-0 tabular-nums text-white/60">{rub(l.price)}</span>}
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="px-3 py-2 text-xs text-white/40">Ничего не найдено по «{search}»</p>
        )}
      </div>
      {hasMore && (
        <button
          type="button"
          onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
          className="w-full border-t border-white/10 py-1.5 text-xs text-white/60 transition-colors hover:text-white"
        >
          Показать ещё ({filtered.length - visibleCount})
        </button>
      )}
    </div>
  );
}
