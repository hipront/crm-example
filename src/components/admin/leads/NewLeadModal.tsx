"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { type Lead } from "@/lib/leads";
import type { Painting } from "@/lib/paintings";

function priceLabel(price: number) {
  return price.toLocaleString("ru-RU") + " ₽";
}

function PaintingPicker({
  paintings,
  value,
  onChange,
}: {
  paintings: Painting[];
  value: string;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = paintings.find((p) => p.id === value) ?? null;

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
    if (!q) return paintings;
    return paintings.filter((p) => p.title.toLowerCase().includes(q));
  }, [paintings, query]);

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
        {selected && (
          <img src={selected.image_url} alt="" className="h-7 w-7 shrink-0 rounded-md object-cover" />
        )}
        <span className={`flex-1 truncate ${selected ? "text-white" : "text-white/40"}`}>
          {selected ? `${selected.title} — ${priceLabel(selected.price)}` : "Выберем позже / любая"}
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
            placeholder="Поиск по названию…"
            className="w-full border-0 border-b border-white/10 bg-transparent px-3.5 py-3 text-sm text-white outline-none"
          />
          <div className="max-h-56 overflow-y-auto">
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className="w-full px-3.5 py-2.5 text-left text-sm text-white/60 hover:bg-white/10"
            >
              Выберем позже / любая
            </button>
            {results.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  onChange(p.id);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left hover:bg-white/10"
              >
                <img
                  src={p.image_url}
                  alt=""
                  className="h-8 w-8 shrink-0 rounded-md object-cover"
                  style={!p.is_available ? { filter: "grayscale(0.85) brightness(0.6)" } : undefined}
                />
                <span className="min-w-0 flex-1 truncate text-sm text-white">{p.title}</span>
                <span className="shrink-0 whitespace-nowrap text-xs text-white/40">
                  {p.is_available ? priceLabel(p.price) : "продано"}
                </span>
              </button>
            ))}
            {results.length === 0 && (
              <p className="p-3.5 text-center text-sm text-white/30">Не найдено</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function NewLeadModal({
  paintings,
  onCreated,
  onClose,
}: {
  paintings: Painting[];
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
      .select("id, name, contact, message, status, pipeline_status, archived, archived_at, assigned_manager_id, painting_id, created_at, paintings(title)")
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
            <div className="mt-1">
              <PaintingPicker paintings={paintings} value={paintingId} onChange={setPaintingId} />
            </div>
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
