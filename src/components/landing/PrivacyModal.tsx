"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { CloseIcon } from "@/components/icons";
import { usePrivacyModal } from "@/components/landing/PrivacyModalContext";
import { useBodyScrollLock } from "@/components/landing/useBodyScrollLock";
import PrivacyContent from "@/components/landing/PrivacyContent";

export default function PrivacyModal() {
  const { isOpen, close } = usePrivacyModal();
  const [mounted, setMounted] = useState(false);
  const unlockScroll = useBodyScrollLock(isOpen);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence onExitComplete={unlockScroll}>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          onClick={close}
          className="fixed inset-0 z-90 flex h-[100dvh] items-start justify-center overflow-y-auto bg-black/78 p-4 py-10 backdrop-blur-sm min-[761px]:p-6 min-[761px]:py-16"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[720px] rounded-[20px] border border-white/10 bg-ink px-5 py-8 text-ink-foreground min-[761px]:px-10 min-[761px]:py-10"
          >
            <button
              type="button"
              onClick={close}
              aria-label="Закрыть"
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-white/14 bg-white/[0.03] text-ink-foreground hover:border-brand-fuchsia/40 min-[761px]:right-4 min-[761px]:top-4"
            >
              <CloseIcon className="h-3.5 w-3.5" />
            </button>
            <PrivacyContent />
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
