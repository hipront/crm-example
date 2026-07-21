import type { SupabaseClient } from "@supabase/supabase-js";

export type HistoryKind = "status" | "pipeline_status" | "created";

export type HistoryEntry = {
  id: string;
  lead_id: string;
  old_status: string | null;
  new_status: string;
  kind: HistoryKind;
  changed_by: string | null;
  changed_at: string;
  profiles: { full_name: string | null; email: string | null } | null;
};

const HISTORY_COLUMNS = "id, lead_id, old_status, new_status, kind, changed_by, changed_at, profiles(full_name, email)";

export async function getHistoryForLead(client: SupabaseClient, leadId: string): Promise<HistoryEntry[]> {
  const { data, error } = await client
    .from("status_history")
    .select(HISTORY_COLUMNS)
    .eq("lead_id", leadId)
    .order("changed_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load history: ${error.message}`);
  }

  return data as unknown as HistoryEntry[];
}
