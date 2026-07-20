"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { type Lead } from "@/lib/leads";

export default function NewLeadModal({
  paintings,
  onCreated,
  onClose,
}: {
  paintings: { id: string; title: string }[];
  onCreated: (lead: Lead) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [paintingId, setPaintingId] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !contact.trim()) {
      setError("Укажите имя и контакт");
      return;
    }
    setSaving(true);
    setError(null);

    const supabase = createClient();
    const { data, error: dbError } = await supabase
      .from("leads")
      .insert({
        name: name.trim(),
        contact: contact.trim(),
        painting_id: paintingId || null,
        message: message.trim() || null,
      })
      .select("id, name, contact, message, status, assigned_manager_id, painting_id, created_at, paintings(title)")
      .single();

    setSaving(false);

    if (dbError || !data) {
      setError("Не удалось создать заявку");
      return;
    }

    onCreated(data as unknown as Lead);
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0e0c12] p-5 shadow-2xl"
      >
        <h3 className="text-lg font-semibold">Новый лид</h3>
        <p className="mt-1 text-xs text-white/50">Ручное добавление заявки (например, пришла по телефону).</p>

        <div className="mt-4 space-y-3">
          <div>
            <label className="text-xs text-white/40">Имя</label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-fuchsia-400"
            />
          </div>
          <div>
            <label className="text-xs text-white/40">Контакт (телефон/email)</label>
            <input
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-fuchsia-400"
            />
          </div>
          <div>
            <label className="text-xs text-white/40">Картина</label>
            <select
              value={paintingId}
              onChange={(e) => setPaintingId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-fuchsia-400"
            >
              <option value="">Без привязки</option>
              {paintings.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-white/40">Сообщение</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-fuchsia-400"
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
