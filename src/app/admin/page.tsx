import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/LogoutButton";

export default async function AdminPage() {
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
    <div className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Дашборд</h1>
            <p className="mt-1 text-white/60">
              {user!.email} · роль: {profile?.role ?? "не назначена"}
            </p>
          </div>
          <LogoutButton />
        </div>

        <div className="mt-12 rounded-2xl border border-white/10 bg-white/5 p-8 text-white/60">
          Канбан обработки лидов появится здесь на следующем шаге.
        </div>
      </div>
    </div>
  );
}
