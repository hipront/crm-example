import type { SupabaseClient } from "@supabase/supabase-js";

export const LEAD_STATUSES = [
  "new",
  "in_progress",
  "agreed",
  "paid",
  "shipped",
  "closed",
  "rejected",
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: "Новый",
  in_progress: "В работе",
  agreed: "Договорились",
  paid: "Оплачен",
  shipped: "Отправлен/Выдан",
  closed: "Закрыт",
  rejected: "Отказ",
};

export type Lead = {
  id: string;
  name: string;
  contact: string;
  message: string | null;
  status: LeadStatus;
  assigned_manager_id: string | null;
  created_at: string;
  paintings: { title: string } | null;
};

export async function getLeads(supabase: SupabaseClient): Promise<Lead[]> {
  const { data, error } = await supabase
    .from("leads")
    .select("id, name, contact, message, status, assigned_manager_id, created_at, paintings(title)")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load leads: ${error.message}`);
  }

  return data as unknown as Lead[];
}
