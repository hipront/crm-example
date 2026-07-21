import type { LucideIcon } from "lucide-react";

function sparkPath(values: number[], w = 76, h = 26, pad = 3) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  return values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return [x, y] as const;
  });
}

export default function KpiTile({
  icon: Icon,
  label,
  value,
  sublabel,
  trend,
  spark,
  color,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  sublabel?: string;
  trend?: number | null;
  spark?: number[];
  color: string;
}) {
  const points = spark && spark.length > 1 ? sparkPath(spark) : null;
  const pointsStr = points?.map((p) => p.join(",")).join(" ");
  const last = points?.[points.length - 1];

  return (
    <div className="group rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.015] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/25 hover:shadow-lg hover:shadow-black/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white/[0.06]">
            <Icon className="h-3.5 w-3.5" style={{ color }} />
          </div>
          <p className="text-xs font-medium text-white/55">{label}</p>
        </div>
        {trend != null && (
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${
              trend >= 0 ? "bg-emerald-400/10 text-emerald-300" : "bg-red-400/10 text-red-300"
            }`}
          >
            {trend >= 0 ? "+" : ""}
            {trend}%
          </span>
        )}
      </div>

      <p className={`mt-3.5 font-bold tracking-tight text-white tabular-nums ${value.length > 9 ? "text-xl" : "text-2xl"}`}>
        {value}
      </p>

      <div className="mt-2.5 flex items-end justify-between gap-2">
        {sublabel && <span className="text-xs text-white/40">{sublabel}</span>}
        {pointsStr && last && (
          <svg width="76" height="26" viewBox="0 0 76 26" className="shrink-0 opacity-90">
            <polyline points={pointsStr} fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={last[0]} cy={last[1]} r={2.4} fill={color} />
          </svg>
        )}
      </div>
    </div>
  );
}
