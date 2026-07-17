import Reveal from "@/components/landing/Reveal";
import Spotlight from "@/components/landing/Spotlight";

const STEPS = [
  {
    number: 1,
    color: "text-brand-fuchsia",
    chipBg: "bg-gradient-to-br from-brand-fuchsia/18 to-brand-fuchsia/4",
    chipBorder: "border-brand-fuchsia/30",
    title: "Выбор картины",
    text: "Смотрите каталог, выбираете работу, которая откликается",
  },
  {
    number: 2,
    color: "text-brand-violet-2",
    chipBg: "bg-gradient-to-br from-brand-violet/18 to-brand-violet/4",
    chipBorder: "border-brand-violet/30",
    title: "Бронирование",
    text: "Оставляете заявку — мы фиксируем картину за вами и уточняем детали",
  },
  {
    number: 3,
    color: "text-brand-cyan",
    chipBg: "bg-gradient-to-br from-brand-cyan/18 to-brand-cyan/4",
    chipBorder: "border-brand-cyan/30",
    title: "Доставка",
    text: "Бережно упаковываем и отправляем в любой регион",
  },
];

export default function HowItWorks() {
  return (
    <Reveal id="steps" className="mx-auto w-full max-w-[1160px] px-7 pt-24">
      <h2 className="text-center font-heading text-[clamp(24px,3vw,32px)] font-semibold tracking-[-0.015em] text-ink-foreground">
        Как проходит заказ
      </h2>
      <div className="mt-11 grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-7">
        {STEPS.map((step) => (
          <Spotlight key={step.number} className="p-7 px-5 text-center">
            <div
              className={`mx-auto mb-[18px] flex items-center justify-center rounded-2xl border font-heading font-semibold ${step.chipBg} ${step.chipBorder} ${step.color}`}
              style={{ width: 52, height: 52 }}
            >
              {step.number}
            </div>
            <h3 className="text-base font-semibold text-ink-foreground">{step.title}</h3>
            <p className="mt-2 text-sm leading-[1.55] text-ink-foreground/55">{step.text}</p>
          </Spotlight>
        ))}
      </div>
    </Reveal>
  );
}
