import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/LogoutButton";
import AdminNav, { AdminMobileNav } from "@/components/admin/AdminNav";
import NameOnboardingModal from "@/components/admin/NameOnboardingModal";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user!.id)
    .single();

  return (
    <div className="min-h-screen bg-black text-white md:flex">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-white/10 px-4 py-8 md:flex">
        <h1 className="px-3 text-lg font-semibold">Дашборд</h1>
        <p className="mt-1 px-3 text-xs text-white/50 truncate">{user!.email}</p>

        <div className="mt-8">
          <AdminNav role={profile?.role ?? null} />
        </div>

        <div className="mt-auto pt-8">
          <LogoutButton />
        </div>
      </aside>

      <div className="flex-1 px-6 pb-24 pt-10 md:pb-10">
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
