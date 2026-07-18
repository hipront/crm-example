import { createClient } from "@/lib/supabase/server";
import { getLeads } from "@/lib/leads";
import KanbanBoard from "@/components/admin/KanbanBoard";

export default async function LeadsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();

  const leads = await getLeads(supabase);

  return <KanbanBoard initialLeads={leads} role={profile?.role ?? null} />;
}
