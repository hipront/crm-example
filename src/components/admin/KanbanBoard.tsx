"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { createClient } from "@/lib/supabase/client";
import { type Lead, type LeadStatus } from "@/lib/leads";
import { updatePainting } from "@/lib/paintings";
import LeadCard from "@/components/admin/kanban/LeadCard";
import Column from "@/components/admin/kanban/Column";
import ConfirmModal from "@/components/admin/ConfirmModal";

const VISIBLE_COLUMNS: LeadStatus[] = [
  "new",
  "in_progress",
  "agreed",
  "paid",
  "shipped",
  "closed",
];

export default function KanbanBoard({
  initialLeads,
  role,
  managers,
  highlightStatus,
}: {
  initialLeads: Lead[];
  role: string | null;
  managers: { id: string; full_name: string | null }[];
  highlightStatus?: string;
}) {
  const [leads, setLeads] = useState(initialLeads);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Lead | null>(null);
  const [closeTarget, setCloseTarget] = useState<{ id: string; name: string; status: LeadStatus } | null>(
    null,
  );
  const [highlighted, setHighlighted] = useState(highlightStatus ?? null);
  const columnRefs = useRef<Partial<Record<string, HTMLDivElement>>>({});
  const canDelete = role === "admin";
  const canEdit = role !== "viewer";
  const isAdmin = role === "admin";
  const canAssignManager = role === "rop" || role === "admin";
  const router = useRouter();

  function canEditLead(lead: Lead) {
    return canEdit && (lead.status !== "closed" || isAdmin);
  }

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  useEffect(() => {
    if (!highlightStatus) return;
    const el = columnRefs.current[highlightStatus];
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    const timer = setTimeout(() => setHighlighted(null), 2500);
    router.replace("/admin/leads");
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
            .select(
              "id, name, contact, message, status, assigned_manager_id, painting_id, created_at, paintings(title)",
            )
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

  async function applyStatusChange(id: string, status: LeadStatus) {
    const lead = leads.find((l) => l.id === id);
    const previousStatus = lead?.status;
    if (!lead || previousStatus === status) return;
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));

    const supabase = createClient();
    const { error } = await supabase.from("leads").update({ status }).eq("id", id);

    if (error) {
      if (previousStatus) {
        setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status: previousStatus } : l)));
      }
      return;
    }

    if (status === "paid" && lead.painting_id) {
      updatePainting(supabase, lead.painting_id, { is_available: false }).catch(() => {});
    }
  }

  function requestStatusChange(id: string, status: LeadStatus) {
    if (status === "closed") {
      const lead = leads.find((l) => l.id === id);
      if (lead) setCloseTarget({ id, name: lead.name, status });
      return;
    }
    applyStatusChange(id, status);
  }

  function confirmClose() {
    if (!closeTarget) return;
    applyStatusChange(closeTarget.id, closeTarget.status);
    setCloseTarget(null);
  }

  async function assignManager(leadId: string, managerId: string | null) {
    const previous = leads;
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, assigned_manager_id: managerId } : l)));

    const supabase = createClient();
    const { error } = await supabase
      .from("leads")
      .update({ assigned_manager_id: managerId })
      .eq("id", leadId);

    if (error) {
      setLeads(previous);
      alert("Не удалось назначить менеджера");
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);

    const previous = leads;
    setLeads((prev) => prev.filter((l) => l.id !== target.id));

    const supabase = createClient();
    const { error } = await supabase.from("leads").delete().eq("id", target.id);

    if (error) {
      setLeads(previous);
    }
  }

  function handleDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
  }

  function handleDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const overStatus = e.over?.id as LeadStatus | undefined;
    if (!overStatus) return;
    requestStatusChange(String(e.active.id), overStatus);
  }

  const rejected = leads.filter((l) => l.status === "rejected");
  const activeLead = leads.find((l) => l.id === activeId) ?? null;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="space-y-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {VISIBLE_COLUMNS.map((status) => (
            <Column
              key={status}
              status={status}
              leads={leads.filter((l) => l.status === status)}
              containerRef={(el) => {
                columnRefs.current[status] = el ?? undefined;
              }}
              highlighted={highlighted === status}
              renderCard={(lead) => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  canDelete={canDelete}
                  canEdit={canEditLead(lead)}
                  managers={managers}
                  canAssignManager={canAssignManager}
                  onAssignManager={assignManager}
                  onDeleteRequest={setDeleteTarget}
                  dragging={activeId === lead.id}
                />
              )}
            />
          ))}
        </div>

        {rejected.length > 0 && (
          <div className="max-w-sm">
            <Column
              status="rejected"
              leads={rejected}
              containerRef={(el) => {
                columnRefs.current["rejected"] = el ?? undefined;
              }}
              highlighted={highlighted === "rejected"}
              renderCard={(lead) => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  canDelete={canDelete}
                  canEdit={canEditLead(lead)}
                  managers={managers}
                  canAssignManager={canAssignManager}
                  onAssignManager={assignManager}
                  onDeleteRequest={setDeleteTarget}
                  dragging={activeId === lead.id}
                />
              )}
            />
          </div>
        )}
      </div>

      <DragOverlay>
        {activeLead ? (
          <div className="w-72 rounded-xl border border-fuchsia-400/50 bg-[#1a1622] p-4 shadow-2xl">
            <p className="font-medium">{activeLead.name}</p>
            <p className="mt-1 text-sm text-white/60">{activeLead.contact}</p>
          </div>
        ) : null}
      </DragOverlay>

      {deleteTarget && (
        <ConfirmModal
          title="Удалить заявку?"
          message={<>Вы точно хотите удалить заявку от «{deleteTarget.name}»? Это действие необратимо.</>}
          confirmLabel="Удалить"
          confirmVariant="danger"
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {closeTarget && (
        <ConfirmModal
          title="Закрыть сделку?"
          message={
            <>
              Вы точно хотите перевести заявку от «{closeTarget.name}» в статус &quot;Закрыт&quot;?
              {isAdmin
                ? " После этого статус смогут менять только администраторы."
                : " После этого статус нельзя будет изменить — обратитесь к администратору."}
            </>
          }
          confirmLabel="Закрыть сделку"
          confirmVariant="brand"
          onConfirm={confirmClose}
          onCancel={() => setCloseTarget(null)}
        />
      )}
    </DndContext>
  );
}
