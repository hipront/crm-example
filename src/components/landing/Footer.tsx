import Link from "next/link";

function ComingSoonLink({ label }: { label: string }) {
  return (
    <span className="group relative inline-block w-fit cursor-default text-ink-foreground/35">
      {label}
      <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-1.5 -translate-x-1/2 whitespace-nowrap rounded-md border border-white/10 bg-[#1a1a1e] px-2 py-1 text-[11px] text-ink-foreground/70 opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
        Скоро
      </span>
    </span>
  );
}

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-white/8 px-7 pb-8 pt-14">
      <div className="mx-auto grid max-w-[1160px] grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-9">
        <div>
          <span className="font-heading text-base font-semibold text-ink-foreground">Psychedelic Art</span>
          <p className="mt-3 max-w-[260px] text-[13.5px] leading-[1.6] text-ink-foreground/45">
            Авторские психоделические картины ручной работы. Проект создан в учебных/портфолио-целях.
          </p>
        </div>
        <div>
          <h4 className="mb-3.5 text-[13px] uppercase tracking-[0.06em] text-ink-foreground/40">Контакты</h4>
          <p className="text-sm text-ink-foreground/60">+7 999 000-00-00</p>
          <p className="mt-2 text-sm text-ink-foreground/60">hello@psychedelic-art.example</p>
        </div>
        <div>
          <h4 className="mb-3.5 text-[13px] uppercase tracking-[0.06em] text-ink-foreground/40">Соцсети</h4>
          <div className="flex flex-col gap-2 text-sm">
            <ComingSoonLink label="Telegram" />
            <ComingSoonLink label="Instagram" />
          </div>
        </div>
        <div>
          <h4 className="mb-3.5 text-[13px] uppercase tracking-[0.06em] text-ink-foreground/40">Информация</h4>
          <div className="flex flex-col gap-2 text-sm">
            <Link href="/privacy" className="text-ink-foreground/60 no-underline hover:text-ink-foreground">
              Политика конфиденциальности
            </Link>
          </div>
        </div>
      </div>
      <p className="mt-10 text-center text-[13px] text-ink-foreground/30">
        © {new Date().getFullYear()} Psychedelic Art — учебный проект
      </p>
    </footer>
  );
}
