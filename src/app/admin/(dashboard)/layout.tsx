import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/LogoutButton";
import AdminNav from "@/components/admin/AdminNav";
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
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-[1600px] px-6 py-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Дашборд</h1>
            <p className="mt-1 text-white/60">
              {user!.email} · роль: {profile?.role ?? "не назначена"}
            </p>
          </div>
          <LogoutButton />
        </div>

        <AdminNav role={profile?.role ?? null} />

        <div className="mt-8">{children}</div>
      </div>

      <NameOnboardingModal userId={user!.id} hasName={Boolean(profile?.full_name)} />
    </div>
  );
}
