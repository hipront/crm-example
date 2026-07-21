"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Calendar } from "lucide-react";

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
  const trackRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [pillStyle, setPillStyle] = useState<{ left: number; width: number } | null>(null);
  const today = new Date().toISOString().slice(0, 10);

  // Позицию плашки нельзя вычислить во время рендера — нужны реальные
  // размеры кнопок после layout, отсюда синхронный setState в эффекте.
  /* eslint-disable react-hooks/set-state-in-effect */
  useLayoutEffect(() => {
    if (!period) {
      setPillStyle(null);
      return;
    }
    const track = trackRef.current;
    const btn = btnRefs.current[period];
    if (!track || !btn) return;
    const trackRect = track.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    setPillStyle({ left: btnRect.left - trackRect.left, width: btnRect.width });
  }, [period]);
  /* eslint-enable react-hooks/set-state-in-effect */

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
    <div className="flex flex-wrap items-center gap-2">
      <div ref={trackRef} className="relative flex items-center gap-0.5 rounded-full border border-white/12 p-0.5">
        {pillStyle && (
          <div
            className="absolute top-0.5 bottom-0.5 rounded-full bg-gradient-to-r from-fuchsia-500 to-purple-500 transition-[left,width] duration-[250ms] ease-out"
            style={{ left: pillStyle.left, width: pillStyle.width }}
          />
        )}
        {PERIODS.map((p) => (
          <button
            key={p.id}
            ref={(el) => {
              btnRefs.current[p.id] = el;
            }}
            type="button"
            onClick={() => onPeriodChange(p.id)}
            className={`relative z-10 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              period === p.id ? "text-white" : "text-white/55 hover:text-white"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="relative" ref={rootRef}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
            customActive
              ? "border-white/25 bg-white/10 text-white"
              : "border-white/12 bg-transparent text-white/50 hover:border-white/20 hover:bg-white/[0.08] hover:text-white/80"
          }`}
        >
          <Calendar className="h-3.5 w-3.5" />
          {customActive && customRange ? `${customRange.from} — ${customRange.to}` : "Диапазон"}
        </button>
        {open && (
          <div className="animate-in fade-in slide-in-from-top-1 absolute right-0 top-[calc(100%+8px)] z-20 w-60 rounded-2xl border border-white/10 bg-[#17121f] p-4 shadow-2xl duration-150">
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
                className="flex-1 rounded-full bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-400 py-1.5 text-[12.5px] font-semibold text-white transition-opacity hover:opacity-90"
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
                className="rounded-full border border-white/15 px-3.5 py-1.5 text-[12.5px] text-white/60 transition-colors hover:border-white/30 hover:text-white"
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
