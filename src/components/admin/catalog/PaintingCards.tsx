"use client";

import type { AdminPainting } from "@/lib/paintings";

function AvailabilityBadge({
  p,
  canEdit,
  onToggle,
}: {
  p: AdminPainting;
  canEdit: boolean;
  onToggle: () => void;
}) {
  const classes = `shrink-0 rounded-full px-2.5 py-1 text-xs transition-colors ${
    p.is_available
      ? `bg-emerald-500/15 text-emerald-300 ${canEdit ? "hover:bg-emerald-500/25" : ""}`
      : `bg-white/10 text-white/40 ${canEdit ? "hover:bg-white/20 hover:text-white/60" : ""}`
  }`;

  if (!canEdit) {
    return <span className={classes}>{p.is_available ? "В наличии" : "Продано"}</span>;
  }

  return (
    <button type="button" onClick={onToggle} className={classes}>
      {p.is_available ? "В наличии" : "Продано"}
    </button>
  );
}

export default function PaintingCards({
  paintings,
  view,
  canEdit,
  onToggleAvailable,
  onEdit,
  onDeleteRequest,
}: {
  paintings: AdminPainting[];
  view: "grid" | "list";
  canEdit: boolean;
  onToggleAvailable: (p: AdminPainting) => void;
  onEdit: (p: AdminPainting) => void;
  onDeleteRequest: (p: AdminPainting) => void;
}) {
  if (view === "grid") {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {paintings.map((p) => (
          <div
            key={p.id}
            className={`rounded-2xl border p-4 transition-colors ${
              p.is_available
                ? "border-white/10 bg-white/5 hover:bg-white/[0.07]"
                : "border-white/5 bg-white/[0.02] hover:bg-white/[0.04]"
            }`}
          >
            <div className="relative overflow-hidden rounded-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.image_url}
                alt={p.title}
                className={`aspect-[4/5] w-full object-cover ${
                  p.is_available ? "" : "grayscale-[85%] brightness-[0.6]"
                }`}
              />
              {!p.is_available && (
                <div className="absolute left-[-32px] top-[14px] -rotate-[40deg] bg-black px-10 py-[5px] text-[11px] font-bold uppercase tracking-[0.05em] text-white shadow-[0_4px_12px_rgba(0,0,0,0.4)]">
                  Продано
                </div>
              )}
            </div>
            <div className="mt-3 flex items-start justify-between gap-2">
              <div>
                <p className={`font-medium ${p.is_available ? "" : "text-white/60"}`}>{p.title}</p>
                <p className="text-sm text-white/50">{p.price.toLocaleString("ru-RU")} ₽</p>
              </div>
              <AvailabilityBadge p={p} canEdit={canEdit} onToggle={() => onToggleAvailable(p)} />
            </div>
            {canEdit && (
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => onEdit(p)}
                  className="flex-1 rounded-lg border border-white/15 py-1.5 text-sm text-white/70 transition-colors hover:border-white/30 hover:text-white"
                >
                  Изменить
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteRequest(p)}
                  className="rounded-lg border border-white/15 px-3 py-1.5 text-sm text-white/40 transition-colors hover:border-red-400/50 hover:text-red-400"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/5">
      {paintings.map((p) => (
        <div
          key={p.id}
          className={`flex flex-wrap items-center gap-3 p-3 transition-colors hover:bg-white/[0.04] ${p.is_available ? "" : "opacity-70"}`}
        >
          <div className="flex min-w-[160px] flex-1 items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.image_url}
              alt={p.title}
              className={`h-14 w-11 shrink-0 rounded-md object-cover ${
                p.is_available ? "" : "grayscale-[85%] brightness-[0.6]"
              }`}
            />
            <div className="min-w-0 flex-1">
              <p className={`truncate font-medium ${p.is_available ? "" : "text-white/60"}`}>{p.title}</p>
              <p className="text-sm text-white/50">{p.price.toLocaleString("ru-RU")} ₽</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <AvailabilityBadge p={p} canEdit={canEdit} onToggle={() => onToggleAvailable(p)} />
            {canEdit && (
              <>
                <button
                  type="button"
                  onClick={() => onEdit(p)}
                  className="shrink-0 rounded-lg border border-white/15 px-3 py-1.5 text-sm text-white/70 transition-colors hover:border-white/30 hover:text-white"
                >
                  Изменить
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteRequest(p)}
                  className="shrink-0 rounded-lg border border-white/15 px-3 py-1.5 text-sm text-white/40 transition-colors hover:border-red-400/50 hover:text-red-400"
                >
                  ✕
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
