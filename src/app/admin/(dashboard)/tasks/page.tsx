import { createClient } from "@/lib/supabase/server";
import { getAllTasks } from "@/lib/tasks";
import { getAllProfiles } from "@/lib/profiles";
import { getLeads } from "@/lib/leads";
import TasksClient from "@/components/admin/tasks/TasksClient";

export default async function TasksPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();

  const [tasks, profiles, leads] = await Promise.all([
    getAllTasks(supabase),
    getAllProfiles(supabase),
    getLeads(supabase),
  ]);

  return (
    <TasksClient
      initialTasks={tasks}
      profiles={profiles}
      leads={leads.map((l) => ({ id: l.id, name: l.name }))}
      currentUserId={user!.id}
      role={profile?.role ?? null}
    />
  );
}
