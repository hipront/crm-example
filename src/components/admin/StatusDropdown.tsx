"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";

export type StatusOption<T extends string> = { value: T; label: string; color: string };

export default function StatusDropdown<T extends string>({
  value,
  options,
  onChange,
  disabled,
}: {
  value: T;
  options: StatusOption<T>[];
  onChange: (status: T) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const current = options.find((o) => o.value === value);

  function handleOpen() {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const menuWidth = 208;
    setPos({
      top: rect.bottom + 6,
      left: Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - 8),
    });
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      const t = e.target as Node;
      if (!triggerRef.current?.contains(t) && !menuRef.current?.contains(t)) setOpen(false);
    }
    function onScrollOrResize() {
      setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : handleOpen())}
        className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-sm font-medium text-white transition-colors hover:border-white/30 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {current && <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: current.color }} />}
        {current?.label ?? value}
        {!disabled && <ChevronDown className={`h-3.5 w-3.5 text-white/50 transition-transform ${open ? "rotate-180" : ""}`} />}
      </button>

      {open && createPortal(
        <div
          ref={menuRef}
          style={{ position: "fixed", top: pos.top, left: pos.left, width: 208, zIndex: 9999 }}
          className="overflow-hidden rounded-xl border border-white/10 bg-[#141018] shadow-2xl"
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                setOpen(false);
                if (option.value !== value) onChange(option.value);
              }}
              className={`flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-sm transition-colors hover:bg-white/10 ${
                option.value === value ? "text-white" : "text-white/70"
              }`}
            >
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: option.color }} />
              {option.label}
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  );
}
