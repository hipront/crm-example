"use client";

import { useEffect, useState } from "react";
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
  canDelete,
  onStatusChange,
  onDelete,
}: {
  lead: Lead;
  canDelete: boolean;
  onStatusChange: (id: string, status: LeadStatus) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between gap-2">
        <span className="font-medium">{lead.name}</span>
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-xs text-white/40">{formatDate(lead.created_at)}</span>
          {canDelete && (
            <button
              type="button"
              onClick={() => {
                if (confirm(`Удалить заявку от «${lead.name}»? Это необратимо.`)) {
                  onDelete(lead.id);
                }
              }}
              className="text-white/30 transition-colors hover:text-red-400"
              aria-label="Удалить заявку"
              title="Удалить заявку"
            >
              ✕
            </button>
          )}
        </div>
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

export default function KanbanBoard({
  initialLeads,
  role,
}: {
  initialLeads: Lead[];
  role: string | null;
}) {
  const [leads, setLeads] = useState(initialLeads);
  const canDelete = role === "admin";

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("leads-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "leads" },
        async (payload) => {
          if (payload.eventType === "DELETE") {
            setLeads((prev) => prev.filter((l) => l.id !== payload.old.id));
            return;
          }

          const { data } = await supabase
            .from("leads")
            .select("id, name, contact, message, status, assigned_manager_id, created_at, paintings(title)")
            .eq("id", payload.new.id)
            .single();

          if (!data) return;
          const lead = data as unknown as Lead;

          setLeads((prev) => {
            const exists = prev.some((l) => l.id === lead.id);
            return exists ? prev.map((l) => (l.id === lead.id ? lead : l)) : [lead, ...prev];
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function handleStatusChange(id: string, status: LeadStatus) {
    const previousStatus = leads.find((l) => l.id === id)?.status;
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));

    const supabase = createClient();
    const { error } = await supabase.from("leads").update({ status }).eq("id", id);

    if (error && previousStatus) {
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status: previousStatus } : l)));
    }
  }

  async function handleDelete(id: string) {
    const previous = leads;
    setLeads((prev) => prev.filter((l) => l.id !== id));

    const supabase = createClient();
    const { error } = await supabase.from("leads").delete().eq("id", id);

    if (error) {
      setLeads(previous);
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
                  <LeadCard key={lead.id} lead={lead} canDelete={canDelete} onStatusChange={handleStatusChange} onDelete={handleDelete} />
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
              <LeadCard key={lead.id} lead={lead} canDelete={canDelete} onStatusChange={handleStatusChange} onDelete={handleDelete} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
