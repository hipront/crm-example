import { COARSE_STATUS_LABELS, COARSE_STATUS_COLORS, type CoarseStatus } from "@/lib/leads";
import type { LeadStage } from "@/lib/stages";
import type { HistoryEntry } from "@/lib/history";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function stageLabel(stages: LeadStage[], key: string | null) {
  if (!key) return "—";
  return stages.find((s) => s.key === key)?.title ?? key;
}

function pipelineLabel(key: string | null) {
  if (!key) return "—";
  return COARSE_STATUS_LABELS[key as CoarseStatus] ?? key;
}

function describe(entry: HistoryEntry, stages: LeadStage[]) {
  if (entry.kind === "created") return "Лид создан";
  if (entry.kind === "pipeline_status") {
    return `Статус изменён: ${pipelineLabel(entry.old_status)} → ${pipelineLabel(entry.new_status)}`;
  }
  return `Этап воронки изменён: ${stageLabel(stages, entry.old_status)} → ${stageLabel(stages, entry.new_status)}`;
}

function dotColor(entry: HistoryEntry, stages: LeadStage[]) {
  if (entry.kind === "created") return "#94a3b8";
  if (entry.kind === "pipeline_status") {
    return COARSE_STATUS_COLORS[entry.new_status as CoarseStatus] ?? "#94a3b8";
  }
  return stages.find((s) => s.key === entry.new_status)?.color ?? "#94a3b8";
}

export default function LeadHistory({ entries, stages }: { entries: HistoryEntry[]; stages: LeadStage[] }) {
  if (entries.length === 0) {
    return <p className="text-sm text-white/30">Истории пока нет</p>;
  }

  return (
    <div className="space-y-3">
      {entries.map((entry) => (
        <div key={entry.id} className="flex gap-3 text-sm">
          <div
            className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: dotColor(entry, stages) }}
          />
          <div className="min-w-0 flex-1">
            <p className="text-white/90">{describe(entry, stages)}</p>
            <p className="mt-0.5 text-xs text-white/40">
              {entry.changed_by ? entry.profiles?.full_name || entry.profiles?.email || "Пользователь" : "Система"} ·{" "}
              {formatDate(entry.changed_at)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
