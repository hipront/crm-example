import { createClient } from "@/lib/supabase/server";
import { getLeads } from "@/lib/leads";
import LogoutButton from "@/components/LogoutButton";
import KanbanBoard from "@/components/admin/KanbanBoard";

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

  const leads = await getLeads(supabase);

  return (
    <div className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-[1600px]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Дашборд</h1>
            <p className="mt-1 text-white/60">
              {user!.email} · роль: {profile?.role ?? "не назначена"}
            </p>
          </div>
          <LogoutButton />
        </div>

        <div className="mt-12">
          <KanbanBoard initialLeads={leads} />
        </div>
      </div>
    </div>
  );
}
