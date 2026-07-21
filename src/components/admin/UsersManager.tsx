"use client";

import { useState } from "react";
import { Plus, ShieldOff, ShieldCheck, Trash2, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  ROLES,
  ASSIGNABLE_ROLES,
  ROLE_LABELS,
  deleteEmployee,
  updateProfileActive,
  updateProfileName,
  updateProfileRole,
  type Profile,
  type Role,
} from "@/lib/profiles";
import ConfirmModal from "@/components/admin/ConfirmModal";
import AddEmployeeModal from "@/components/admin/AddEmployeeModal";
import SelectDropdown from "@/components/admin/SelectDropdown";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function UsersManager({
  initialProfiles,
  currentUserId,
  canEdit,
}: {
  initialProfiles: Profile[];
  currentUserId: string;
  canEdit: boolean;
}) {
  const [profiles, setProfiles] = useState(initialProfiles);
  const [search, setSearch] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [blockTarget, setBlockTarget] = useState<Profile | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Profile | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const visible = profiles.filter((p) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (p.full_name?.toLowerCase().includes(q) ?? false) || (p.email?.toLowerCase().includes(q) ?? false);
  });

  async function handleRoleChange(id: string, role: Role) {
    const previous = profiles;
    setProfiles((prev) => prev.map((p) => (p.id === id ? { ...p, role } : p)));
    setSavingId(id);

    try {
      const supabase = createClient();
      await updateProfileRole(supabase, id, role);
    } catch (err) {
      setProfiles(previous);
      alert(err instanceof Error ? err.message : "Не удалось изменить роль");
    } finally {
      setSavingId(null);
    }
  }

  async function handleNameChange(id: string, fullName: string) {
    const previous = profiles.find((p) => p.id === id)?.full_name ?? null;
    if (previous === fullName || (!previous && !fullName)) return;
    setProfiles((prev) => prev.map((p) => (p.id === id ? { ...p, full_name: fullName || null } : p)));

    try {
      const supabase = createClient();
      await updateProfileName(supabase, id, fullName);
    } catch (err) {
      setProfiles((prev) => prev.map((p) => (p.id === id ? { ...p, full_name: previous } : p)));
      alert(err instanceof Error ? err.message : "Не удалось изменить имя");
    }
  }

  async function handleToggleActive(p: Profile) {
    setBlockTarget(null);
    const nextActive = !p.is_active;
    const previous = profiles;
    setProfiles((prev) => prev.map((x) => (x.id === p.id ? { ...x, is_active: nextActive } : x)));

    try {
      const supabase = createClient();
      await updateProfileActive(supabase, p.id, nextActive);
    } catch (err) {
      setProfiles(previous);
      alert(err instanceof Error ? err.message : "Не удалось изменить доступ");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);

    try {
      await deleteEmployee(deleteTarget.id);
      setProfiles((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Не удалось удалить сотрудника");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск по имени или email…"
          className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-fuchsia-400 sm:w-64"
        />
        <div className="flex items-center gap-3">
          <p className="text-sm text-white/50">
            {visible.length} из {profiles.length}
          </p>
          {canEdit && (
            <button
              type="button"
              onClick={() => setShowAdd(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs font-medium text-white/80 transition-colors hover:border-white/30 hover:text-white"
            >
              <Plus className="h-3.5 w-3.5" />
              Добавить сотрудника
            </button>
          )}
        </div>
      </div>

      <div className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/5">
        {visible.map((p) => {
          const isSelf = p.id === currentUserId;
          return (
            <div
              key={p.id}
              className={`flex flex-col gap-3 p-4 transition-colors hover:bg-white/[0.04] sm:flex-row sm:items-center sm:gap-4 ${!p.is_active ? "opacity-50" : ""}`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <input
                    defaultValue={p.full_name ?? ""}
                    disabled={!canEdit}
                    onBlur={(e) => handleNameChange(p.id, e.target.value.trim())}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") e.currentTarget.blur();
                    }}
                    placeholder="Без имени"
                    className="w-full min-w-0 rounded-lg border border-transparent bg-transparent px-1.5 py-0.5 font-medium text-white outline-none transition-colors hover:border-white/15 focus:border-fuchsia-400 focus:bg-black/30 disabled:cursor-default disabled:hover:border-transparent"
                  />
                  {isSelf && <span className="shrink-0 text-xs text-fuchsia-300">(вы)</span>}
                  {!p.is_active && (
                    <span className="shrink-0 rounded-full border border-red-400/30 bg-red-400/10 px-2 py-0.5 text-xs text-red-300">
                      Заблокирован
                    </span>
                  )}
                </div>
                <p className="truncate px-1.5 text-sm text-white/50">{p.email || "—"}</p>
              </div>

              <div className="flex items-center justify-between gap-2 sm:shrink-0 sm:justify-end sm:gap-3">
                <span className="hidden shrink-0 text-xs text-white/30 sm:block">
                  с {formatDate(p.created_at)}
                </span>
                <div className="shrink-0">
                  <SelectDropdown
                    value={p.role}
                    disabled={!canEdit || isSelf || savingId === p.id}
                    onChange={(role) => handleRoleChange(p.id, role)}
                    title={!canEdit ? undefined : isSelf ? "Нельзя изменить собственную роль" : undefined}
                    options={(p.role === "admin" ? ROLES : ASSIGNABLE_ROLES).map((r) => ({
                      value: r,
                      label: ROLE_LABELS[r],
                    }))}
                    minWidth={128}
                  />
                </div>
                {canEdit && !isSelf && (
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setBlockTarget(p)}
                      className={`shrink-0 rounded-lg p-1.5 transition-colors ${
                        p.is_active
                          ? "text-white/40 hover:bg-red-500/10 hover:text-red-400"
                          : "text-emerald-400/70 hover:bg-emerald-500/10 hover:text-emerald-400"
                      }`}
                      aria-label={p.is_active ? "Заблокировать" : "Разблокировать"}
                      title={p.is_active ? "Заблокировать" : "Разблокировать"}
                    >
                      {p.is_active ? <ShieldOff className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteError(null);
                        setDeleteTarget(p);
                      }}
                      className="shrink-0 rounded-lg p-1.5 text-white/40 transition-colors hover:bg-red-500/10 hover:text-red-400"
                      aria-label="Удалить сотрудника"
                      title="Удалить безвозвратно"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {visible.length === 0 && (
          <p className="p-8 text-center text-sm text-white/40">Ничего не найдено по «{search}»</p>
        )}
      </div>

      {blockTarget && (
        <ConfirmModal
          title={blockTarget.is_active ? "Заблокировать пользователя?" : "Разблокировать пользователя?"}
          message={
            blockTarget.is_active ? (
              <>
                «{blockTarget.full_name || blockTarget.email}» немедленно потеряет доступ к админке. Его лиды,
                история и назначения останутся без изменений — это обратимо, доступ можно вернуть в любой момент.
              </>
            ) : (
              <>«{blockTarget.full_name || blockTarget.email}» снова сможет войти в админку.</>
            )
          }
          confirmLabel={blockTarget.is_active ? "Заблокировать" : "Разблокировать"}
          confirmVariant={blockTarget.is_active ? "danger" : "brand"}
          onConfirm={() => handleToggleActive(blockTarget)}
          onCancel={() => setBlockTarget(null)}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Удалить сотрудника?"
          message={
            <>
              Аккаунт «{deleteTarget.full_name || deleteTarget.email}» будет удалён безвозвратно — он больше не
              сможет войти, даже с правильным паролем. Если нужно временно закрыть доступ и потом вернуть — лучше
              использовать «Заблокировать».
              {deleting && (
                <span className="mt-2 flex items-center gap-1.5 text-white/50">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Удаляем…
                </span>
              )}
              {deleteError && <span className="mt-2 block text-red-400">{deleteError}</span>}
            </>
          }
          confirmLabel="Удалить"
          confirmDisabled={deleting}
          confirmVariant="danger"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {showAdd && (
        <AddEmployeeModal
          onCreated={(profile) => {
            setProfiles((prev) => [...prev, profile]);
            setShowAdd(false);
          }}
          onClose={() => setShowAdd(false)}
        />
      )}
    </div>
  );
}
