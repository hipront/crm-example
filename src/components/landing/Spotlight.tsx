"use client";

import { useRef, type ReactNode } from "react";

export default function Spotlight({
  children,
  className,
  onClick,
  lift = true,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  lift?: boolean;
}) {
  const glowRef = useRef<HTMLDivElement>(null);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const glow = glowRef.current;
    if (!glow) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    glow.style.background = `radial-gradient(circle 130px at ${x}% ${y}%, rgba(232,121,249,0.12), transparent 100%)`;
    glow.style.opacity = "1";
  }

  function handleMouseLeave() {
    if (glowRef.current) glowRef.current.style.opacity = "0";
  }

  return (
    <div
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden rounded-[18px] border border-white/8 bg-white/[0.03] transition-[transform,box-shadow] duration-700 ease-out ${
        lift ? "hover:-translate-y-1.5 hover:shadow-[0_24px_50px_-18px_rgba(217,70,239,0.35)]" : ""
      } ${className ?? ""}`}
    >
      <div ref={glowRef} className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-500" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
