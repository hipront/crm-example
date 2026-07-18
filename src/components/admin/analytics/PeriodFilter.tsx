"use client";

import { useEffect, useRef, useState } from "react";

export type Period = "week" | "month" | "all";
export type CustomRange = { from: string; to: string } | null;

const PERIODS: { id: Period; label: string }[] = [
  { id: "week", label: "Неделя" },
  { id: "month", label: "Месяц" },
  { id: "all", label: "Всё время" },
];

export default function PeriodFilter({
  period,
  customRange,
  onPeriodChange,
  onCustomRangeChange,
}: {
  period: Period | null;
  customRange: CustomRange;
  onPeriodChange: (p: Period) => void;
  onCustomRangeChange: (range: CustomRange) => void;
}) {
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState(customRange?.from ?? "");
  const [to, setTo] = useState(customRange?.to ?? "");
  const rootRef = useRef<HTMLDivElement>(null);
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (open && rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const customActive = period === null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {PERIODS.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => onPeriodChange(p.id)}
          className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
            period === p.id
              ? "border-white/25 bg-white/10 text-white"
              : "border-white/12 bg-transparent text-white/50 hover:border-white/20 hover:text-white/80"
          }`}
        >
          {p.label}
        </button>
      ))}
      <div className="relative" ref={rootRef}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
            customActive
              ? "border-white/25 bg-white/10 text-white"
              : "border-white/12 bg-transparent text-white/50 hover:border-white/20 hover:text-white/80"
          }`}
        >
          📅 {customActive && customRange ? `${customRange.from} — ${customRange.to}` : "Диапазон"}
        </button>
        {open && (
          <div className="absolute right-0 top-[calc(100%+8px)] z-20 w-60 rounded-2xl border border-white/10 bg-[#17121f] p-4 shadow-2xl">
            <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wide text-white/40">
              Свой диапазон
            </p>
            <label className="mb-2.5 flex flex-col gap-1 text-[11.5px] text-white/50">
              С
              <input
                type="date"
                value={from}
                max={today}
                onChange={(e) => setFrom(e.target.value)}
                className="rounded-lg border border-white/15 bg-black/30 px-2.5 py-1.5 text-[12.5px] text-white outline-none [color-scheme:dark]"
              />
            </label>
            <label className="mb-3.5 flex flex-col gap-1 text-[11.5px] text-white/50">
              По
              <input
                type="date"
                value={to}
                max={today}
                onChange={(e) => setTo(e.target.value)}
                className="rounded-lg border border-white/15 bg-black/30 px-2.5 py-1.5 text-[12.5px] text-white outline-none [color-scheme:dark]"
              />
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  if (from && to) {
                    onCustomRangeChange({ from, to });
                    setOpen(false);
                  }
                }}
                className="flex-1 rounded-full bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-400 py-1.5 text-[12.5px] font-semibold text-white"
              >
                Применить
              </button>
              <button
                type="button"
                onClick={() => {
                  setFrom("");
                  setTo("");
                  onCustomRangeChange(null);
                  onPeriodChange("month");
                  setOpen(false);
                }}
                className="rounded-full border border-white/15 px-3.5 py-1.5 text-[12.5px] text-white/60 transition-colors hover:text-white"
              >
                Сброс
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
