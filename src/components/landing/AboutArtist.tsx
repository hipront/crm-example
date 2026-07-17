import Image from "next/image";
import Reveal from "@/components/landing/Reveal";

export default function AboutArtist() {
  return (
    <Reveal
      id="story"
      className="mx-auto grid w-full max-w-[1160px] items-center gap-10 px-7 pt-24 min-[761px]:grid-cols-[minmax(220px,300px)_1fr]"
    >
      <div className="group relative aspect-square transition-transform duration-550 hover:-translate-y-1.5">
        <div className="absolute -inset-3.5 animate-[haloSpin_14s_linear_infinite] rounded-3xl bg-[conic-gradient(from_0deg,#e879f9,#a855f7,#22d3ee,#e879f9)] opacity-35 blur-[18px]" />
        <div className="relative h-full w-full overflow-hidden rounded-[20px]">
          <Image
            src="/images/stock/artist-portrait.jpg"
            alt="Автор проекта"
            fill
            className="object-cover"
          />
        </div>
      </div>
      <div>
        <span className="mb-[18px] inline-flex rounded-full border border-brand-cyan/30 px-3.5 py-1.5 text-[12.5px] uppercase tracking-[0.08em] text-brand-cyan/85">
          Об авторе
        </span>
        <h2 className="font-heading text-[clamp(24px,3vw,32px)] font-semibold tracking-[-0.015em] text-ink-foreground">
          Каждая картина написана вручную, без тиражей
        </h2>
        <p className="mt-4 max-w-[520px] text-base leading-[1.65] text-ink-foreground/65">
          Больше десяти лет исследую психоделическую эстетику через акрил и текстуру холста.
          Каждая работа — отдельная история, а не серия; когда картина продана, второй такой не
          будет.
        </p>
        <p className="mt-3.5 font-heading text-[15px] text-ink-foreground/85">— Автор проекта</p>
      </div>
    </Reveal>
  );
}
