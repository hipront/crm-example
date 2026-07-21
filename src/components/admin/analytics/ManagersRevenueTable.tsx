"use client";

import { useMemo, useState } from "react";
import type { LeadSummary, ManagerRevenue } from "@/lib/analytics";

type SortKey = "revenue" | "dealCount" | "avgTicket";

function rub(n: number) {
  return n.toLocaleString("ru-RU") + " ₽";
}

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: "revenue", label: "Сумма" },
  { key: "dealCount", label: "Сделок" },
  { key: "avgTicket", label: "Средний чек" },
];

export default function ManagersRevenueTable({
  managers,
  leads,
  forceExpandAll = false,
}: {
  managers: ManagerRevenue[];
  leads: LeadSummary[];
  forceExpandAll?: boolean;
}) {
  const [sortKey, setSortKey] = useState<SortKey>("revenue");
  const [sortDir, setSortDir] = useState<-1 | 1>(-1);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const sorted = useMemo(
    () => [...managers].sort((a, b) => (a[sortKey] - b[sortKey]) * sortDir),
    [managers, sortKey, sortDir],
  );

  const maxRevenue = Math.max(...managers.map((m) => m.revenue), 1);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === -1 ? 1 : -1));
    else {
      setSortKey(key);
      setSortDir(-1);
    }
  }

  if (managers.length === 0) {
    return <p className="text-sm text-white/40">Пока нет оплаченных/закрытых сделок</p>;
  }

  return (
    <div className="flex flex-col gap-0.5">
      <div className="hidden gap-3 border-b border-white/10 px-2.5 pb-2.5 text-[11px] font-semibold uppercase tracking-wide text-white/40 sm:grid sm:grid-cols-[1.4fr_1.6fr_1fr_.8fr_1fr]">
        <span>Менеджер</span>
        <span />
        {COLUMNS.map((col) => (
          <button
            key={col.key}
            type="button"
            onClick={() => toggleSort(col.key)}
            className={`text-right transition-colors hover:text-white/70 ${sortKey === col.key ? "text-white/85" : ""}`}
          >
            {col.label} {sortKey === col.key ? (sortDir === -1 ? "↓" : "↑") : ""}
          </button>
        ))}
      </div>

      {/* Сортировка по-прежнему доступна только в таблице (sm+) — на мобиле список уже отсортирован по выбранной колонке */}
      <div className="mb-1 flex flex-wrap items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-white/40 sm:hidden">
        Сортировка:
        {COLUMNS.map((col) => (
          <button
            key={col.key}
            type="button"
            onClick={() => toggleSort(col.key)}
            className={`rounded-full px-2 py-1 transition-colors ${
              sortKey === col.key ? "bg-white/10 text-white/85" : "hover:text-white/70"
            }`}
          >
            {col.label} {sortKey === col.key ? (sortDir === -1 ? "↓" : "↑") : ""}
          </button>
        ))}
      </div>

      {sorted.map((m) => {
        const key = m.managerId ?? "unassigned";
        const isOpen = forceExpandAll || expanded.has(key);
        const deals = leads.filter((l) => (l.managerId ?? "unassigned") === key && l.pipeline_status === "closed");
        const barWidth = Math.max((m.revenue / maxRevenue) * 100, m.revenue > 0 ? 3 : 0);

        function toggle() {
          setExpanded((prev) => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
          });
        }

        return (
          <div key={key}>
            {/* Десктоп: строка-таблица */}
            <button
              type="button"
              onClick={toggle}
              className="hidden w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-left transition-colors hover:bg-white/5 sm:grid sm:grid-cols-[1.4fr_1.6fr_1fr_.8fr_1fr]"
            >
              <span className="flex min-w-0 items-center gap-2">
                <span className={`shrink-0 text-white/40 transition-transform ${isOpen ? "rotate-90" : ""}`} aria-hidden>
                  ›
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-white">{m.managerName}</span>
              </span>
              <div className="relative h-2 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-fuchsia-400 transition-[width] duration-500"
                  style={{ width: `${barWidth}%` }}
                />
              </div>
              <span className="text-right text-sm font-semibold tabular-nums text-white">{rub(m.revenue)}</span>
              <span className="text-right text-sm tabular-nums text-white/70">{m.dealCount}</span>
              <span className="text-right text-sm tabular-nums text-white/70">{rub(m.avgTicket)}</span>
            </button>

            {/* Мобиле/планшет: карточка */}
            <button
              type="button"
              onClick={toggle}
              className="flex w-full flex-col gap-2 rounded-lg px-2.5 py-2.5 text-left transition-colors hover:bg-white/5 sm:hidden"
            >
              <span className="flex items-center gap-2">
                <span className={`shrink-0 text-white/40 transition-transform ${isOpen ? "rotate-90" : ""}`} aria-hidden>
                  ›
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-white">{m.managerName}</span>
                <span className="shrink-0 text-sm font-semibold tabular-nums text-white">{rub(m.revenue)}</span>
              </span>
              <div className="relative h-2 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-fuchsia-400 transition-[width] duration-500"
                  style={{ width: `${barWidth}%` }}
                />
              </div>
              <span className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-white/50">
                <span>{m.dealCount} сделок</span>
                <span>Средний чек: {rub(m.avgTicket)}</span>
              </span>
            </button>

            {isOpen && (
              <div className="ml-7 mb-1.5 mt-0.5 space-y-0.5 border-l border-white/10 pl-4">
                {deals.map((d) => (
                  <div
                    key={d.id}
                    className="flex justify-between gap-3 rounded-lg px-2.5 py-1.5 text-xs transition-colors hover:bg-white/[0.04]"
                  >
                    <span className="min-w-0 truncate text-white/60">{d.name}</span>
                    <span className="shrink-0 font-medium text-white/85 tabular-nums">{rub(d.price)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
