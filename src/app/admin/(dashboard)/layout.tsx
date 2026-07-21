import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/LogoutButton";
import AdminNav, { AdminMobileNav } from "@/components/admin/AdminNav";
import NameOnboardingModal from "@/components/admin/NameOnboardingModal";
import { ROLE_LABELS, type Role } from "@/lib/profiles";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, is_active")
    .eq("id", user!.id)
    .single();

  if (profile && !profile.is_active) {
    await supabase.auth.signOut();
    redirect("/admin/login?blocked=1");
  }

  return (
    <div className="min-h-screen bg-black text-white md:flex">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-white/10 md:flex md:sticky md:top-0 md:h-screen">
        <div className="border-b border-white/10 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-fuchsia-500 via-purple-500 to-cyan-400 text-xs font-bold text-black">
              PA
            </div>
            <div className="min-w-0">
              <span className="block truncate text-sm font-bold leading-none text-white">Psychedelic Art</span>
              <span className="mt-0.5 block text-[10px] font-medium uppercase tracking-widest text-white/40">
                CRM
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          <AdminNav role={profile?.role ?? null} />
        </div>

        <div className="border-t border-white/10 px-3 py-4">
          <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
            <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-fuchsia-400/30 bg-fuchsia-400/10 text-xs font-bold uppercase text-fuchsia-300">
              {(user!.email ?? "?").charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-white/80">{user!.email}</p>
              <p className="text-[10px] text-white/40">{ROLE_LABELS[(profile?.role as Role) ?? "manager"]}</p>
            </div>
          </div>
          <div className="mt-1 px-2">
            <LogoutButton variant="link" />
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1 px-6 pb-24 pt-10 md:pb-10">
        <div className="flex items-center justify-between md:hidden">
          <div>
            <h1 className="text-xl font-semibold">Дашборд</h1>
            <p className="mt-1 text-sm text-white/60">роль: {profile?.role ?? "не назначена"}</p>
          </div>
          <LogoutButton />
        </div>

        <div className="mt-6 md:mt-0">{children}</div>
      </div>

      <AdminMobileNav role={profile?.role ?? null} />

      <NameOnboardingModal userId={user!.id} hasName={Boolean(profile?.full_name)} />
    </div>
  );
}
