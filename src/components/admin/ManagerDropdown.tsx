"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";

export default function ManagerDropdown({
  value,
  managers,
  onChange,
  disabled,
}: {
  value: string | null;
  managers: { id: string; full_name: string | null }[];
  onChange: (managerId: string | null) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const currentLabel = value ? managers.find((m) => m.id === value)?.full_name || "Без имени" : "Не назначен";

  function handleOpen() {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
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
        className="flex w-full items-center gap-1.5 rounded-lg border border-white/15 bg-black/30 px-2 py-1.5 text-left text-xs text-white outline-none transition-colors hover:border-white/30 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="min-w-0 flex-1 truncate">{currentLabel}</span>
        {!disabled && (
          <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-white/50 transition-transform ${open ? "rotate-180" : ""}`} />
        )}
      </button>

      {open && createPortal(
        <div
          ref={menuRef}
          style={{ position: "fixed", top: pos.top, left: pos.left, minWidth: pos.width, zIndex: 9999 }}
          className="overflow-hidden rounded-xl border border-white/10 bg-[#141018] shadow-2xl"
        >
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onChange(null);
            }}
            className={`block w-full px-3.5 py-2.5 text-left text-sm transition-colors hover:bg-white/10 ${
              !value ? "text-white" : "text-white/70"
            }`}
          >
            Не назначен
          </button>
          {managers.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                setOpen(false);
                onChange(m.id);
              }}
              className={`block w-full truncate px-3.5 py-2.5 text-left text-sm transition-colors hover:bg-white/10 ${
                value === m.id ? "text-white" : "text-white/70"
              }`}
            >
              {m.full_name || "Без имени"}
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  );
}
