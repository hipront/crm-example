import { createClient } from "@/lib/supabase/server";
import { getLeads } from "@/lib/leads";
import { getManagers } from "@/lib/profiles";
import { getAllPaintings } from "@/lib/paintings";
import LeadsTable from "@/components/admin/leads/LeadsTable";

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ pipeline?: string }>;
}) {
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
  const managers = await getManagers(supabase);
  const paintings = await getAllPaintings(supabase);
  const { pipeline } = await searchParams;

  return (
    <LeadsTable
      initialLeads={leads}
      role={profile?.role ?? null}
      managers={managers}
      paintings={paintings}
      initialPipelineFilter={pipeline}
    />
  );
}
