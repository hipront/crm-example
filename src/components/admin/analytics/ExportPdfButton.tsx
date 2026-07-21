"use client";

import { useState } from "react";
import { Check, Download, Loader2 } from "lucide-react";

export default function ExportPdfButton({ onExport }: { onExport: () => Promise<void> | void }) {
  const [status, setStatus] = useState<"idle" | "exporting" | "done">("idle");

  async function handleClick() {
    if (status === "exporting") return;
    setStatus("exporting");
    await onExport();
    setStatus("done");
    setTimeout(() => setStatus("idle"), 1600);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={status === "exporting"}
      className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-400 px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed"
    >
      {status === "exporting" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      {status === "done" && <Check className="h-3.5 w-3.5" />}
      {status === "idle" && <Download className="h-3.5 w-3.5" />}
      {status === "exporting" ? "Готовим…" : status === "done" ? "Готово" : "Экспорт PDF"}
    </button>
  );
}
