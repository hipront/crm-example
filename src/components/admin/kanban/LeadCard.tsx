"use client";

import { useDraggable } from "@dnd-kit/core";
import { type Lead } from "@/lib/leads";

function formatDate(iso: string) {
  const d = new Date(iso);
  const date = d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" });
  const time = d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  return `${date} ${time}`;
}

export default function LeadCard({
  lead,
  canDelete,
  canEdit,
  managers,
  canAssignManager,
  onAssignManager,
  onDeleteRequest,
  dragging,
}: {
  lead: Lead;
  canDelete: boolean;
  canEdit: boolean;
  managers: { id: string; full_name: string | null }[];
  canAssignManager: boolean;
  onAssignManager: (leadId: string, managerId: string | null) => void;
  onDeleteRequest: (lead: Lead) => void;
  dragging?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: lead.id,
    disabled: !canEdit,
  });

  return (
    <div
      ref={setNodeRef}
      style={
        transform
          ? { transform: `translate(${transform.x}px, ${transform.y}px)`, zIndex: 10 }
          : undefined
      }
      className={`rounded-xl border border-white/10 bg-white/5 p-4 ${dragging ? "opacity-40" : ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          {canEdit && (
            <button
              type="button"
              {...listeners}
              {...attributes}
              className="shrink-0 cursor-grab touch-none text-white/25 transition-colors hover:text-white/60 active:cursor-grabbing"
              aria-label="Перетащить карточку"
              title="Перетащить в другую колонку"
            >
              ⠿
            </button>
          )}
          <span className="truncate font-medium">{lead.name}</span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-xs text-white/40">{formatDate(lead.created_at)}</span>
          {canDelete && (
            <button
              type="button"
              onClick={() => onDeleteRequest(lead)}
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

      {canAssignManager ? (
        <select
          value={lead.assigned_manager_id ?? ""}
          onChange={(e) => onAssignManager(lead.id, e.target.value || null)}
          className="mt-3 w-full rounded-lg border border-white/15 bg-black/30 px-2.5 py-1.5 text-sm text-white outline-none transition-colors hover:border-white/30 focus:border-fuchsia-400"
        >
          <option value="">Не назначен</option>
          {managers.map((m) => (
            <option key={m.id} value={m.id}>
              {m.full_name || "Без имени"}
            </option>
          ))}
        </select>
      ) : (
        <p className="mt-3 rounded-lg border border-white/10 bg-black/20 px-2.5 py-1.5 text-sm text-white/70">
          Менеджер:{" "}
          {lead.assigned_manager_id
            ? managers.find((m) => m.id === lead.assigned_manager_id)?.full_name || "Без имени"
            : "Не назначен"}
        </p>
      )}
    </div>
  );
}
