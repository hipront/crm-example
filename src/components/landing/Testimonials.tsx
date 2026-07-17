"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Reveal from "@/components/landing/Reveal";
import Spotlight from "@/components/landing/Spotlight";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";

const ACCENTS = [
  { color: "#e879f9", gradient: "linear-gradient(135deg,#e879f9,#c026d3)" },
  { color: "#22d3ee", gradient: "linear-gradient(135deg,#22d3ee,#0891b2)" },
  { color: "#c084fc", gradient: "linear-gradient(135deg,#c084fc,#7e22ce)" },
];

const TESTIMONIALS = [
  { quote: "Картина полностью преобразила гостиную — гости всегда спрашивают, где взяли", name: "Анна", city: "Москва" },
  { quote: "Упаковка на высоте, доставили аккуратно за 4 дня в другой город", name: "Дмитрий", city: "Казань" },
  { quote: "Заказывала в подарок — автор помог выбрать по описанию интерьера", name: "Марина", city: "Санкт-Петербург" },
  { quote: "Взяла картину для студии — цвета вживую даже ярче, чем на фото", name: "Ольга", city: "Екатеринбург" },
  { quote: "Долго выбирал между тремя работами, автор помог определиться по фото стены", name: "Игорь", city: "Новосибирск" },
  { quote: "Заказ пришёл раньше срока, коробка ни капли не помялась", name: "Полина", city: "Сочи" },
].map((t, i) => ({ ...t, initial: t.name[0], accent: ACCENTS[i % ACCENTS.length] }));

const PAGE_SIZE = 3;
const PAGE_COUNT = Math.ceil(TESTIMONIALS.length / PAGE_SIZE);

export default function Testimonials() {
  const [page, setPage] = useState(0);
  const visible = TESTIMONIALS.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <Reveal id="testimonials" className="mx-auto w-full max-w-[1160px] px-7 pt-24">
      <h2 className="text-center font-heading text-[clamp(24px,3vw,32px)] font-semibold tracking-[-0.015em] text-ink-foreground">
        Что говорят покупатели
      </h2>

      <AnimatePresence initial={false}>
        <motion.div
          key={page}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, position: "absolute" }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="relative mt-11 grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-6"
        >
          {visible.map((t) => (
            <Spotlight key={t.name + t.city} lift={false} className="p-[30px] px-[26px] pb-[26px]">
              <div className="absolute inset-x-0 -top-[30px] h-[3px]" style={{ background: t.accent.gradient }} />
              <span className="font-heading text-[44px] leading-none opacity-50" style={{ color: t.accent.color }}>
                &quot;
              </span>
              <p className="mt-0.5 text-[15px] leading-[1.6] text-ink-foreground/80">{t.quote}</p>
              <div className="mt-5 flex items-center gap-3">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-heading text-[13px] font-bold text-ink"
                  style={{ background: t.accent.gradient }}
                >
                  {t.initial}
                </div>
                <div>
                  <p className="text-[13.5px] font-semibold text-ink-foreground/90">{t.name}</p>
                  <p className="mt-0.5 text-xs text-ink-foreground/40">{t.city}</p>
                </div>
              </div>
            </Spotlight>
          ))}
        </motion.div>
      </AnimatePresence>

      <div className="mt-9 flex items-center justify-center gap-5">
        <button
          type="button"
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
          aria-label="Предыдущие отзывы"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/14 bg-white/[0.03] text-ink-foreground transition-all duration-750 hover:border-brand-fuchsia/60 hover:bg-brand-fuchsia/14 hover:text-[#f0abfc] active:scale-[0.92] disabled:opacity-30"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </button>
        <div className="flex gap-2">
          {Array.from({ length: PAGE_COUNT }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setPage(i)}
              className="h-2 rounded-full border-none transition-all duration-550 hover:opacity-75"
              style={{
                width: i === page ? 24 : 8,
                background: i === page ? "linear-gradient(90deg,#e879f9,#22d3ee)" : "rgba(255,255,255,0.18)",
              }}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => setPage((p) => Math.min(PAGE_COUNT - 1, p + 1))}
          disabled={page === PAGE_COUNT - 1}
          aria-label="Следующие отзывы"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/14 bg-white/[0.03] text-ink-foreground transition-all duration-750 hover:border-brand-fuchsia/60 hover:bg-brand-fuchsia/14 hover:text-[#f0abfc] active:scale-[0.92] disabled:opacity-30"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>
    </Reveal>
  );
}
