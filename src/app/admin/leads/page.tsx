import { createClient } from "@/lib/supabase/server";
import { getLeads } from "@/lib/leads";
import KanbanBoard from "@/components/admin/KanbanBoard";

export default async function LeadsPage() {
  const supabase = await createClient();
  const leads = await getLeads(supabase);

  return <KanbanBoard initialLeads={leads} />;
}
