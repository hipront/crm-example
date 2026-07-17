"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Reveal from "@/components/landing/Reveal";
import Spotlight from "@/components/landing/Spotlight";
import { PlusMinusIcon } from "@/components/icons";

const FAQ_ITEMS = [
  {
    question: "Можно ли купить картину на этом сайте?",
    answer:
      "Это учебный/портфолио-проект — цены и каталог показаны для демонстрации, оплата и покупка не реализованы.",
  },
  {
    question: "Сколько стоит доставка?",
    answer:
      "Стоимость доставки рассчитывается индивидуально после оформления заявки, в зависимости от региона и размера картины.",
  },
  {
    question: "Можно ли внести правки в размер или цвета?",
    answer: "Да, часть работ можно адаптировать под интерьер — это обсуждается в переписке после заявки.",
  },
  {
    question: "Что если картина придёт повреждённой?",
    answer:
      "Каждая отправка застрахована и упакована в жёсткий короб; в случае повреждения работа переделывается или возвращается оплата.",
  },
];

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <Reveal id="faq" className="mx-auto w-full max-w-[760px] px-7 pt-24">
      <h2 className="text-center font-heading text-[clamp(24px,3vw,32px)] font-semibold tracking-[-0.015em] text-ink-foreground">
        Частые вопросы
      </h2>
      <div className="mt-9 grid gap-3">
        {FAQ_ITEMS.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={item.question}
              className="relative overflow-hidden rounded-[14px] border border-white/8 bg-white/[0.03] transition-[border-color,box-shadow] duration-300 hover:border-brand-fuchsia/35 hover:shadow-[0_16px_36px_-20px_rgba(217,70,239,0.4)]"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-3 bg-transparent px-5 py-[18px] text-left text-[15px] font-semibold text-ink-foreground"
              >
                {item.question}
                <PlusMinusIcon open={isOpen} />
              </button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-[18px] text-sm leading-[1.6] text-ink-foreground/60">{item.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </Reveal>
  );
}
