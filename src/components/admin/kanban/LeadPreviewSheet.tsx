"use client";

import Link from "next/link";
import { X, ArrowRight } from "lucide-react";
import { LEAD_STATUS_OPTIONS, type Lead, type LeadStatus } from "@/lib/leads";
import StatusDropdown from "@/components/admin/StatusDropdown";

export default function LeadPreviewSheet({
  lead,
  canEdit,
  onChangeStatus,
  onClose,
}: {
  lead: Lead;
  canEdit: boolean;
  onChangeStatus: (status: LeadStatus) => void;
  onClose: () => void;
}) {
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />
      <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col border-l border-white/10 bg-[#0e0c12] p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <h2 className="min-w-0 truncate text-lg font-semibold">{lead.name}</h2>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 text-white/50 transition-colors hover:text-white"
            aria-label="Закрыть"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-3">
          <StatusDropdown value={lead.status} options={LEAD_STATUS_OPTIONS} onChange={onChangeStatus} disabled={!canEdit} />
        </div>

        <div className="mt-5 space-y-4 text-sm">
          <div>
            <p className="text-xs text-white/40">Контакт</p>
            <p className="mt-1 text-white/90">{lead.contact}</p>
          </div>

          {lead.paintings && (
            <div>
              <p className="text-xs text-white/40">Картина</p>
              <p className="mt-1 text-fuchsia-300">{lead.paintings.title}</p>
            </div>
          )}

          {lead.message && (
            <div>
              <p className="text-xs text-white/40">Сообщение</p>
              <p className="mt-1 whitespace-pre-wrap text-white/70">{lead.message}</p>
            </div>
          )}
        </div>

        <Link
          href={`/admin/leads/${lead.id}`}
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-fuchsia-300 transition-colors hover:text-fuchsia-200"
        >
          Открыть полную карточку
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </aside>
    </>
  );
}
