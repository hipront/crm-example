import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLeadById } from "@/lib/leads";
import { getManagers } from "@/lib/profiles";
import { getStages } from "@/lib/stages";
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

  return <LeadDetailView initialLead={lead} role={profile?.role ?? null} managers={managers} stages={stages} />;
}
