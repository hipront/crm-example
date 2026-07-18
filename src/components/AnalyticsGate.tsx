"use client";

import { useEffect } from "react";
import { Analytics } from "@vercel/analytics/next";

const OWNER_FLAG = "va_owner_exclude";

export default function AnalyticsGate() {
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("owner") === "1") {
      localStorage.setItem(OWNER_FLAG, "1");
    }
  }, []);

  return (
    <Analytics
      beforeSend={(event) => {
        if (typeof window !== "undefined" && localStorage.getItem(OWNER_FLAG) === "1") {
          return null;
        }
        return event;
      }}
    />
  );
}
