"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type PrivacyModalContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

const PrivacyModalContext = createContext<PrivacyModalContextValue | null>(null);

export function PrivacyModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <PrivacyModalContext.Provider value={{ isOpen, open: () => setIsOpen(true), close: () => setIsOpen(false) }}>
      {children}
    </PrivacyModalContext.Provider>
  );
}

export function usePrivacyModal() {
  const ctx = useContext(PrivacyModalContext);
  if (!ctx) throw new Error("usePrivacyModal must be used within PrivacyModalProvider");
  return ctx;
}
