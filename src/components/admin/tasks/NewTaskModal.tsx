"use client";

import { useEffect, useMemo, useRef, useState } from "react";

function toLocalInputValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
import { ChevronDown, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { createTask, TASK_TYPE_LABELS, TASK_TYPES, type TaskType, type TaskWithLead } from "@/lib/tasks";
import type { Profile } from "@/lib/profiles";
import { useLockBodyScroll } from "@/lib/useLockBodyScroll";
import SelectDropdown from "@/components/admin/SelectDropdown";

const TASK_TYPE_OPTIONS = TASK_TYPES.map((t) => ({ value: t, label: TASK_TYPE_LABELS[t] }));

function LeadPicker({
  leads,
  value,
  onChange,
}: {
  leads: { id: string; name: string }[];
  value: string;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = leads.find((l) => l.id === value) ?? null;

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return leads;
    return leads.filter((l) => l.name.toLowerCase().includes(q));
  }, [leads, query]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          setQuery("");
        }}
        className={`flex w-full items-center gap-2.5 rounded-lg border px-3 py-2 text-left text-sm outline-none transition-colors ${
          open ? "border-fuchsia-400/60 bg-fuchsia-400/5" : "border-white/15 bg-black/30 hover:border-white/30"
        }`}
      >
        <span className={`flex-1 truncate ${selected ? "text-white" : "text-white/40"}`}>
          {selected ? selected.name : "Выберите лида…"}
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-white/40 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-10 overflow-hidden rounded-xl border border-white/10 bg-[#141018] shadow-2xl">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="text"
            placeholder="Поиск по имени…"
            className="w-full border-0 border-b border-white/10 bg-transparent px-3.5 py-3 text-sm text-white outline-none"
          />
          <div className="max-h-56 overflow-y-auto">
            {results.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => {
                  onChange(l.id);
                  setOpen(false);
                }}
                className="block w-full truncate px-3.5 py-2.5 text-left text-sm text-white hover:bg-white/10"
              >
                {l.name}
              </button>
            ))}
            {results.length === 0 && <p className="p-3.5 text-center text-sm text-white/30">Не найдено</p>}
          </div>
        </div>
      )}
    </div>
  );
}

export default function NewTaskModal({
  leads,
  fixedLead,
  profiles,
  currentUserId,
  onCreated,
  onClose,
}: {
  leads?: { id: string; name: string }[];
  fixedLead?: { id: string; name: string };
  profiles: Profile[];
  currentUserId: string;
  onCreated: (task: TaskWithLead) => void;
  onClose: () => void;
}) {
  useLockBodyScroll();
  const [leadId, setLeadId] = useState(fixedLead?.id ?? "");
  const [assigneeId, setAssigneeId] = useState(currentUserId);
  const [type, setType] = useState<TaskType>("call");
  const [dueAt, setDueAt] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const minDueAt = useMemo(() => toLocalInputValue(new Date()), []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!leadId || !assigneeId) {
      setError("Выберите лида и исполнителя");
      return;
    }
    if (dueAt && dueAt < minDueAt) {
      setError("Срок не может быть в прошлом");
      return;
    }
    setSaving(true);
    setError(null);

    try {
      const supabase = createClient();
      const task = await createTask(supabase, {
        leadId,
        description: description.trim(),
        dueAt: dueAt ? new Date(dueAt).toISOString() : null,
        type,
        assigneeId,
      });
      onCreated(task);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось создать задачу");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto overscroll-contain bg-black/70 p-4 py-10 backdrop-blur-sm">
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0e0c12] p-5 shadow-2xl"
      >
        <h3 className="text-lg font-semibold">Новая задача</h3>

        <div className="mt-4 space-y-3">
          {fixedLead ? (
            <div>
              <label className="text-xs text-white/40">Лид</label>
              <p className="mt-1 text-sm text-fuchsia-300">{fixedLead.name}</p>
            </div>
          ) : (
            <div>
              <label className="text-xs text-white/40">Лид *</label>
              <div className="mt-1">
                <LeadPicker leads={leads ?? []} value={leadId} onChange={setLeadId} />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs text-white/40">Исполнитель *</label>
            <div className="mt-1">
              <SelectDropdown
                value={assigneeId}
                options={profiles
                  .filter((p) => p.role !== "viewer")
                  .map((p) => ({ value: p.id, label: p.full_name || p.email || "Без имени" }))}
                onChange={setAssigneeId}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs text-white/40">Тип *</label>
              <div className="mt-1">
                <SelectDropdown value={type} options={TASK_TYPE_OPTIONS} onChange={setType} minWidth={0} />
              </div>
            </div>
            <div>
              <label className="text-xs text-white/40">Срок</label>
              <input
                type="datetime-local"
                value={dueAt}
                min={minDueAt}
                onChange={(e) => setDueAt(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-fuchsia-400 [color-scheme:dark]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-white/40">Описание</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Детали задачи…"
              className="mt-1 w-full resize-none rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-fuchsia-400"
            />
          </div>
        </div>

        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

        <div className="mt-5 flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-400 px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Создать
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/15 px-5 py-2 text-sm text-white/70 transition-colors hover:border-white/30 hover:text-white"
          >
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
}
