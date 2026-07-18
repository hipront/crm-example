"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ROLES, ROLE_LABELS, updateProfileName, updateProfileRole, type Profile, type Role } from "@/lib/profiles";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function UsersManager({
  initialProfiles,
  currentUserId,
}: {
  initialProfiles: Profile[];
  currentUserId: string;
}) {
  const [profiles, setProfiles] = useState(initialProfiles);
  const [search, setSearch] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

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

  return (
    <div className="space-y-6">
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
            <div key={p.id} className="flex items-center gap-4 p-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <input
                    defaultValue={p.full_name ?? ""}
                    onBlur={(e) => handleNameChange(p.id, e.target.value.trim())}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") e.currentTarget.blur();
                    }}
                    placeholder="Без имени"
                    className="w-full min-w-0 rounded-lg border border-transparent bg-transparent px-1.5 py-0.5 font-medium text-white outline-none transition-colors hover:border-white/15 focus:border-fuchsia-400 focus:bg-black/30"
                  />
                  {isSelf && <span className="shrink-0 text-xs text-fuchsia-300">(вы)</span>}
                </div>
                <p className="truncate px-1.5 text-sm text-white/50">{p.email || "—"}</p>
              </div>
              <span className="hidden shrink-0 text-xs text-white/30 sm:block">
                с {formatDate(p.created_at)}
              </span>
              <select
                value={p.role}
                disabled={isSelf || savingId === p.id}
                onChange={(e) => handleRoleChange(p.id, e.target.value as Role)}
                title={isSelf ? "Нельзя изменить собственную роль" : undefined}
                className="w-36 shrink-0 rounded-lg border border-white/15 bg-black/30 px-2.5 py-1.5 text-sm text-white outline-none transition-colors hover:border-white/30 focus:border-fuchsia-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-white/15"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
        {visible.length === 0 && (
          <p className="p-8 text-center text-sm text-white/40">Ничего не найдено по «{search}»</p>
        )}
      </div>
    </div>
  );
}
