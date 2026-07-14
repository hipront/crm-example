"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Painting } from "@/lib/paintings";

export default function OrderForm({ paintings }: { paintings: Painting[] }) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");

    const formData = new FormData(e.currentTarget);
    const paintingId = formData.get("painting") as string;

    const { error } = await supabase.from("leads").insert({
      name: formData.get("name") as string,
      contact: formData.get("contact") as string,
      painting_id: paintingId || null,
      message: formData.get("message") as string,
    });

    setStatus(error ? "error" : "sent");
  }

  if (status === "sent") {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
        <p className="text-lg font-medium text-white">Спасибо! Заявка отправлена.</p>
        <p className="mt-2 text-sm text-white/60">Мы свяжемся с вами в ближайшее время.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm text-white/70">
          Имя
          <input
            required
            name="name"
            type="text"
            className="rounded-lg border border-white/15 bg-black/30 px-3.5 py-2.5 text-white placeholder-white/30 outline-none focus:border-fuchsia-400"
            placeholder="Как к вам обращаться"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-white/70">
          Телефон или email
          <input
            required
            name="contact"
            type="text"
            className="rounded-lg border border-white/15 bg-black/30 px-3.5 py-2.5 text-white placeholder-white/30 outline-none focus:border-fuchsia-400"
            placeholder="+7 999 000-00-00"
          />
        </label>
      </div>
      <label className="flex flex-col gap-1.5 text-sm text-white/70">
        Картина
        <select
          name="painting"
          className="rounded-lg border border-white/15 bg-black/30 px-3.5 py-2.5 text-white outline-none focus:border-fuchsia-400"
        >
          <option value="">Выберите картину (необязательно)</option>
          {paintings.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title} — {p.price.toLocaleString("ru-RU")} ₽
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1.5 text-sm text-white/70">
        Комментарий
        <textarea
          name="message"
          rows={3}
          className="resize-none rounded-lg border border-white/15 bg-black/30 px-3.5 py-2.5 text-white placeholder-white/30 outline-none focus:border-fuchsia-400"
          placeholder="Что-то ещё, что нам стоит знать?"
        />
      </label>
      {status === "error" && (
        <p className="text-sm text-red-400">Не получилось отправить заявку. Попробуйте ещё раз.</p>
      )}
      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-2 rounded-full bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-400 px-6 py-3 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {status === "sending" ? "Отправляем…" : "Оставить заявку"}
      </button>
    </form>
  );
}
