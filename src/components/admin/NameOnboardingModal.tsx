"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { updateProfileName } from "@/lib/profiles";
import { useLockBodyScroll } from "@/lib/useLockBodyScroll";

export default function NameOnboardingModal({ userId, hasName }: { userId: string; hasName: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(!hasName);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useLockBodyScroll(open);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    if (!fullName) {
      setError("Введите имя и фамилию");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const supabase = createClient();
      await updateProfileName(supabase, userId, fullName);
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось сохранить имя");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#141018] p-6 shadow-2xl"
      >
        <h3 className="text-lg font-semibold">Как к вам обращаться?</h3>
        <p className="mt-1.5 text-sm text-white/60">
          Укажите имя и фамилию — они будут видны остальным в канбане и в списке пользователей.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <input
            autoFocus
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Имя"
            className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-white outline-none focus:border-fuchsia-400"
          />
          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Фамилия"
            className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-white outline-none focus:border-fuchsia-400"
          />
        </div>
        {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="mt-4 w-full rounded-full bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-400 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Сохраняем…" : "Сохранить"}
        </button>
      </form>
    </div>
  );
}
