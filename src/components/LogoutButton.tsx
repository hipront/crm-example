"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LogoutButton({ variant = "button" }: { variant?: "button" | "link" }) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  if (variant === "link") {
    return (
      <button
        onClick={handleLogout}
        className="text-[11px] text-white/40 transition-colors hover:text-white/70"
      >
        Выйти
      </button>
    );
  }

  return (
    <button
      onClick={handleLogout}
      className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-white/80 transition-colors hover:border-white/30 hover:text-white"
    >
      Выйти
    </button>
  );
}
