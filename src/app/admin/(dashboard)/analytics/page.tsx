import { createClient } from "@/lib/supabase/server";
import { getAnalyticsData } from "@/lib/analytics";
import { getStages } from "@/lib/stages";
import AnalyticsDashboard from "@/components/admin/AnalyticsDashboard";

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const { leads, profiles } = await getAnalyticsData(supabase);
  const stages = await getStages(supabase);

  return <AnalyticsDashboard rawLeads={leads} rawProfiles={profiles} stages={stages} />;
}
