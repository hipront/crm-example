"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { LEAD_STATUSES, LEAD_STATUS_LABELS, type Lead, type LeadStatus } from "@/lib/leads";

const VISIBLE_COLUMNS: LeadStatus[] = [
  "new",
  "in_progress",
  "agreed",
  "paid",
  "shipped",
  "closed",
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" });
}

function LeadCard({
  lead,
  onStatusChange,
}: {
  lead: Lead;
  onStatusChange: (id: string, status: LeadStatus) => void;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between gap-2">
        <span className="font-medium">{lead.name}</span>
        <span className="shrink-0 text-xs text-white/40">{formatDate(lead.created_at)}</span>
      </div>
      <p className="mt-1 text-sm text-white/60">{lead.contact}</p>
      {lead.paintings && (
        <p className="mt-1 text-sm text-fuchsia-300">{lead.paintings.title}</p>
      )}
      {lead.message && <p className="mt-2 text-sm text-white/50">{lead.message}</p>}
      <select
        value={lead.status}
        onChange={(e) => onStatusChange(lead.id, e.target.value as LeadStatus)}
        className="mt-3 w-full rounded-lg border border-white/15 bg-black/30 px-2.5 py-1.5 text-sm text-white outline-none focus:border-fuchsia-400"
      >
        {LEAD_STATUSES.map((s) => (
          <option key={s} value={s}>
            {LEAD_STATUS_LABELS[s]}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function KanbanBoard({ initialLeads }: { initialLeads: Lead[] }) {
  const [leads, setLeads] = useState(initialLeads);

  async function handleStatusChange(id: string, status: LeadStatus) {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));

    const supabase = createClient();
    const { error } = await supabase.from("leads").update({ status }).eq("id", id);

    if (error) {
      setLeads(initialLeads);
    }
  }

  const rejected = leads.filter((l) => l.status === "rejected");

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {VISIBLE_COLUMNS.map((status) => {
          const columnLeads = leads.filter((l) => l.status === status);
          return (
            <div key={status} className="rounded-2xl border border-white/10 bg-white/[0.02] p-3">
              <div className="mb-3 flex items-center justify-between px-1">
                <h3 className="text-sm font-medium text-white/80">{LEAD_STATUS_LABELS[status]}</h3>
                <span className="text-xs text-white/40">{columnLeads.length}</span>
              </div>
              <div className="space-y-3">
                {columnLeads.map((lead) => (
                  <LeadCard key={lead.id} lead={lead} onStatusChange={handleStatusChange} />
                ))}
                {columnLeads.length === 0 && (
                  <p className="px-1 text-xs text-white/30">Пусто</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {rejected.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-medium text-white/50">
            Отказ ({rejected.length})
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {rejected.map((lead) => (
              <LeadCard key={lead.id} lead={lead} onStatusChange={handleStatusChange} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
