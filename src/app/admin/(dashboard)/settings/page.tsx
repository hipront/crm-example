import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getStages, getStageLeadCounts } from "@/lib/stages";
import SettingsClient from "@/components/admin/SettingsClient";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();

  if (profile?.role !== "admin") redirect("/admin/leads");

  const stages = await getStages(supabase);
  const leadCounts = await getStageLeadCounts(supabase);

  return <SettingsClient initialStages={stages} leadCounts={leadCounts} />;
}
