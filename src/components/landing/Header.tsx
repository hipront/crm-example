"use client";

import { useEffect, useState } from "react";
import { CloseIcon, MenuHamburgerIcon } from "@/components/icons";

const NAV_LINKS = [
  { href: "#catalog", label: "Каталог" },
  { href: "#story", label: "Об авторе" },
  { href: "#steps", label: "Как заказать" },
  { href: "#materials", label: "Доставка" },
  { href: "#testimonials", label: "Отзывы" },
  { href: "#faq", label: "Вопросы" },
  { href: "#order", label: "Заказать" },
];

function scrollToSection(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
  e.preventDefault();
  document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
}

export default function Header() {
  const [showBanner, setShowBanner] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [activeHref, setActiveHref] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const onScroll = () => setMobileNavOpen(false);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [mobileNavOpen]);

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 761px)");
    const apply = () => setIsDesktop(mql.matches);
    apply();
    mql.addEventListener("change", apply);
    return () => mql.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const sections = NAV_LINKS.map((link) => document.querySelector(link.href)).filter(
      (el): el is HTMLElement => el !== null
    );
    const headerOffset = 140;

    function onScroll() {
      let current: string | null = null;
      for (const el of sections) {
        if (el.getBoundingClientRect().top - headerOffset <= 0) {
          current = `#${el.id}`;
        }
      }
      setActiveHref(current);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="flex flex-col">
      {showBanner && (
        <div className="relative bg-gradient-brand px-10 py-[7px] text-center text-[12.5px] font-semibold text-ink opacity-90 min-[960px]:opacity-100">
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
      )}

      <nav
        className="sticky top-0 z-50 relative border-b border-white/8 backdrop-blur-[14px] transition-colors duration-550"
        style={{
          backgroundColor: scrolled
            ? isDesktop
              ? "rgba(10,10,11,0.35)"
              : "rgba(10,10,11,0.8)"
            : "rgba(10,10,11,0.95)",
        }}
      >
        <div className="mx-auto flex max-w-[1160px] items-center justify-between px-7 py-[18px]">
          <span className="font-heading text-base font-semibold tracking-[-0.01em] text-ink-foreground">
            Psychedelic Art
          </span>

          <button
            type="button"
            onClick={() => setMobileNavOpen((v) => !v)}
            aria-label="Меню"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/14 text-ink-foreground min-[960px]:hidden"
          >
            <MenuHamburgerIcon className="h-[18px] w-[18px]" />
          </button>

          <div className="hidden flex-wrap justify-end gap-[22px] text-sm text-ink-foreground/65 min-[960px]:flex">
            {NAV_LINKS.map((link) => (
              <div key={link.href} className="nav-link">
                <a
                  href={link.href}
                  onClick={(e) => scrollToSection(e, link.href)}
                  className={`no-underline transition-colors hover:text-ink-foreground ${
                    activeHref === link.href ? "text-[#f0abfc]" : "text-inherit"
                  }`}
                >
                  {link.label}
                </a>
              </div>
            ))}
          </div>
        </div>

        {mobileNavOpen && (
          <div className="absolute inset-x-0 top-full border-t border-white/8 bg-ink/90 min-[960px]:hidden">
            <div className="flex flex-col gap-3.5 px-7 pb-5 pt-3.5 text-[15px]">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => {
                    setMobileNavOpen(false);
                    scrollToSection(e, link.href);
                  }}
                  className="text-ink-foreground no-underline"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}
