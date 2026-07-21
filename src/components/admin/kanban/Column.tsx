"use client";

import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { type Lead } from "@/lib/leads";
import type { LeadStage } from "@/lib/stages";

const PAGE_SIZE = 15;

function matchesSearch(lead: Lead, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    lead.name.toLowerCase().includes(q) ||
    lead.contact.toLowerCase().includes(q) ||
    (lead.paintings?.title.toLowerCase().includes(q) ?? false)
  );
}

export default function Column({
  stage,
  leads,
  renderCard,
  containerRef,
  highlighted,
}: {
  stage: LeadStage;
  leads: Lead[];
  renderCard: (lead: Lead) => React.ReactNode;
  containerRef?: (el: HTMLDivElement | null) => void;
  highlighted?: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.key });
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filtered = leads.filter((l) => matchesSearch(l, search));
  const visible = filtered.slice(0, visibleCount);
  const hasMore = filtered.length > visibleCount;
  const showToolbar = leads.length > PAGE_SIZE;

  return (
    <div
      ref={(el) => {
        setNodeRef(el);
        containerRef?.(el);
      }}
      className={`rounded-2xl border p-3 transition-colors ${
        highlighted
          ? "border-fuchsia-400/70 bg-fuchsia-500/[0.08] ring-2 ring-fuchsia-400/40"
          : isOver
            ? "border-fuchsia-400/60 bg-fuchsia-500/[0.06]"
            : "border-white/10 bg-white/[0.02]"
      }`}
    >
      <div className="mb-3 flex items-center justify-between px-1">
        <h3 className="flex items-center gap-2 text-sm font-medium text-white/80">
          <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: stage.color }} />
          {stage.title}
        </h3>
        <span className="text-xs text-white/40">{leads.length}</span>
      </div>

      {showToolbar && (
        <input
          type="search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setVisibleCount(PAGE_SIZE);
          }}
          placeholder="Поиск…"
          className="mb-3 w-full rounded-lg border border-white/15 bg-black/30 px-2.5 py-1.5 text-sm text-white outline-none transition-colors focus:border-fuchsia-400"
        />
      )}

      <div className="space-y-3">
        {visible.map((lead) => renderCard(lead))}
        {filtered.length === 0 && (
          <p className="px-1 text-xs text-white/30">
            {search ? `Ничего не найдено по «${search}»` : "Пусто"}
          </p>
        )}
      </div>

      {hasMore && (
        <button
          type="button"
          onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
          className="mt-3 w-full rounded-lg border border-white/15 py-1.5 text-xs text-white/60 transition-colors hover:border-white/30 hover:text-white"
        >
          Показать ещё ({filtered.length - visibleCount})
        </button>
      )}
    </div>
  );
}
