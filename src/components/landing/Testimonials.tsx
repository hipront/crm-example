"use client";

import { useEffect, useRef, useState } from "react";
import { motion, type PanInfo } from "framer-motion";
import Reveal from "@/components/landing/Reveal";
import Spotlight from "@/components/landing/Spotlight";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";

const ACCENTS = [
  { color: "#c026d3", bar: "linear-gradient(90deg,#c026d3,#a21caf)" },
  { color: "#06b6d4", bar: "linear-gradient(90deg,#06b6d4,#0891b2)" },
  { color: "#8b5cf6", bar: "linear-gradient(90deg,#8b5cf6,#c026d3)" },
];

const TESTIMONIALS = [
  { quote: "Картина полностью преобразила гостиную — гости всегда спрашивают, где взяли", name: "Анна", city: "Москва", date: "март 2026" },
  { quote: "Упаковка на высоте, доставили аккуратно за 4 дня в другой город", name: "Дмитрий", city: "Казань", date: "февраль 2026" },
  { quote: "Заказывала в подарок — мне помогли выбрать по описанию интерьера", name: "Марина", city: "Санкт-Петербург", date: "январь 2026" },
  { quote: "Взяла картину для студии — цвета вживую даже ярче, чем на фото", name: "Ольга", city: "Екатеринбург", date: "декабрь 2025" },
  { quote: "Долго выбирал между тремя работами, мне помогли определиться по фото стены", name: "Игорь", city: "Новосибирск", date: "декабрь 2025" },
  { quote: "Заказ пришёл раньше срока, коробка ни капли не помялась", name: "Полина", city: "Сочи", date: "ноябрь 2025" },
  { quote: "Качество холста и цвета выше ожиданий за эту цену", name: "Сергей", city: "Краснодар", date: "октябрь 2025" },
  { quote: "Помогли подобрать размер под конкретную стену — очень удобно", name: "Елена", city: "Воронеж", date: "сентябрь 2025" },
  { quote: "Общение было приятным, ответили на все вопросы быстро", name: "Наталья", city: "Ростов-на-Дону", date: "август 2025" },
].map((t, i) => ({ ...t, initial: t.name[0], accent: ACCENTS[i % ACCENTS.length] }));

const DESKTOP_PAGE_SIZE = 3;
const MOBILE_PAGE_SIZE = 1;
const SWAP_DELAY = 200;
const STAGGER_STEP = 120;

export default function Testimonials() {
  const [pageSize, setPageSize] = useState(DESKTOP_PAGE_SIZE);
  const [page, setPage] = useState(0);
  const [cardsVisible, setCardsVisible] = useState(true);
  const swapTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 761px)");
    const applySize = () => {
      setPageSize(mql.matches ? DESKTOP_PAGE_SIZE : MOBILE_PAGE_SIZE);
      setPage(0);
    };
    applySize();
    mql.addEventListener("change", applySize);
    return () => mql.removeEventListener("change", applySize);
  }, []);

  useEffect(() => () => clearTimeout(swapTimeout.current), []);

  const pageCount = Math.ceil(TESTIMONIALS.length / pageSize);
  const visible = TESTIMONIALS.slice(page * pageSize, page * pageSize + pageSize);

  function changePage(getNext: (p: number) => number) {
    setCardsVisible(false);
    clearTimeout(swapTimeout.current);
    swapTimeout.current = setTimeout(() => {
      setPage(getNext);
      setCardsVisible(true);
    }, SWAP_DELAY);
  }

  function handleDragEnd(_e: unknown, info: PanInfo) {
    if (pageSize !== MOBILE_PAGE_SIZE) return;
    if (info.offset.x < -50) changePage((p) => (p + 1) % pageCount);
    else if (info.offset.x > 50) changePage((p) => (p - 1 + pageCount) % pageCount);
  }

  return (
    <Reveal id="testimonials" className="mx-auto w-full max-w-[1160px] px-7 pt-24">
      <h2 className="text-center font-heading text-[clamp(24px,3vw,32px)] font-semibold tracking-[-0.015em] text-ink-foreground">
        Что говорят покупатели
      </h2>

      <motion.div
        drag={pageSize === MOBILE_PAGE_SIZE ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.15}
        onDragEnd={handleDragEnd}
        className="mt-11 grid grid-cols-1 gap-6 min-[761px]:grid-cols-3">
        {visible.map((t, i) => (
          <Spotlight
            key={i}
            lift={false}
            className="flex h-[240px] flex-col p-[30px] px-[26px] pb-[26px]"
            style={{
              opacity: cardsVisible ? 1 : 0,
              transform: cardsVisible ? "translateY(0)" : "translateY(20px)",
              transition: `opacity 0.5s ease ${i * STAGGER_STEP}ms, transform 0.5s ease ${i * STAGGER_STEP}ms`,
            }}
            topBar={<div className="absolute inset-x-0 top-0 h-[3px]" style={{ background: t.accent.bar }} />}
          >
            <div className="flex h-full flex-col">
              <span className="text-[22px] leading-none" style={{ color: t.accent.color }}>
                ❝❝
              </span>
              <p className="mt-0.5 line-clamp-3 text-[15px] leading-[1.6] text-ink-foreground/80">{t.quote}</p>
              <div className="mt-auto flex items-center gap-3 pt-5">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-heading text-[13px] font-bold text-ink"
                  style={{ background: t.accent.bar }}
                >
                  {t.initial}
                </div>
                <div>
                  <p className="text-[13.5px] font-semibold text-ink-foreground/90">{t.name}</p>
                  <p className="mt-0.5 text-xs text-ink-foreground/40">
                    {t.city} · {t.date}
                  </p>
                </div>
              </div>
            </div>
          </Spotlight>
        ))}
      </motion.div>

      <div className="mt-9 flex items-center justify-center gap-5">
        <button
          type="button"
          onClick={() => changePage((p) => (p - 1 + pageCount) % pageCount)}
          aria-label="Предыдущие отзывы"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/14 bg-white/[0.03] text-ink-foreground transition-all duration-300 hover:border-brand-fuchsia/60 hover:bg-brand-fuchsia/14 hover:text-[#f0abfc] active:scale-[0.92]"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </button>
        <div className="flex gap-2">
          {Array.from({ length: pageCount }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => changePage(() => i)}
              className="h-2 rounded-full border-none transition-all duration-300 hover:opacity-75"
              style={{
                width: i === page ? 24 : 8,
                background: i === page ? "linear-gradient(90deg,#c026d3,#06b6d4)" : "rgba(255,255,255,0.18)",
              }}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => changePage((p) => (p + 1) % pageCount)}
          aria-label="Следующие отзывы"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/14 bg-white/[0.03] text-ink-foreground transition-all duration-300 hover:border-brand-fuchsia/60 hover:bg-brand-fuchsia/14 hover:text-[#f0abfc] active:scale-[0.92]"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>
    </Reveal>
  );
}
