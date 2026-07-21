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
  canEdit,
  onOpen,
  dragging,
}: {
  lead: Lead;
  canEdit: boolean;
  onOpen: (lead: Lead) => void;
  dragging?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: lead.id,
    disabled: !canEdit,
  });

  return (
    <div
      ref={setNodeRef}
      {...(canEdit ? { ...listeners, ...attributes } : {})}
      onClick={() => onOpen(lead)}
      style={
        transform
          ? { transform: `translate(${transform.x}px, ${transform.y}px)`, zIndex: 10 }
          : undefined
      }
      className={`rounded-xl border p-4 transition-[border-color,box-shadow] duration-150 ${
        canEdit ? "cursor-grab touch-none active:cursor-grabbing" : "cursor-pointer"
      } ${
        dragging
          ? "border-fuchsia-400/60 bg-white/5 opacity-40"
          : "border-white/10 bg-white/5 hover:border-fuchsia-400/40 hover:bg-white/[0.07] hover:shadow-lg hover:shadow-fuchsia-500/10"
      }`}
    >
      <span className="block font-medium">{lead.name}</span>
      {lead.paintings && (
        <p className="mt-1 text-sm text-fuchsia-300">{lead.paintings.title}</p>
      )}
      <p className="mt-2 text-right text-xs text-white/40">{formatDate(lead.created_at)}</p>
    </div>
  );
}
