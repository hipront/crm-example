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
import { Archive } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { type Lead, type LeadStatus } from "@/lib/leads";
import type { LeadStage } from "@/lib/stages";
import LeadCard from "@/components/admin/kanban/LeadCard";
import Column from "@/components/admin/kanban/Column";
import LeadPreviewSheet from "@/components/admin/kanban/LeadPreviewSheet";
import ArchivePanel from "@/components/admin/kanban/ArchivePanel";

export default function KanbanBoard({
  initialLeads,
  stages,
  role,
  highlightStatus,
}: {
  initialLeads: Lead[];
  stages: LeadStage[];
  role: string | null;
  highlightStatus?: string;
}) {
  const [leads, setLeads] = useState(initialLeads);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [highlighted, setHighlighted] = useState(highlightStatus ?? null);
  const [previewLeadId, setPreviewLeadId] = useState<string | null>(null);
  const [showArchive, setShowArchive] = useState(false);
  const columnRefs = useRef<Partial<Record<string, HTMLDivElement>>>({});
  const canEdit = role !== "viewer";
  const router = useRouter();

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  useEffect(() => {
    if (!highlightStatus) return;
    const el = columnRefs.current[highlightStatus];
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    const timer = setTimeout(() => setHighlighted(null), 2500);
    router.replace("/admin/kanban");
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
              "id, name, contact, message, status, pipeline_status, archived, assigned_manager_id, painting_id, created_at, paintings(title)",
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
    const previousStatus = leads.find((l) => l.id === id)?.status;
    if (previousStatus === status) return;
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));

    const supabase = createClient();
    const { error } = await supabase.from("leads").update({ status }).eq("id", id);

    if (error && previousStatus) {
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status: previousStatus } : l)));
    }
  }

  function handleDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
  }

  function handleDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const overStatus = e.over?.id as LeadStatus | undefined;
    if (!overStatus) return;
    applyStatusChange(String(e.active.id), overStatus);
  }

  async function setArchived(id: string, archived: boolean) {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, archived } : l)));
    const supabase = createClient();
    await supabase.from("leads").update({ archived }).eq("id", id);
  }

  const activeLead = leads.find((l) => l.id === activeId) ?? null;
  const archivedLeads = leads.filter((l) => l.archived);

  return (
    <DndContext
      sensors={sensors}
      autoScroll={false}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="space-y-8">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setShowArchive(true)}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/60 transition-colors hover:border-white/30 hover:text-white"
          >
            <Archive className="h-3.5 w-3.5" />
            Архив {archivedLeads.length > 0 ? `(${archivedLeads.length})` : ""}
          </button>
        </div>

        <div
          className="grid gap-4 overflow-x-auto pb-2"
          style={{ gridTemplateColumns: `repeat(${stages.length}, minmax(240px, 1fr))` }}
        >
          {stages.map((stage) => (
            <Column
              key={stage.key}
              stage={stage}
              leads={leads.filter((l) => l.status === stage.key && !l.archived)}
              containerRef={(el) => {
                columnRefs.current[stage.key] = el ?? undefined;
              }}
              highlighted={highlighted === stage.key}
              renderCard={(lead) => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  canEdit={canEdit}
                  onOpen={(l) => setPreviewLeadId(l.id)}
                  dragging={activeId === lead.id}
                />
              )}
            />
          ))}
        </div>
      </div>

      <DragOverlay>
        {activeLead ? (
          <div className="w-72 rounded-xl border border-fuchsia-400/50 bg-[#1a1622] p-4 shadow-2xl">
            <p className="font-medium">{activeLead.name}</p>
            <p className="mt-1 text-sm text-white/60">{activeLead.contact}</p>
          </div>
        ) : null}
      </DragOverlay>

      {previewLeadId && (() => {
        const previewLead = leads.find((l) => l.id === previewLeadId);
        if (!previewLead) return null;
        return (
          <LeadPreviewSheet
            lead={previewLead}
            onArchive={() => {
              setArchived(previewLead.id, true);
              setPreviewLeadId(null);
            }}
            onClose={() => setPreviewLeadId(null)}
          />
        );
      })()}

      {showArchive && (
        <ArchivePanel
          leads={archivedLeads}
          onRestore={(id) => setArchived(id, false)}
          onClose={() => setShowArchive(false)}
        />
      )}
    </DndContext>
  );
}
