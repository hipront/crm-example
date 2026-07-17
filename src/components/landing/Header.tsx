"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CloseIcon, MenuHamburgerIcon } from "@/components/icons";

const NAV_LINKS = [
  { href: "#story", label: "Об авторе" },
  { href: "#steps", label: "Как заказать" },
  { href: "#testimonials", label: "Отзывы" },
  { href: "#materials", label: "Доставка" },
  { href: "#catalog", label: "Каталог" },
  { href: "#faq", label: "Вопросы" },
  { href: "#order", label: "Заказать" },
];

export default function Header() {
  const [showBanner, setShowBanner] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="sticky top-0 z-50 flex flex-col">
      <AnimatePresence initial={false}>
        {showBanner && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.65, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="relative bg-gradient-brand px-10 py-[7px] text-center text-[12.5px] font-semibold text-ink">
              Учебный проект — сделано для портфолио
              <button
                type="button"
                onClick={() => setShowBanner(false)}
                aria-label="Закрыть"
                className="absolute right-3 top-1/2 flex h-[22px] w-[22px] -translate-y-1/2 items-center justify-center rounded-full bg-ink/15 p-0 text-ink transition-colors hover:bg-ink/28"
              >
                <CloseIcon className="h-3 w-3" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <nav
        className="border-b border-white/8 backdrop-blur-[14px] transition-colors duration-550"
        style={{ backgroundColor: scrolled ? "rgba(10,10,11,0.55)" : "rgba(10,10,11,0.95)" }}
      >
        <div className="mx-auto flex max-w-[1160px] items-center justify-between px-7 py-[18px]">
          <span className="font-heading text-base font-semibold tracking-[-0.01em] text-ink-foreground">
            Psychedelic Art
          </span>

          <button
            type="button"
            onClick={() => setMobileNavOpen((v) => !v)}
            aria-label="Меню"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/14 text-ink-foreground min-[761px]:hidden"
          >
            <MenuHamburgerIcon className="h-[18px] w-[18px]" />
          </button>

          <div className="hidden flex-wrap justify-end gap-[22px] text-sm text-ink-foreground/65 min-[761px]:flex">
            {NAV_LINKS.map((link) => (
              <div key={link.href} className="nav-link">
                <a href={link.href} className="text-inherit no-underline transition-colors hover:text-ink-foreground">
                  {link.label}
                </a>
              </div>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {mobileNavOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.65, ease: "easeOut" }}
              className="overflow-hidden border-t border-white/8 min-[761px]:hidden"
            >
              <div className="flex flex-col gap-3.5 px-7 pb-5 pt-3.5 text-[15px]">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileNavOpen(false)}
                    className="text-ink-foreground no-underline"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </div>
  );
}
