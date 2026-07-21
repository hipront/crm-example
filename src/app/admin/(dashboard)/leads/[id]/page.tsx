import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLeadById } from "@/lib/leads";
import { getManagers, getAllProfiles } from "@/lib/profiles";
import { getStages } from "@/lib/stages";
import { getTasksForLead } from "@/lib/tasks";
import { getHistoryForLead } from "@/lib/history";
import LeadDetailView from "@/components/admin/leads/LeadDetailView";

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();

  const lead = await getLeadById(supabase, id);
  if (!lead) notFound();

  const managers = await getManagers(supabase);
  const stages = await getStages(supabase);
  const tasks = await getTasksForLead(supabase, id);
  const history = await getHistoryForLead(supabase, id);
  const profiles = await getAllProfiles(supabase);

  return (
    <LeadDetailView
      initialLead={lead}
      role={profile?.role ?? null}
      managers={managers}
      stages={stages}
      initialTasks={tasks}
      history={history}
      profiles={profiles}
      currentUserId={user!.id}
    />
  );
}
