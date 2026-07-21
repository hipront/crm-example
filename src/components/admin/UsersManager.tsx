"use client";

import { useState } from "react";
import { ShieldOff, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  ROLES,
  ROLE_LABELS,
  updateProfileActive,
  updateProfileName,
  updateProfileRole,
  type Profile,
  type Role,
} from "@/lib/profiles";
import ConfirmModal from "@/components/admin/ConfirmModal";

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

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск по имени или email…"
          className="w-64 rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-fuchsia-400"
        />
        <p className="text-sm text-white/50">
          {visible.length} из {profiles.length}
        </p>
      </div>

      <div className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/5">
        {visible.map((p) => {
          const isSelf = p.id === currentUserId;
          return (
            <div key={p.id} className={`flex items-center gap-4 p-4 ${!p.is_active ? "opacity-50" : ""}`}>
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
              <span className="hidden shrink-0 text-xs text-white/30 sm:block">
                с {formatDate(p.created_at)}
              </span>
              <select
                value={p.role}
                disabled={!canEdit || isSelf || savingId === p.id}
                onChange={(e) => handleRoleChange(p.id, e.target.value as Role)}
                title={!canEdit ? undefined : isSelf ? "Нельзя изменить собственную роль" : undefined}
                className="w-36 shrink-0 rounded-lg border border-white/15 bg-black/30 px-2.5 py-1.5 text-sm text-white outline-none transition-colors hover:border-white/30 focus:border-fuchsia-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-white/15"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </option>
                ))}
              </select>
              {canEdit && !isSelf && (
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
              )}
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
    </div>
  );
}
