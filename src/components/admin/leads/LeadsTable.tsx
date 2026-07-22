"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Download, Plus, Trash2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  COARSE_STATUS_OPTIONS,
  COARSE_STATUS_LABELS,
  pipelineStatusAfterAssign,
  type CoarseStatus,
  type Lead,
} from "@/lib/leads";
import { updatePainting } from "@/lib/paintings";
import StatusDropdown from "@/components/admin/StatusDropdown";
import ManagerDropdown from "@/components/admin/ManagerDropdown";
import ConfirmModal from "@/components/admin/ConfirmModal";
import NewLeadModal from "@/components/admin/leads/NewLeadModal";
import SelectDropdown from "@/components/admin/SelectDropdown";
import type { Painting } from "@/lib/paintings";

const STATUS_FILTER_OPTIONS: { value: CoarseStatus | "all"; label: string }[] = [
  { value: "all", label: "Все статусы" },
  ...COARSE_STATUS_OPTIONS,
];

const PERIODS = [
  { label: "30 дней", days: 30 },
  { label: "90 дней", days: 90 },
  { label: "Год", days: 365 },
  { label: "Все", days: null },
] as const;

const PAGE_SIZE = 15;

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const COARSE_STATUS_SET = new Set<string>(COARSE_STATUS_OPTIONS.map((o) => o.value));

function isCoarseStatus(value: string | undefined): value is CoarseStatus {
  return !!value && COARSE_STATUS_SET.has(value);
}

export default function LeadsTable({
  initialLeads,
  role,
  managers,
  paintings,
  initialPipelineFilter,
}: {
  initialLeads: Lead[];
  role: string | null;
  managers: { id: string; full_name: string | null }[];
  paintings: Painting[];
  initialPipelineFilter?: string;
}) {
  const router = useRouter();
  const [leads, setLeads] = useState(initialLeads);
  const [showNewLead, setShowNewLead] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CoarseStatus | "all">(
    isCoarseStatus(initialPipelineFilter) ? initialPipelineFilter : "all",
  );
  const [periodDays, setPeriodDays] = useState<number | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const today = new Date().toISOString().slice(0, 10);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<Lead | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [cutoff, setCutoff] = useState<number | null>(null);

  const canDelete = role === "admin";
  const canAssignManager = role === "rop" || role === "admin";
  const isAdmin = role === "admin";
  const isViewer = role === "viewer";
  const showDeleteControls = canDelete || isViewer;
  const showManagerDropdown = canAssignManager || isViewer;

  function canEditLead(lead: Lead) {
    return role !== "viewer" && (lead.pipeline_status !== "closed" || isAdmin);
  }

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("leads-table-changes")
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
              "id, name, contact, message, status, pipeline_status, archived, archived_at, assigned_manager_id, painting_id, created_at, paintings(title)",
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

  useEffect(() => {
    setCutoff(periodDays ? Date.now() - periodDays * 24 * 60 * 60 * 1000 : null);
  }, [periodDays]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const fromTime = dateFrom ? new Date(dateFrom).getTime() : null;
    const toTime = dateTo ? new Date(dateTo).getTime() + 24 * 60 * 60 * 1000 : null;

    return leads.filter((l) => {
      if (statusFilter !== "all" && l.pipeline_status !== statusFilter) return false;
      const createdAt = new Date(l.created_at).getTime();
      if (cutoff && createdAt < cutoff) return false;
      if (fromTime && createdAt < fromTime) return false;
      if (toTime && createdAt > toTime) return false;
      if (!q) return true;
      return (
        l.name.toLowerCase().includes(q) ||
        l.contact.toLowerCase().includes(q) ||
        (l.paintings?.title.toLowerCase().includes(q) ?? false) ||
        (l.message?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [leads, search, statusFilter, cutoff, dateFrom, dateTo]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, cutoff, dateFrom, dateTo]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const allSelected = filtered.length > 0 && filtered.every((l) => selected.has(l.id));

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((l) => l.id)));
    }
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function changeStatus(leadId: string, pipeline_status: CoarseStatus) {
    const lead = leads.find((l) => l.id === leadId);
    const previous = leads;
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, pipeline_status } : l)));

    const supabase = createClient();
    const { error } = await supabase.from("leads").update({ pipeline_status }).eq("id", leadId);

    if (error) {
      setLeads(previous);
      return;
    }

    if (pipeline_status === "closed" && lead?.painting_id) {
      updatePainting(supabase, lead.painting_id, { is_available: false }).catch(() => {});
    }
  }

  async function assignManager(leadId: string, managerId: string | null) {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;
    const pipeline_status = managerId ? pipelineStatusAfterAssign(lead.pipeline_status) : lead.pipeline_status;

    const previous = leads;
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, assigned_manager_id: managerId, pipeline_status } : l)),
    );

    const supabase = createClient();
    const { error } = await supabase
      .from("leads")
      .update({ assigned_manager_id: managerId, pipeline_status })
      .eq("id", leadId);

    if (error) {
      setLeads(previous);
      alert("Не удалось назначить менеджера");
    }
  }

  async function confirmDeleteOne() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);

    const previous = leads;
    setLeads((prev) => prev.filter((l) => l.id !== target.id));

    const supabase = createClient();
    const { error } = await supabase.from("leads").delete().eq("id", target.id);
    if (error) setLeads(previous);
  }

  async function confirmBulkDeleteAction() {
    setConfirmBulkDelete(false);
    setBulkDeleting(true);
    const ids = [...selected];
    const previous = leads;
    setLeads((prev) => prev.filter((l) => !selected.has(l.id)));

    const supabase = createClient();
    const { error } = await supabase.from("leads").delete().in("id", ids);
    setBulkDeleting(false);

    if (error) {
      setLeads(previous);
      alert("Не удалось удалить выбранные заявки");
      return;
    }
    setSelected(new Set());
  }

  const newCount = leads.filter((l) => l.pipeline_status === "new").length;

  function exportCsv() {
    const header = ["Имя", "Контакт", "Картина", "Менеджер", "Статус", "Дата"];
    const rows = filtered.map((l) => [
      l.name,
      l.contact,
      l.paintings?.title ?? "",
      l.assigned_manager_id
        ? managers.find((m) => m.id === l.assigned_manager_id)?.full_name || ""
        : "",
      COARSE_STATUS_LABELS[l.pipeline_status],
      formatDate(l.created_at),
    ]);

    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Лиды</h1>
          <p className="mt-1 text-sm text-white/50">
            Всего: {leads.length} · Новых: {newCount}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-1">
            {PERIODS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setPeriodDays(p.days)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  periodDays === p.days
                    ? "bg-fuchsia-500/90 text-white"
                    : "border border-white/15 text-white/60 hover:border-white/30 hover:text-white"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setShowNewLead(true)}
            disabled={role === "viewer"}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs font-medium text-white/80 transition-colors hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-white/15 disabled:hover:text-white/80"
          >
            <Plus className="h-3.5 w-3.5" />
            Новый лид
          </button>
          <button
            type="button"
            onClick={exportCsv}
            disabled={filtered.length === 0}
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-400 px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Download className="h-3.5 w-3.5" />
            Экспорт CSV
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск по имени, контакту или картине…"
          className="min-w-[200px] flex-1 rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-fuchsia-400"
        />
        <SelectDropdown value={statusFilter} options={STATUS_FILTER_OPTIONS} onChange={setStatusFilter} />
        <input
          type="date"
          value={dateFrom}
          max={today}
          onChange={(e) => setDateFrom(e.target.value)}
          className="w-[132px] shrink-0 rounded-lg border border-white/15 bg-black/30 px-2 py-1.5 text-sm text-white outline-none transition-colors hover:border-white/30 [color-scheme:dark]"
        />
        <span className="shrink-0 text-sm text-white/50">—</span>
        <input
          type="date"
          value={dateTo}
          max={today}
          onChange={(e) => setDateTo(e.target.value)}
          className="w-[132px] shrink-0 rounded-lg border border-white/15 bg-black/30 px-2 py-1.5 text-sm text-white outline-none transition-colors hover:border-white/30 [color-scheme:dark]"
        />
        {(dateFrom || dateTo) && (
          <button
            type="button"
            onClick={() => {
              setDateFrom("");
              setDateTo("");
            }}
            title="Сбросить диапазон дат"
            className="shrink-0 text-white/40 transition-colors hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {showDeleteControls && (
        <div className="mt-3 flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2">
          <label className="flex items-center gap-2 text-sm text-white/70">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleAll}
              disabled={!canDelete}
              className="h-4 w-4 cursor-pointer accent-fuchsia-500 disabled:cursor-not-allowed disabled:opacity-50"
            />
            Выделить всех {selected.size > 0 ? `(${selected.size})` : ""}
          </label>
          <button
            type="button"
            onClick={() => setConfirmBulkDelete(true)}
            disabled={!canDelete || bulkDeleting || selected.size === 0}
            className="inline-flex items-center gap-1.5 rounded-full border border-red-400/40 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Удалить выбранных
          </button>
        </div>
      )}

      <div className="mt-4 space-y-2 lg:hidden">
        {paginated.map((lead) => (
          <div
            key={lead.id}
            onDoubleClick={() => router.push(`/admin/leads/${lead.id}`)}
            className="cursor-pointer rounded-2xl border border-white/10 bg-white/[0.02] p-3.5 transition-colors hover:bg-white/[0.04]"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 items-start gap-2.5">
                {showDeleteControls && (
                  <input
                    type="checkbox"
                    checked={selected.has(lead.id)}
                    onChange={() => toggleOne(lead.id)}
                    onClick={(e) => e.stopPropagation()}
                    disabled={!canDelete}
                    className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-fuchsia-500 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                )}
                <div className="min-w-0">
                  <p className="break-words font-medium text-white">{lead.name}</p>
                  <p className="break-words text-xs text-white/50">{lead.contact}</p>
                </div>
              </div>
              {showDeleteControls && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (canDelete) setDeleteTarget(lead);
                  }}
                  disabled={!canDelete}
                  className="shrink-0 text-white/30 transition-colors hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-white/30"
                  aria-label="Удалить заявку"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/50">
              <span className="truncate">{lead.paintings?.title ?? "—"}</span>
              <span className="whitespace-nowrap">{formatDate(lead.created_at)}</span>
            </div>

            <div
              className="mt-2.5 flex flex-wrap items-center gap-2"
              onClick={(e) => e.stopPropagation()}
              onDoubleClick={(e) => e.stopPropagation()}
            >
              {showManagerDropdown ? (
                <ManagerDropdown
                  value={lead.assigned_manager_id}
                  managers={managers}
                  onChange={(managerId) => assignManager(lead.id, managerId)}
                  disabled={!canAssignManager}
                />
              ) : (
                <span className="text-sm text-white/60">
                  {lead.assigned_manager_id
                    ? managers.find((m) => m.id === lead.assigned_manager_id)?.full_name || "Без имени"
                    : "Не назначен"}
                </span>
              )}
              <StatusDropdown
                value={lead.pipeline_status}
                options={COARSE_STATUS_OPTIONS}
                onChange={(status) => changeStatus(lead.id, status)}
                disabled={!canEditLead(lead)}
              />
            </div>
          </div>
        ))}

        {paginated.length === 0 && (
          <p className="rounded-2xl border border-white/10 bg-white/[0.02] px-3 py-10 text-center text-sm text-white/40">
            {search || statusFilter !== "all" ? "Ничего не найдено" : "Заявок пока нет"}
          </p>
        )}
      </div>

      <div className="mt-4 hidden overflow-x-auto rounded-2xl border border-white/10 lg:block">
        <table className="w-full min-w-[720px] table-fixed text-left text-sm">
          <colgroup>
            {showDeleteControls && <col className="w-10" />}
            <col className="w-[26%]" />
            <col className="w-[18%]" />
            <col className="w-[180px]" />
            <col className="w-[150px]" />
            <col className="w-[140px]" />
            {showDeleteControls && <col className="w-10" />}
          </colgroup>
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.03] text-xs text-white/40">
              {showDeleteControls && <th className="w-10 px-3 py-3" />}
              <th className="px-3 py-3 font-medium">Контакт</th>
              <th className="px-3 py-3 font-medium">Картина</th>
              <th className="px-3 py-3 font-medium">Менеджер</th>
              <th className="px-3 py-3 font-medium">Статус</th>
              <th className="px-3 py-3 font-medium">Дата</th>
              {showDeleteControls && <th className="w-10 px-3 py-3" />}
            </tr>
          </thead>
          <tbody>
            {paginated.map((lead) => (
              <tr
                key={lead.id}
                onDoubleClick={() => router.push(`/admin/leads/${lead.id}`)}
                className="cursor-pointer border-b border-white/5 last:border-0 hover:bg-white/[0.02]"
              >
                {showDeleteControls && (
                  <td className="px-3 py-3" onDoubleClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selected.has(lead.id)}
                      onChange={() => toggleOne(lead.id)}
                      disabled={!canDelete}
                      className="h-4 w-4 cursor-pointer accent-fuchsia-500 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </td>
                )}
                <td className="max-w-[220px] px-3 py-3">
                  <p className="break-words font-medium text-white">{lead.name}</p>
                  <p className="break-words text-xs text-white/50">{lead.contact}</p>
                </td>
                <td className="truncate px-3 py-3 text-white/70">{lead.paintings?.title ?? "—"}</td>
                <td className="px-3 py-3" onDoubleClick={(e) => e.stopPropagation()}>
                  {showManagerDropdown ? (
                    <ManagerDropdown
                      value={lead.assigned_manager_id}
                      managers={managers}
                      onChange={(managerId) => assignManager(lead.id, managerId)}
                      disabled={!canAssignManager}
                    />
                  ) : (
                    <span className="text-white/60">
                      {lead.assigned_manager_id
                        ? managers.find((m) => m.id === lead.assigned_manager_id)?.full_name || "Без имени"
                        : "Не назначен"}
                    </span>
                  )}
                </td>
                <td className="px-3 py-3" onDoubleClick={(e) => e.stopPropagation()}>
                  <StatusDropdown
                    value={lead.pipeline_status}
                    options={COARSE_STATUS_OPTIONS}
                    onChange={(status) => changeStatus(lead.id, status)}
                    disabled={!canEditLead(lead)}
                  />
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-white/50">{formatDate(lead.created_at)}</td>
                {showDeleteControls && (
                  <td className="px-3 py-3">
                    <button
                      type="button"
                      onClick={() => canDelete && setDeleteTarget(lead)}
                      disabled={!canDelete}
                      className="text-white/30 transition-colors hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-white/30"
                      aria-label="Удалить заявку"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                )}
              </tr>
            ))}

            {paginated.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-10 text-center text-sm text-white/40">
                  {search || statusFilter !== "all" ? "Ничего не найдено" : "Заявок пока нет"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {filtered.length > 0 && (
        <div className="sticky bottom-16 z-10 mt-3 flex items-center justify-between rounded-xl border border-white/10 bg-[#0e0c12]/95 px-3 py-2.5 text-sm text-white/50 backdrop-blur md:bottom-0">
          <span>
            {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} из{" "}
            {filtered.length}
          </span>
          {pageCount > 1 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-lg border border-white/15 p-1.5 text-white/60 transition-colors hover:border-white/30 hover:text-white disabled:opacity-30"
                aria-label="Предыдущая страница"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="min-w-6 text-center text-white/80">{currentPage}</span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                disabled={currentPage === pageCount}
                className="rounded-lg border border-white/15 p-1.5 text-white/60 transition-colors hover:border-white/30 hover:text-white disabled:opacity-30"
                aria-label="Следующая страница"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Удалить заявку?"
          message={<>Вы точно хотите удалить заявку от «{deleteTarget.name}»? Это действие необратимо.</>}
          confirmLabel="Удалить"
          confirmVariant="danger"
          onConfirm={confirmDeleteOne}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {confirmBulkDelete && (
        <ConfirmModal
          title="Удалить выбранные заявки?"
          message={<>Будет удалено заявок: {selected.size}. Это действие необратимо.</>}
          confirmLabel="Удалить"
          confirmVariant="danger"
          onConfirm={confirmBulkDeleteAction}
          onCancel={() => setConfirmBulkDelete(false)}
        />
      )}

      {showNewLead && (
        <NewLeadModal
          paintings={paintings}
          onClose={() => setShowNewLead(false)}
          onCreated={(lead) => {
            setLeads((prev) => [lead, ...prev]);
            setShowNewLead(false);
          }}
        />
      )}
    </div>
  );
}
