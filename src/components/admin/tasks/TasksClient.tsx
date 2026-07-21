"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2, Search, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  deleteTask,
  updateTaskDone,
  TASK_TYPE_LABELS,
  TASK_TYPES,
  type TaskType,
  type TaskWithLead,
} from "@/lib/tasks";
import { ROLE_LABELS, type Profile } from "@/lib/profiles";
import NewTaskModal from "@/components/admin/tasks/NewTaskModal";
import TaskLeadPreview from "@/components/admin/tasks/TaskLeadPreview";
import SelectDropdown from "@/components/admin/SelectDropdown";

const TYPE_FILTER_OPTIONS: { value: TaskType | "all"; label: string }[] = [
  { value: "all", label: "Все типы" },
  ...TASK_TYPES.map((t) => ({ value: t, label: TASK_TYPE_LABELS[t] })),
];

function formatDue(iso: string) {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isOverdue(task: TaskWithLead) {
  return !task.done && !!task.due_at && new Date(task.due_at).getTime() < Date.now();
}

function initials(name: string) {
  return name.trim().slice(0, 2).toUpperCase();
}

export default function TasksClient({
  initialTasks,
  profiles,
  leads,
  currentUserId,
}: {
  initialTasks: TaskWithLead[];
  profiles: Profile[];
  leads: { id: string; name: string }[];
  currentUserId: string;
}) {
  const [tasks, setTasks] = useState(initialTasks);
  const [previewTask, setPreviewTask] = useState<TaskWithLead | null>(null);
  const [assigneeFilter, setAssigneeFilter] = useState<string | null>(null);
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [tab, setTab] = useState<"active" | "overdue" | "archive">("active");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TaskType | "all">("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showNew, setShowNew] = useState(false);

  const profileById = useMemo(() => new Map(profiles.map((p) => [p.id, p])), [profiles]);

  const visibleEmployees = profiles.filter((p) => {
    if (p.role === "viewer") return false;
    const q = employeeSearch.trim().toLowerCase();
    if (!q) return true;
    return (p.full_name?.toLowerCase().includes(q) ?? false) || (p.email?.toLowerCase().includes(q) ?? false);
  });

  const filtered = tasks.filter((t) => {
    if (assigneeFilter && t.assignee_id !== assigneeFilter) return false;
    if (tab === "overdue" && !isOverdue(t)) return false;
    if (tab === "active" && t.done) return false;
    if (tab === "archive" && !t.done) return false;
    if (typeFilter !== "all" && t.type !== typeFilter) return false;
    if (dateFrom && (!t.due_at || t.due_at < new Date(dateFrom).toISOString())) return false;
    if (dateTo && (!t.due_at || t.due_at > new Date(dateTo).toISOString())) return false;

    const q = search.trim().toLowerCase();
    if (q) {
      const assignee = t.assignee_id ? profileById.get(t.assignee_id) : null;
      const haystack = `${t.leads?.name ?? ""} ${assignee?.full_name ?? ""} ${assignee?.email ?? ""} ${t.description ?? ""}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    return true;
  });

  async function toggleDone(task: TaskWithLead) {
    const previous = tasks;
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, done: !t.done } : t)));
    const supabase = createClient();
    try {
      await updateTaskDone(supabase, task.id, !task.done);
    } catch {
      setTasks(previous);
    }
  }

  async function removeTask(id: string) {
    const previous = tasks;
    setTasks((prev) => prev.filter((t) => t.id !== id));
    const supabase = createClient();
    try {
      await deleteTask(supabase, id);
    } catch {
      setTasks(previous);
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Задачи</h1>
          <p className="mt-1 text-sm text-white/50">Активные задачи по доступным лидам</p>
        </div>
        <button
          type="button"
          onClick={() => setShowNew(true)}
          className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-400 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Новая задача
        </button>
      </div>

      <div className="mt-4 flex flex-col gap-6 md:flex-row">
        <aside className="w-full shrink-0 rounded-2xl border border-white/10 bg-white/5 p-4 md:w-60">
          <p className="text-sm font-semibold text-white">Сотрудники</p>
          <p className="mt-0.5 text-xs text-white/40">Фильтр задач по исполнителю</p>

          <input
            type="search"
            value={employeeSearch}
            onChange={(e) => setEmployeeSearch(e.target.value)}
            placeholder="Поиск…"
            className="mt-3 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-1.5 text-sm text-white outline-none focus:border-fuchsia-400"
          />

          <div className="mt-3 space-y-1">
            <button
              type="button"
              onClick={() => setAssigneeFilter(null)}
              className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-sm transition-colors ${
                assigneeFilter === null ? "bg-fuchsia-500/90 text-white" : "text-white/60 hover:bg-white/5 hover:text-white/90"
              }`}
            >
              <span>Все задачи</span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  assigneeFilter === null ? "bg-white/20 text-white" : "bg-white/10 text-white/60"
                }`}
              >
                {tasks.length}
              </span>
            </button>

            {visibleEmployees.map((p) => {
              const count = tasks.filter((t) => t.assignee_id === p.id).length;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setAssigneeFilter(p.id)}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
                    assigneeFilter === p.id ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white/90"
                  }`}
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-fuchsia-500/20 text-[10px] font-medium text-fuchsia-200">
                    {initials(p.full_name || p.email || "?")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{p.email || p.full_name || "Без имени"}</span>
                    <span className="block truncate text-xs text-fuchsia-300/70">{ROLE_LABELS[p.role]}</span>
                  </span>
                  <span className="shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/60">{count}</span>
                </button>
              );
            })}
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex flex-wrap rounded-full border border-white/15 p-0.5">
              <button
                type="button"
                onClick={() => setTab("active")}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  tab === "active" ? "bg-fuchsia-500/90 text-white" : "text-white/50 hover:text-white/80"
                }`}
              >
                Все активные
              </button>
              <button
                type="button"
                onClick={() => setTab("overdue")}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  tab === "overdue" ? "bg-red-500/20 text-red-300" : "text-white/50 hover:text-white/80"
                }`}
              >
                Просроченные
              </button>
              <button
                type="button"
                onClick={() => setTab("archive")}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  tab === "archive" ? "bg-emerald-500/20 text-emerald-300" : "text-white/50 hover:text-white/80"
                }`}
              >
                Выполненные
              </button>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <div className="relative min-w-[220px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Поиск по лиду, исполнителю или описанию…"
                className="w-full rounded-lg border border-white/15 bg-black/30 py-1.5 pl-9 pr-3 text-sm text-white outline-none focus:border-fuchsia-400"
              />
            </div>
            <SelectDropdown value={typeFilter} options={TYPE_FILTER_OPTIONS} onChange={setTypeFilter} />
            <div className="flex flex-wrap items-center gap-1.5 text-sm text-white/40">
              <span className="shrink-0">Срок:</span>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-[132px] shrink-0 rounded-lg border border-white/15 bg-black/30 px-2 py-1.5 text-sm text-white outline-none focus:border-fuchsia-400 [color-scheme:dark]"
              />
              <span className="shrink-0">–</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-[132px] shrink-0 rounded-lg border border-white/15 bg-black/30 px-2 py-1.5 text-sm text-white outline-none focus:border-fuchsia-400 [color-scheme:dark]"
              />
              {(dateFrom || dateTo) && (
                <button
                  type="button"
                  onClick={() => {
                    setDateFrom("");
                    setDateTo("");
                  }}
                  title="Сбросить срок"
                  className="shrink-0 text-white/40 transition-colors hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="mt-4 space-y-1.5">
            {filtered.map((task) => {
              const assignee = task.assignee_id ? profileById.get(task.assignee_id) : null;
              return (
                <div
                  key={task.id}
                  onClick={() => setPreviewTask(task)}
                  title="Клик — превью лида"
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-3 transition-colors ${
                    isOverdue(task)
                      ? "border-red-400/30 bg-red-400/5 hover:bg-red-400/10"
                      : "border-white/10 bg-white/[0.03] hover:bg-white/[0.07]"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={() => toggleDone(task)}
                    onClick={(e) => e.stopPropagation()}
                    className="h-4 w-4 shrink-0 cursor-pointer accent-fuchsia-500"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-white/60">
                        {TASK_TYPE_LABELS[task.type]}
                      </span>
                      {task.leads && <span className="text-sm text-fuchsia-300">{task.leads.name}</span>}
                    </div>
                    {task.description && (
                      <p className={`mt-0.5 truncate text-sm ${task.done ? "text-white/40 line-through" : "text-white/90"}`}>
                        {task.description}
                      </p>
                    )}
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-white/40">
                      {assignee && <span>{assignee.full_name || assignee.email}</span>}
                      {task.due_at && (
                        <span className={isOverdue(task) ? "text-red-400" : undefined}>до {formatDue(task.due_at)}</span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTask(task.id);
                    }}
                    className="shrink-0 text-white/30 transition-colors hover:text-red-400"
                    aria-label="Удалить задачу"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
            {filtered.length === 0 && <p className="py-10 text-center text-sm italic text-white/30">Задач нет</p>}
          </div>
        </div>
      </div>

      {showNew && (
        <NewTaskModal
          leads={leads}
          profiles={profiles}
          currentUserId={currentUserId}
          onCreated={(task) => {
            setTasks((prev) => [...prev, task]);
            setShowNew(false);
          }}
          onClose={() => setShowNew(false)}
        />
      )}

      {previewTask && <TaskLeadPreview task={previewTask} onClose={() => setPreviewTask(null)} />}
    </div>
  );
}
