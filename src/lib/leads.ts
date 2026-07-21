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

export const LEAD_STATUS_COLORS: Record<LeadStatus, string> = {
  new: "#94a3b8",
  in_progress: "#22d3ee",
  agreed: "#a855f7",
  paid: "#4ade80",
  shipped: "#e879f9",
  closed: "#f5f3f7",
  rejected: "#f87171",
};

export const COARSE_STATUSES = ["new", "in_progress", "closed", "rejected"] as const;
export type CoarseStatus = (typeof COARSE_STATUSES)[number];

export const COARSE_STATUS_LABELS: Record<CoarseStatus, string> = {
  new: "Новый",
  in_progress: "В работе",
  closed: "Завершён",
  rejected: "Отклонён",
};

export const COARSE_STATUS_COLORS: Record<CoarseStatus, string> = {
  new: "#94a3b8",
  in_progress: "#22d3ee",
  closed: "#4ade80",
  rejected: "#f87171",
};

export const LEAD_STATUS_OPTIONS = LEAD_STATUSES.map((value) => ({
  value,
  label: LEAD_STATUS_LABELS[value],
  color: LEAD_STATUS_COLORS[value],
}));

export const COARSE_STATUS_OPTIONS = COARSE_STATUSES.map((value) => ({
  value,
  label: COARSE_STATUS_LABELS[value],
  color: COARSE_STATUS_COLORS[value],
}));

export type Lead = {
  id: string;
  name: string;
  contact: string;
  message: string | null;
  status: LeadStatus;
  pipeline_status: CoarseStatus;
  assigned_manager_id: string | null;
  painting_id: string | null;
  created_at: string;
  paintings: { title: string } | null;
};

const LEAD_COLUMNS =
  "id, name, contact, message, status, pipeline_status, assigned_manager_id, painting_id, created_at, paintings(title)";

export async function getLeads(supabase: SupabaseClient): Promise<Lead[]> {
  const { data, error } = await supabase
    .from("leads")
    .select(LEAD_COLUMNS)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load leads: ${error.message}`);
  }

  return data as unknown as Lead[];
}

export async function getLeadById(supabase: SupabaseClient, id: string): Promise<Lead | null> {
  const { data, error } = await supabase
    .from("leads")
    .select(LEAD_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load lead: ${error.message}`);
  }

  return data as unknown as Lead | null;
}

// Назначение менеджера в "Лидах" — сигнал, что заявку взяли в работу.
// Трогает только pipeline_status, не влияет на этап канбана (status).
export function pipelineStatusAfterAssign(current: CoarseStatus): CoarseStatus {
  return current === "new" ? "in_progress" : current;
}
