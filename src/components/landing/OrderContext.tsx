"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type OrderContextValue = {
  selectedPaintingId: string;
  setSelectedPaintingId: (id: string) => void;
  requestPainting: (id: string) => void;
};

const OrderContext = createContext<OrderContextValue | null>(null);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [selectedPaintingId, setSelectedPaintingId] = useState("");

  function requestPainting(id: string) {
    setSelectedPaintingId(id);
    document.getElementById("order")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <OrderContext.Provider value={{ selectedPaintingId, setSelectedPaintingId, requestPainting }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrderContext() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrderContext must be used within OrderProvider");
  return ctx;
}
