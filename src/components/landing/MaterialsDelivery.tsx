import Reveal from "@/components/landing/Reveal";
import Spotlight from "@/components/landing/Spotlight";
import { PackageBoxIcon, ClockIcon, GlobeRegionsIcon } from "@/components/icons";

const ITEMS = [
  {
    Icon: PackageBoxIcon,
    color: "text-brand-fuchsia",
    bg: "bg-brand-fuchsia/12",
    border: "border-brand-fuchsia/30",
    title: "Упаковка",
    text: "Жёсткий короб, влагостойкая плёнка, уголки-протекторы — картина доезжает без повреждений",
  },
  {
    Icon: ClockIcon,
    color: "text-brand-violet-2",
    bg: "bg-brand-violet/12",
    border: "border-brand-violet/30",
    title: "Сроки",
    text: "По России — 3-7 дней в зависимости от региона, отслеживание передаём сразу после отправки",
  },
  {
    Icon: GlobeRegionsIcon,
    color: "text-brand-cyan",
    bg: "bg-brand-cyan/12",
    border: "border-brand-cyan/30",
    title: "Регионы",
    text: "Отправляем по всей России и в страны СНГ, доставка за рубеж — по договорённости",
  },
];

export default function MaterialsDelivery() {
  return (
    <Reveal id="materials" className="mx-auto w-full max-w-[1160px] px-7 pt-24">
      <h2 className="text-center font-heading text-[clamp(24px,3vw,32px)] font-semibold tracking-[-0.015em] text-ink-foreground">
        Материалы и доставка
      </h2>
      <div className="mt-11 grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6">
        {ITEMS.map((item) => (
          <Spotlight key={item.title} className="p-7">
            <div className={`mb-[18px] flex h-12 w-12 items-center justify-center rounded-2xl border ${item.bg} ${item.border}`}>
              <item.Icon className={`h-[22px] w-[22px] ${item.color}`} />
            </div>
            <h3 className="font-heading text-base font-semibold text-ink-foreground">{item.title}</h3>
            <p className="mt-2.5 text-sm leading-[1.6] text-ink-foreground/55">{item.text}</p>
          </Spotlight>
        ))}
      </div>
    </Reveal>
  );
}
