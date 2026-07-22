"use client";

import { X, ArchiveRestore } from "lucide-react";
import { COARSE_STATUS_COLORS, COARSE_STATUS_LABELS, type Lead } from "@/lib/leads";
import { useLockBodyScroll } from "@/lib/useLockBodyScroll";

function formatArchivedAt(iso: string) {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ArchivePanel({
  leads,
  onRestore,
  onClose,
  canRestore = true,
}: {
  leads: Lead[];
  onRestore: (leadId: string) => void;
  onClose: () => void;
  canRestore?: boolean;
}) {
  useLockBodyScroll();

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />
      <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col border-l border-white/10 bg-[#0e0c12] p-5 shadow-2xl">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Архив ({leads.length})</h2>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 text-white/50 transition-colors hover:text-white"
            aria-label="Закрыть"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 flex-1 space-y-2 overflow-y-auto">
          {leads.length === 0 && <p className="text-sm text-white/40">Архив пуст.</p>}
          {leads.map((lead) => (
            <div key={lead.id} className="rounded-xl border border-white/10 bg-white/5 p-3 transition-colors hover:bg-white/[0.07]">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium">{lead.name}</p>
                    <span
                      className="inline-flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium"
                      style={{
                        color: COARSE_STATUS_COLORS[lead.pipeline_status],
                        backgroundColor: `${COARSE_STATUS_COLORS[lead.pipeline_status]}1a`,
                      }}
                    >
                      {COARSE_STATUS_LABELS[lead.pipeline_status]}
                    </span>
                  </div>
                  {lead.paintings && <p className="truncate text-sm text-fuchsia-300">{lead.paintings.title}</p>}
                  {lead.archived_at && (
                    <p className="mt-0.5 text-xs text-white/40">В архиве с {formatArchivedAt(lead.archived_at)}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => canRestore && onRestore(lead.id)}
                  disabled={!canRestore}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/15 px-2.5 py-1 text-xs text-white/70 transition-colors hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-white/15 disabled:hover:text-white/70"
                >
                  <ArchiveRestore className="h-3.5 w-3.5" />
                  Вернуть
                </button>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}
