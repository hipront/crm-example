"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import Reveal from "@/components/landing/Reveal";
import Spotlight from "@/components/landing/Spotlight";
import { ChevronDownIcon, CloseIcon } from "@/components/icons";
import { useOrderContext } from "@/components/landing/OrderContext";
import type { Painting } from "@/lib/paintings";

type SortMode = "default" | "price_asc" | "price_desc";

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: "default", label: "По умолчанию" },
  { value: "price_asc", label: "Цена: сначала дешевле" },
  { value: "price_desc", label: "Цена: сначала дороже" },
];

const PAGE_SIZE = 6;

function priceLabel(price: number) {
  return price.toLocaleString("ru-RU") + " ₽";
}

export default function Catalog({ paintings }: { paintings: Painting[] }) {
  const { requestPainting } = useOrderContext();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortMode>("default");
  const [sortOpen, setSortOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [activeId, setActiveId] = useState<string | null>(null);
  const sortRootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (sortOpen && sortRootRef.current && !sortRootRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [sortOpen]);

  let filtered = paintings.filter((p) => p.title.toLowerCase().includes(search.trim().toLowerCase()));
  if (sort === "price_asc") filtered = [...filtered].sort((a, b) => a.price - b.price);
  if (sort === "price_desc") filtered = [...filtered].sort((a, b) => b.price - a.price);

  const noResults = filtered.length === 0;
  const visible = filtered.slice(0, visibleCount);
  const hasMore = filtered.length > visibleCount;
  const allShown = filtered.length > 0 && filtered.length <= visibleCount && filtered.length > PAGE_SIZE;

  const activePainting = paintings.find((p) => p.id === activeId) ?? null;
  const currentSortLabel = SORT_OPTIONS.find((o) => o.value === sort)!.label;

  return (
    <Reveal id="catalog" className="mx-auto w-full max-w-[1160px] px-7 pt-24">
      <div className="text-center">
        <h2 className="font-heading text-[clamp(30px,4vw,44px)] font-bold tracking-[-0.015em] text-ink-foreground">
          Каталог картин
        </h2>
        <p className="mt-3 text-[14.5px] text-ink-foreground/50">
          Каждая картина — в единственном экземпляре · нажмите на работу, чтобы рассмотреть ближе
        </p>
        <p className="mt-2.5 text-[12.5px] text-ink-foreground/40">
          Цены указаны для примера — это учебный проект, покупка картин на сайте не осуществляется.
        </p>
      </div>

      <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setVisibleCount(PAGE_SIZE);
          }}
          type="text"
          placeholder="Поиск по названию…"
          className="min-w-[220px] rounded-[11px] border border-white/12 bg-black/35 px-3.5 py-2.5 text-sm text-ink-foreground outline-none transition-[border-color,box-shadow] duration-250 focus:border-brand-fuchsia focus:shadow-[0_0_0_3px_rgba(232,121,249,0.15)]"
        />
        <div className="relative" ref={sortRootRef}>
          <button
            type="button"
            onClick={() => setSortOpen((v) => !v)}
            className="flex items-center gap-2 rounded-[11px] border border-white/12 bg-black/35 px-3.5 py-2.5 text-sm text-ink-foreground transition-[border-color,background] duration-250 hover:border-brand-fuchsia/50 hover:bg-brand-fuchsia/8 active:scale-[0.97]"
          >
            {currentSortLabel}
            <ChevronDownIcon
              className="h-3.5 w-3.5 opacity-50 transition-transform duration-250"
              style={{ transform: sortOpen ? "rotate(180deg)" : "rotate(0deg)" }}
            />
          </button>
          <AnimatePresence>
            {sortOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 top-[calc(100%+6px)] z-40 min-w-[220px] overflow-hidden rounded-xl border border-white/12 bg-[#16161a] shadow-[0_20px_44px_-16px_rgba(0,0,0,0.6)]"
              >
                {SORT_OPTIONS.map((opt) => (
                  <div
                    key={opt.value}
                    onClick={() => {
                      setSort(opt.value);
                      setVisibleCount(PAGE_SIZE);
                      setSortOpen(false);
                    }}
                    className="cursor-pointer px-3.5 py-2.5 text-sm hover:bg-brand-fuchsia/14"
                    style={{ color: opt.value === sort ? "#f0abfc" : "#f5f3f7" }}
                  >
                    {opt.label}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {noResults && (
        <p className="mt-8 text-center text-sm text-ink-foreground/40">
          Ничего не найдено по запросу «{search}»
        </p>
      )}

      <motion.div
        key={sort + search}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="mt-12 grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-7"
      >
        {visible.map((painting) => {
          const sold = !painting.is_available;
          return (
            <Spotlight key={painting.id} onClick={() => setActiveId(painting.id)} lift={false} className="group cursor-pointer">
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src={painting.image_url}
                  alt={painting.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  style={sold ? { filter: "grayscale(0.85) brightness(0.6)" } : undefined}
                />
                <div className="pointer-events-none absolute inset-0 -translate-x-[120%] -skew-x-[15deg] bg-[linear-gradient(100deg,transparent_40%,rgba(255,255,255,0.12)_50%,transparent_60%)] opacity-0 transition-none group-hover:animate-[sweep_1.1s_ease] group-hover:opacity-100" />
                {sold && (
                  <div className="absolute left-[-32px] top-[14px] -rotate-[40deg] bg-ink px-10 py-[5px] text-[11px] font-bold uppercase tracking-[0.05em] text-ink-foreground shadow-[0_4px_12px_rgba(0,0,0,0.4)]">
                    Продано
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between gap-3 px-5 py-[18px]">
                <span className="flex items-center gap-2 text-[15px] font-semibold text-ink-foreground">
                  {painting.title}
                  <span className="rounded-full border border-brand-fuchsia/25 bg-brand-fuchsia/12 px-2 py-0.5 text-[10.5px] font-semibold text-[#f0abfc]">
                    1 экз.
                  </span>
                </span>
                <span className="whitespace-nowrap text-[14.5px] font-semibold text-brand-fuchsia/90">
                  {priceLabel(painting.price)}
                </span>
              </div>
            </Spotlight>
          );
        })}
      </motion.div>

      {hasMore && (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            className="rounded-full border border-white/14 bg-white/[0.03] px-[30px] py-[13px] text-[14.5px] font-semibold text-ink-foreground transition-all duration-250 hover:-translate-y-0.5 hover:border-brand-fuchsia/70 hover:bg-brand-fuchsia/16 hover:text-[#f0abfc] hover:shadow-[0_8px_24px_-8px_rgba(217,70,239,0.5)] active:scale-95"
          >
            Показать ещё картины
          </button>
        </div>
      )}
      {allShown && (
        <p className="mt-10 text-center text-[13px] text-ink-foreground/40">Показаны все картины</p>
      )}

      <AnimatePresence>
        {activePainting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setActiveId(null)}
            className="fixed inset-0 z-80 flex items-center justify-center bg-black/78 p-6 backdrop-blur-sm"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="grid max-h-[88vh] w-full max-w-[760px] grid-cols-1 overflow-auto rounded-[20px] border border-white/10 bg-[#111114] min-[761px]:grid-cols-2"
            >
              <div className="relative aspect-[4/5]">
                <Image
                  src={activePainting.image_url}
                  alt={activePainting.title}
                  fill
                  className="object-cover"
                  style={!activePainting.is_available ? { filter: "grayscale(0.85) brightness(0.6)" } : undefined}
                />
              </div>
              <div className="flex flex-col p-8">
                <button
                  type="button"
                  onClick={() => setActiveId(null)}
                  aria-label="Закрыть"
                  className="flex h-8 w-8 self-end items-center justify-center rounded-full border border-white/14 bg-white/[0.03] text-ink-foreground hover:border-brand-fuchsia/40"
                >
                  <CloseIcon className="h-3.5 w-3.5" />
                </button>
                <h3 className="mt-4 font-heading text-[22px] font-semibold text-ink-foreground">
                  {activePainting.title}
                </h3>
                <p className="mt-2.5 text-xl font-semibold text-brand-fuchsia">
                  {priceLabel(activePainting.price)}
                </p>
                <p className="mt-4 text-sm leading-[1.6] text-ink-foreground/60">
                  Авторская работа, акрил на холсте. Единственный экземпляр — при продаже снимается
                  из каталога.
                </p>
                {!activePainting.is_available ? (
                  <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.04] p-3.5 text-center text-sm text-ink-foreground/50">
                    Эта картина уже продана
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveId(null);
                      requestPainting(activePainting.id);
                    }}
                    className="mt-6 rounded-full bg-gradient-brand py-[13px] text-[14.5px] font-semibold text-ink transition-opacity hover:opacity-90"
                  >
                    Запросить эту картину
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Reveal>
  );
}
