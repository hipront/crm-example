"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import type { Painting } from "@/lib/paintings";
import { ChevronDownIcon } from "@/components/icons";
import { useOrderContext } from "@/components/landing/OrderContext";
import Spotlight from "@/components/landing/Spotlight";

type Status = "idle" | "sending" | "sent" | "error";

function priceLabel(price: number) {
  return price.toLocaleString("ru-RU") + " ₽";
}

const TRUST_BADGES = [
  { icon: "✦", label: "Единственный экземпляр" },
  { icon: "◈", label: "Бережная упаковка" },
  { icon: "◎", label: "Ответим в течение дня" },
];

export default function OrderForm({ paintings }: { paintings: Painting[] }) {
  const { selectedPaintingId, setSelectedPaintingId } = useOrderContext();
  const [status, setStatus] = useState<Status>("idle");
  const [nameError, setNameError] = useState("");
  const [contactError, setContactError] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerQuery, setPickerQuery] = useState("");
  const pickerRootRef = useRef<HTMLLabelElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (pickerOpen && pickerRootRef.current && !pickerRootRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [pickerOpen]);

  const selectedPainting = paintings.find((p) => p.id === selectedPaintingId) ?? null;
  const pickerResults = paintings
    .filter((p) => p.title.toLowerCase().includes(pickerQuery.trim().toLowerCase()))
    .slice(0, 8);

  function validate(formData: FormData) {
    const name = (formData.get("name") as string).trim();
    const contact = (formData.get("contact") as string).trim();
    let nameErr = "";
    let contactErr = "";
    if (!name) nameErr = "Укажите имя";
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneDigits = contact.replace(/\D/g, "");
    if (!contact) contactErr = "Укажите телефон или email";
    else if (!emailRe.test(contact) && phoneDigits.length < 10) contactErr = "Введите корректный телефон или email";
    return { nameErr, contactErr };
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const { nameErr, contactErr } = validate(formData);
    setNameError(nameErr);
    setContactError(contactErr);
    if (nameErr || contactErr) return;

    setStatus("sending");
    const { error } = await supabase.from("leads").insert({
      name: formData.get("name") as string,
      contact: formData.get("contact") as string,
      painting_id: selectedPaintingId || null,
      message: formData.get("message") as string,
    });

    setStatus(error ? "error" : "sent");
  }

  if (status === "sent") {
    return (
      <div className="mt-10 rounded-[18px] border border-brand-fuchsia/25 bg-[linear-gradient(160deg,rgba(232,121,249,0.08),rgba(34,211,238,0.04))] p-10 text-center">
        <p className="text-lg font-semibold text-ink-foreground">Спасибо! Заявка отправлена.</p>
        <p className="mt-2 text-[14.5px] text-ink-foreground/60">Мы свяжемся с вами в ближайшее время.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 grid gap-4 rounded-[20px] border border-white/8 bg-white/[0.03] p-8">
      <div className="grid gap-4 min-[761px]:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-[13.5px] text-ink-foreground/60">
          Имя
          <input
            name="name"
            type="text"
            placeholder="Как к вам обращаться"
            className={`rounded-[11px] border bg-black/35 px-3.5 py-2.5 text-[14.5px] text-ink-foreground outline-none transition-[border-color,box-shadow] duration-200 focus:border-brand-fuchsia focus:shadow-[0_0_0_3px_rgba(232,121,249,0.15)] ${
              nameError ? "border-red-400 shadow-[0_0_0_3px_rgba(251,113,133,0.15)]" : "border-white/12"
            }`}
          />
          {nameError && <span className="text-xs text-red-400">{nameError}</span>}
        </label>
        <label className="flex flex-col gap-1.5 text-[13.5px] text-ink-foreground/60">
          Телефон или email
          <input
            name="contact"
            type="text"
            placeholder="+7 999 000-00-00"
            className={`rounded-[11px] border bg-black/35 px-3.5 py-2.5 text-[14.5px] text-ink-foreground outline-none transition-[border-color,box-shadow] duration-200 focus:border-brand-fuchsia focus:shadow-[0_0_0_3px_rgba(232,121,249,0.15)] ${
              contactError ? "border-red-400 shadow-[0_0_0_3px_rgba(251,113,133,0.15)]" : "border-white/12"
            }`}
          />
          {contactError && <span className="text-xs text-red-400">{contactError}</span>}
        </label>
      </div>

      <label className="relative flex flex-col gap-1.5 text-[13.5px] text-ink-foreground/60" ref={pickerRootRef}>
        Картина
        <button
          type="button"
          onClick={() => {
            setPickerOpen((v) => !v);
            setPickerQuery("");
          }}
          className={`flex w-full items-center gap-2.5 rounded-[11px] border px-3.5 py-[9px] text-left text-[14.5px] text-ink-foreground outline-none transition-[border-color,background] duration-200 active:scale-[0.98] ${
            pickerOpen ? "border-brand-fuchsia/60 bg-brand-fuchsia/8" : "border-white/12 bg-black/35 hover:border-brand-fuchsia/40"
          }`}
        >
          {selectedPainting && (
            <span className="relative block h-7 w-7 shrink-0 overflow-hidden rounded-md">
              <Image src={selectedPainting.image_url} alt="" fill className="object-cover" />
            </span>
          )}
          <span className={`flex-1 ${selectedPainting ? "text-ink-foreground" : "text-ink-foreground/40"}`}>
            {selectedPainting ? `${selectedPainting.title} — ${priceLabel(selectedPainting.price)}` : "Выберем позже / любая"}
          </span>
          <ChevronDownIcon
            className="h-4 w-4 shrink-0 opacity-50 transition-transform duration-250"
            style={{ transform: pickerOpen ? "rotate(180deg)" : "rotate(0deg)" }}
          />
        </button>

        <AnimatePresence>
          {pickerOpen && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 right-0 top-[calc(100%+6px)] z-40 overflow-hidden rounded-xl border border-white/12 bg-[#16161a] shadow-[0_20px_44px_-16px_rgba(0,0,0,0.6)]"
            >
              <input
                value={pickerQuery}
                onChange={(e) => setPickerQuery(e.target.value)}
                type="text"
                placeholder="Поиск по названию…"
                className="w-full border-0 border-b border-white/8 bg-transparent px-3.5 py-3 text-sm text-ink-foreground outline-none"
              />
              <div className="max-h-[280px] overflow-y-auto">
                <div
                  onClick={() => {
                    setSelectedPaintingId("");
                    setPickerOpen(false);
                  }}
                  className="cursor-pointer px-3.5 py-2.5 text-sm text-ink-foreground/75 hover:bg-brand-fuchsia/10"
                >
                  Выберем позже / любая
                </div>
                {pickerResults.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      setSelectedPaintingId(p.id);
                      setPickerOpen(false);
                    }}
                    className="flex cursor-pointer items-center gap-2.5 px-3.5 py-2 hover:bg-brand-fuchsia/10"
                  >
                    <span className="relative block h-8 w-8 shrink-0 overflow-hidden rounded-md">
                      <Image
                        src={p.image_url}
                        alt=""
                        fill
                        className="object-cover"
                        style={!p.is_available ? { filter: "grayscale(0.85) brightness(0.6)" } : undefined}
                      />
                    </span>
                    <span className="flex-1 text-[13.5px] text-ink-foreground">{p.title}</span>
                    <span className="text-[12.5px] text-ink-foreground/45">
                      {p.is_available ? priceLabel(p.price) : "продано"}
                    </span>
                  </div>
                ))}
                {pickerResults.length === 0 && (
                  <div className="p-3.5 text-center text-[13px] text-ink-foreground/40">Не найдено</div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </label>

      <label className="flex flex-col gap-1.5 text-[13.5px] text-ink-foreground/60">
        Комментарий
        <textarea
          name="message"
          rows={3}
          placeholder="Что-то ещё, что нам стоит знать?"
          className="resize-none rounded-[11px] border border-white/12 bg-black/35 px-3.5 py-[11px] text-[14.5px] text-ink-foreground outline-none transition-[border-color,box-shadow] duration-200 focus:border-brand-fuchsia focus:shadow-[0_0_0_3px_rgba(232,121,249,0.15)]"
        />
      </label>

      {status === "error" && (
        <p className="text-[13.5px] text-red-400">Не получилось отправить заявку. Попробуйте ещё раз.</p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-1 rounded-full bg-gradient-brand py-[14px] text-[15px] font-semibold text-ink transition-[opacity,box-shadow,transform] duration-200 hover:opacity-90 hover:shadow-[0_0_32px_rgba(232,121,249,0.45)] active:scale-[0.97] disabled:opacity-50"
      >
        {status === "sending" ? "Отправляем…" : "Оставить заявку"}
      </button>
    </form>
  );
}

export function OrderTrustBadges() {
  return (
    <div className="mt-8 grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3.5">
      {TRUST_BADGES.map((badge) => (
        <Spotlight key={badge.label} className="px-3 py-4 text-center">
          <div className="text-xl">{badge.icon}</div>
          <p className="mt-1.5 text-[12.5px] text-ink-foreground/55">{badge.label}</p>
        </Spotlight>
      ))}
    </div>
  );
}
