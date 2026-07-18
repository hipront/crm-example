"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useMotionValue, useScroll, useTransform, useSpring } from "framer-motion";

function AuroraBlob({
  className,
  gradient,
  animationClass,
  parallaxRate,
  scrollY,
}: {
  className: string;
  gradient: string;
  animationClass: string;
  parallaxRate: number;
  scrollY: ReturnType<typeof useScroll>["scrollY"];
}) {
  const y = useTransform(scrollY, (v) => v * parallaxRate);
  return (
    <motion.div
      style={{ background: gradient, translateY: y }}
      className={`pointer-events-none absolute rounded-full blur-[40px] ${animationClass} ${className}`}
    />
  );
}

function MagneticButton() {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 20 });
  const springY = useSpring(y, { stiffness: 300, damping: 20 });

  function handleMouseMove(e: React.MouseEvent<HTMLAnchorElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * 0.18);
    y.set((e.clientY - rect.top - rect.height / 2) * 0.18);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.a
      ref={ref}
      href="#catalog"
      onClick={(e) => {
        e.preventDefault();
        document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className="mt-10 inline-flex animate-[ringPulse_3.2s_ease-in-out_infinite] items-center gap-2 rounded-full bg-gradient-brand px-8 py-[15px] text-[15px] font-semibold text-ink no-underline shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_20px_50px_-12px_rgba(217,70,239,0.4)] transition-shadow duration-750 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_26px_60px_-10px_rgba(217,70,239,0.55)]"
    >
      Смотреть картины
    </motion.a>
  );
}

export default function Hero() {
  const { scrollY } = useScroll();

  return (
    <section className="relative flex min-h-[92vh] items-center overflow-hidden bg-ink">
      <Image
        src="/images/stock/hero-1.jpg"
        alt=""
        fill
        priority
        className="animate-[heroKenBurns_10s_ease-in-out_infinite_alternate] object-cover opacity-40 mix-blend-screen"
      />
      <AuroraBlob
        className="left-[-10%] top-[-15%] h-[60vw] max-h-[820px] w-[60vw] max-w-[820px]"
        gradient="radial-gradient(circle, rgba(217,70,239,0.32) 0%, rgba(217,70,239,0) 68%)"
        animationClass="animate-[auroraDrift1_22s_ease-in-out_infinite]"
        parallaxRate={0.08}
        scrollY={scrollY}
      />
      <AuroraBlob
        className="right-[-15%] top-[5%] h-[55vw] max-h-[760px] w-[55vw] max-w-[760px]"
        gradient="radial-gradient(circle, rgba(34,211,238,0.26) 0%, rgba(34,211,238,0) 68%)"
        animationClass="animate-[auroraDrift2_26s_ease-in-out_infinite]"
        parallaxRate={0.12}
        scrollY={scrollY}
      />
      <AuroraBlob
        className="bottom-[-20%] left-[20%] h-[50vw] max-h-[680px] w-[50vw] max-w-[680px]"
        gradient="radial-gradient(circle, rgba(147,51,234,0.28) 0%, rgba(147,51,234,0) 68%)"
        animationClass="animate-[auroraDrift3_19s_ease-in-out_infinite]"
        parallaxRate={0.16}
        scrollY={scrollY}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,rgba(10,10,11,0.9)_0%,rgba(10,10,11,0.4)_40%,rgba(10,10,11,0)_70%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,11,0.1)_0%,rgba(10,10,11,0.55)_78%,#0a0a0b_100%)]" />

      <div className="relative mx-auto w-full max-w-[1160px] px-7 py-20 sm:pt-[120px] sm:pb-20">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: "easeOut" }}
          className="max-w-[640px]"
        >
          <span className="mb-6 inline-flex animate-[badgeGlow_4s_ease-in-out_infinite] items-center gap-2 rounded-full border border-brand-fuchsia/30 px-3.5 py-1.5 text-[12.5px] uppercase tracking-[0.08em] text-brand-fuchsia/85">
            Авторская живопись
          </span>
          <h1 className="text-gradient-brand font-heading text-[clamp(32px,5.2vw,68px)] font-bold leading-[1.05] tracking-[-0.02em]">
            Картины, которые меняют пространство
          </h1>
          <p className="mt-6 max-w-[480px] text-lg leading-[1.6] text-ink-foreground/68">
            Авторские работы ручной работы — яркие, живые, для тех, кто ищет не просто декор, а
            настроение в каждой детали интерьера.
          </p>
          <MagneticButton />
        </motion.div>
      </div>
    </section>
  );
}
