"use client";

import { useState } from "react";
import type { PipelineStep } from "@/lib/analytics";

const R = 72;
const C = 2 * Math.PI * R;
// Небольшое перекрытие соседних сегментов — скрывает субпиксельный шов
// антиалиасинга между дугами на тёмном фоне (иначе виден тонкий разрыв).
const OVERLAP = 1.2;

export default function StatusDonut({
  steps,
  total,
  onSelect,
}: {
  steps: PipelineStep[];
  total: number;
  onSelect: (key: string) => void;
}) {
  const [hovered, setHovered] = useState<string | null>(null);

  if (total === 0) {
    return <p className="text-sm text-white/40">Нет данных за период</p>;
  }

  const segments = steps.reduce<{ list: (PipelineStep & { dashArray: string; dashOffset: number })[]; acc: number }>(
    (state, step) => {
      const frac = total > 0 ? step.count / total : 0;
      const len = frac * C;
      const drawnLen = len > 0 ? Math.min(len + OVERLAP, C) : 0;
      const seg = { ...step, dashArray: `${drawnLen} ${C - drawnLen}`, dashOffset: -state.acc };
      return { list: [...state.list, seg], acc: state.acc + len };
    },
    { list: [], acc: 0 },
  ).list;

  return (
    <div className="flex flex-wrap items-center gap-8">
      <div className="relative h-[190px] w-[190px] shrink-0">
        <svg width={190} height={190} viewBox="0 0 190 190" style={{ transform: "rotate(-90deg)" }}>
          <circle cx={95} cy={95} r={R} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth={22} />
          {segments.map((seg) => {
            const isHovered = hovered === seg.key;
            return (
              <circle
                key={seg.key}
                cx={95}
                cy={95}
                r={R}
                fill="none"
                stroke={seg.color}
                strokeWidth={isHovered ? 26 : 22}
                strokeDasharray={seg.dashArray}
                strokeDashoffset={seg.dashOffset}
                strokeLinecap="butt"
                opacity={hovered && !isHovered ? 0.45 : 1}
                style={{ transition: "stroke-width .18s, opacity .18s", cursor: "pointer" }}
                onMouseEnter={() => setHovered(seg.key)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => onSelect(seg.key)}
              />
            );
          })}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-2xl font-bold text-white">{total}</div>
          <div className="mt-0.5 text-[10.5px] text-white/40">лидов всего</div>
        </div>
      </div>

      <div className="flex min-w-[200px] flex-1 flex-col gap-1.5">
        {steps.map((step) => {
          const isHovered = hovered === step.key;
          return (
            <button
              key={step.key}
              type="button"
              onClick={() => onSelect(step.key)}
              onMouseEnter={() => setHovered(step.key)}
              onMouseLeave={() => setHovered(null)}
              className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors ${
                isHovered ? "bg-white/[0.06]" : ""
              }`}
            >
              <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: step.color }} />
              <span className="flex-1 text-sm font-medium text-white">{step.label}</span>
              <span className="text-sm tabular-nums text-white/50">{step.count}</span>
              <span className="w-11 shrink-0 text-right text-sm font-semibold tabular-nums text-white">{step.pct}%</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
