"use client";

import { useState } from "react";
import { ChevronDown, Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { deleteTask, updateTaskDone, TASK_TYPE_LABELS, type Task, type TaskWithLead } from "@/lib/tasks";
import type { Profile } from "@/lib/profiles";
import NewTaskModal from "@/components/admin/tasks/NewTaskModal";

function formatDue(iso: string) {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isOverdue(task: Task) {
  return !task.done && !!task.due_at && new Date(task.due_at).getTime() < Date.now();
}

export default function TaskList({
  leadId,
  leadName,
  initialTasks,
  profiles,
  currentUserId,
  role,
}: {
  leadId: string;
  leadName: string;
  initialTasks: Task[];
  profiles: Profile[];
  currentUserId: string;
  role: string | null;
}) {
  const canEdit = role !== "viewer";
  const [tasks, setTasks] = useState(initialTasks);
  const [open, setOpen] = useState(true);
  const [showNew, setShowNew] = useState(false);

  async function toggleDone(task: Task) {
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
    <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs text-white/40">Задачи</p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowNew(true)}
            disabled={!canEdit}
            className="inline-flex items-center gap-1 text-xs font-medium text-fuchsia-300 transition-colors hover:text-fuchsia-200 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-fuchsia-300"
          >
            <Plus className="h-3.5 w-3.5" />
            Добавить
          </button>
          <button type="button" onClick={() => setOpen((o) => !o)} aria-label={open ? "Свернуть" : "Развернуть"}>
            <ChevronDown className={`h-4 w-4 text-white/40 transition-transform ${open ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      {open && (
        <div className="mt-2 space-y-1.5">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-center gap-2.5 rounded-lg border px-2.5 py-2 transition-colors ${
                isOverdue(task)
                  ? "border-red-400/30 bg-red-400/5 hover:bg-red-400/10"
                  : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"
              }`}
            >
              <input
                type="checkbox"
                checked={task.done}
                onChange={() => toggleDone(task)}
                disabled={!canEdit}
                className="h-4 w-4 shrink-0 cursor-pointer accent-fuchsia-500 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <div className="min-w-0 flex-1">
                <p className={`truncate text-sm ${task.done ? "text-white/40 line-through" : "text-white/90"}`}>
                  <span className="text-white/40">{TASK_TYPE_LABELS[task.type]}:</span> {task.description}
                </p>
                {task.due_at && (
                  <p className={`text-xs ${isOverdue(task) ? "text-red-400" : "text-white/40"}`}>
                    до {formatDue(task.due_at)}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => canEdit && removeTask(task.id)}
                disabled={!canEdit}
                className="shrink-0 text-white/30 transition-colors hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-white/30"
                aria-label="Удалить задачу"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {tasks.length === 0 && <p className="text-sm italic text-white/30">Задач нет</p>}
        </div>
      )}

      {showNew && (
        <NewTaskModal
          fixedLead={{ id: leadId, name: leadName }}
          profiles={profiles}
          currentUserId={currentUserId}
          onCreated={(task: TaskWithLead) => {
            setTasks((prev) => [...prev, task]);
            setShowNew(false);
            setOpen(true);
          }}
          onClose={() => setShowNew(false)}
        />
      )}
    </div>
  );
}
