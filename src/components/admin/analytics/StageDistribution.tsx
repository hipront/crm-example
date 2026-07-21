"use client";

import type { StageBucket } from "@/lib/analytics";

export default function StageDistribution({
  buckets,
  onSelect,
  noScroll = false,
}: {
  buckets: StageBucket[];
  onSelect: (key: string) => void;
  noScroll?: boolean;
}) {
  if (buckets.length === 0) {
    return <p className="text-sm text-white/40">Этапов нет</p>;
  }

  const maxCount = Math.max(...buckets.map((b) => b.count), 1);

  return (
    <div className={`space-y-2.5 pr-1 ${noScroll ? "" : "max-h-[280px] overflow-y-auto"}`}>
      {buckets.map((bucket) => {
        const width = Math.max((bucket.count / maxCount) * 100, bucket.count > 0 ? 4 : 0);
        return (
          <button
            key={bucket.key}
            type="button"
            onClick={() => onSelect(bucket.key)}
            title={`${bucket.label}: ${bucket.count} лид(ов) — открыть в канбане`}
            className="group flex w-full items-center gap-3 rounded-lg px-1 py-1.5 text-left transition-colors hover:bg-white/5"
          >
            <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: bucket.color }} />
            <span className="w-24 shrink-0 truncate text-sm text-white/70">{bucket.label}</span>
            <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full transition-[width,filter] duration-500 group-hover:brightness-125"
                style={{ width: `${width}%`, background: bucket.color }}
              />
            </div>
            <span className="w-14 shrink-0 text-right text-sm tabular-nums text-white/80">{bucket.count}</span>
          </button>
        );
      })}
    </div>
  );
}
