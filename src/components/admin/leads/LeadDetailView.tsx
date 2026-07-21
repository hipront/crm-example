"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { type Lead, type LeadStatus } from "@/lib/leads";
import type { LeadStage } from "@/lib/stages";
import StatusDropdown from "@/components/admin/StatusDropdown";
import ConfirmModal from "@/components/admin/ConfirmModal";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function LeadDetailView({
  initialLead,
  role,
  managers,
  stages,
}: {
  initialLead: Lead;
  role: string | null;
  managers: { id: string; full_name: string | null }[];
  stages: LeadStage[];
}) {
  const [lead, setLead] = useState(initialLead);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const router = useRouter();

  const isAdmin = role === "admin";
  const canDelete = isAdmin;
  const canAssignManager = role === "rop" || role === "admin";
  const canEdit = role !== "viewer" && (lead.pipeline_status !== "closed" || isAdmin);

  async function changeStatus(status: LeadStatus) {
    const previous = lead.status;
    setLead((l) => ({ ...l, status }));

    const supabase = createClient();
    const { error } = await supabase.from("leads").update({ status }).eq("id", lead.id);

    if (error) {
      setLead((l) => ({ ...l, status: previous }));
    }
  }

  async function assignManager(managerId: string | null) {
    const previous = lead.assigned_manager_id;
    setLead((l) => ({ ...l, assigned_manager_id: managerId }));

    const supabase = createClient();
    const { error } = await supabase.from("leads").update({ assigned_manager_id: managerId }).eq("id", lead.id);

    if (error) {
      setLead((l) => ({ ...l, assigned_manager_id: previous }));
      alert("Не удалось назначить менеджера");
    }
  }

  async function handleDelete() {
    setConfirmDelete(false);
    setDeleting(true);
    const supabase = createClient();
    const { error } = await supabase.from("leads").delete().eq("id", lead.id);
    setDeleting(false);
    if (error) {
      alert("Не удалось удалить заявку");
      return;
    }
    router.push("/admin/leads");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/leads"
          className="text-white/50 transition-colors hover:text-white"
          aria-label="Назад к лидам"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="min-w-0 flex-1 truncate text-xl font-semibold">{lead.name}</h1>
        {canDelete && (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            disabled={deleting}
            className="shrink-0 rounded-full border border-white/15 p-2 text-white/50 transition-colors hover:border-red-400/50 hover:text-red-400 disabled:opacity-50"
            aria-label="Удалить заявку"
          >
            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          </button>
        )}
        <StatusDropdown
          value={lead.status}
          options={stages.map((s) => ({ value: s.key, label: s.title, color: s.color }))}
          onChange={changeStatus}
          disabled={!canEdit}
        />
      </div>

      <p className="mt-1 pl-8 text-xs text-white/40">Создана {formatDate(lead.created_at)}</p>

      <div className="mt-6 space-y-5 rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-white/40">Имя</p>
            <p className="mt-1 text-sm text-white/90">{lead.name}</p>
          </div>
          <div>
            <p className="text-xs text-white/40">Контакт</p>
            <p className="mt-1 text-sm text-white/90">{lead.contact}</p>
          </div>
        </div>

        {lead.paintings && (
          <div>
            <p className="text-xs text-white/40">Картина</p>
            <p className="mt-1 text-sm text-fuchsia-300">{lead.paintings.title}</p>
          </div>
        )}

        <div>
          <p className="text-xs text-white/40">Менеджер</p>
          {canAssignManager ? (
            <select
              value={lead.assigned_manager_id ?? ""}
              onChange={(e) => assignManager(e.target.value || null)}
              className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-2.5 py-1.5 text-sm text-white outline-none transition-colors hover:border-white/30 focus:border-fuchsia-400"
            >
              <option value="">Не назначен</option>
              {managers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.full_name || "Без имени"}
                </option>
              ))}
            </select>
          ) : (
            <p className="mt-1 text-sm text-white/90">
              {lead.assigned_manager_id
                ? managers.find((m) => m.id === lead.assigned_manager_id)?.full_name || "Без имени"
                : "Не назначен"}
            </p>
          )}
        </div>
      </div>

      {lead.message && (
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-xs text-white/40">Сообщение</p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-white/70">{lead.message}</p>
        </div>
      )}

      {confirmDelete && (
        <ConfirmModal
          title="Удалить заявку?"
          message={<>Вы точно хотите удалить заявку от «{lead.name}»? Это действие необратимо.</>}
          confirmLabel="Удалить"
          confirmVariant="danger"
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </div>
  );
}
