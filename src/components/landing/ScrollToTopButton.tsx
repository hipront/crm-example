"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpIcon } from "@/components/icons";

export default function ScrollToTopButton() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 500);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          type="button"
          initial={{ opacity: 0, y: 8, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.9 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Наверх"
          className="fixed bottom-7 right-7 z-60 flex h-12 w-12 items-center justify-center rounded-full border border-white/14 text-ink shadow-[0_12px_30px_-8px_rgba(217,70,239,0.5)] transition-[transform,box-shadow] duration-650 ease-out hover:-translate-y-1 hover:shadow-[0_18px_36px_-6px_rgba(217,70,239,0.65)] active:translate-y-0 active:scale-[0.94]"
          style={{ background: "radial-gradient(circle at 32% 32%, #f0abfc, #a855f7 55%, #22d3ee 100%)" }}
        >
          <ArrowUpIcon className="h-5 w-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
