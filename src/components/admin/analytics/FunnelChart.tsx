"use client";

import type { FunnelStep } from "@/lib/analytics";

const W = 640;
const H = 190;
const PAD = 12;

export default function FunnelChart({
  funnel,
  onSelect,
}: {
  funnel: FunnelStep[];
  onSelect: (status: string) => void;
}) {
  const maxCount = Math.max(...funnel.map((f) => f.count), 1);
  const usableH = H - PAD * 2;
  const stepX = funnel.length > 1 ? W / (funnel.length - 1) : W;

  const points = funnel.map((f, i) => ({
    x: i * stepX,
    y: PAD + usableH - (f.count / maxCount) * usableH,
  }));
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L${points[points.length - 1].x.toFixed(1)},${H} L${points[0].x.toFixed(1)},${H} Z`;
  const gridLines = [0, 1, 2, 3].map((i) => PAD + i * (usableH / 3));

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="block w-full overflow-visible" style={{ height: H }}>
        {gridLines.map((y, i) => (
          <line key={i} x1={0} x2={W} y1={y} y2={y} stroke="rgba(255,255,255,.06)" strokeWidth={1} />
        ))}
        <path d={areaPath} fill="url(#funnelGrad)" opacity={0.5} />
        <path d={linePath} fill="none" stroke="#e879f9" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={4.5} fill="#141018" stroke="#e879f9" strokeWidth={2.5} />
        ))}
        <defs>
          <linearGradient id="funnelGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a855f7" stopOpacity={0.5} />
            <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
          </linearGradient>
        </defs>
      </svg>
      <div className="mt-1.5 grid grid-cols-6">
        {funnel.map((f) => (
          <button
            key={f.status}
            type="button"
            onClick={() => onSelect(f.status)}
            className="flex flex-col items-center gap-0.5 px-0.5 py-1 transition-opacity hover:opacity-70"
            title={`${f.label}: ${f.count} лид(ов) — открыть в канбане`}
          >
            <span className="text-[13.5px] font-bold text-white">{f.count}</span>
            <span className="text-center text-[10.5px] leading-tight text-white/60">{f.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
