"use client";

import type { StaleLead } from "@/lib/analytics";

export default function StaleLeadsPanel({
  staleLeads,
  onSelect,
}: {
  staleLeads: StaleLead[];
  onSelect: (status: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-red-500/25 bg-red-500/5 p-5">
      <div className="mb-1 flex items-center gap-2">
        <span className="text-sm">⚠</span>
        <h3 className="text-sm font-semibold text-red-300">Зависшие лиды</h3>
      </div>
      <p className="mb-3.5 text-xs text-red-300/70">Без движения 3+ дня</p>

      <div className="flex max-h-[220px] flex-col gap-1.5 overflow-y-auto pr-1">
        {staleLeads.map((l) => (
          <button
            key={l.id}
            type="button"
            onClick={() => onSelect(l.status)}
            className="flex w-full items-center gap-2 rounded-lg bg-white/[0.03] px-2.5 py-2 text-left transition-colors hover:bg-white/[0.06]"
          >
            <span className="min-w-0 flex-1 truncate text-sm text-white">{l.name}</span>
            <span
              className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                l.daysSinceUpdate >= 7 ? "bg-red-500/20 text-red-300" : "bg-amber-500/20 text-amber-300"
              }`}
            >
              {l.daysSinceUpdate} дн.
            </span>
          </button>
        ))}
        {staleLeads.length === 0 && <p className="text-sm text-white/50">Нет зависших лидов</p>}
      </div>
    </div>
  );
}
