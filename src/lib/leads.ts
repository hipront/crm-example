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

const TO_COARSE: Record<LeadStatus, CoarseStatus> = {
  new: "new",
  in_progress: "in_progress",
  agreed: "in_progress",
  paid: "in_progress",
  shipped: "in_progress",
  closed: "closed",
  rejected: "rejected",
};

export function toCoarseStatus(status: LeadStatus): CoarseStatus {
  return TO_COARSE[status];
}

const COARSE_DEFAULT: Record<CoarseStatus, LeadStatus> = {
  new: "new",
  in_progress: "in_progress",
  closed: "closed",
  rejected: "rejected",
};

export function fromCoarseStatus(coarse: CoarseStatus): LeadStatus {
  return COARSE_DEFAULT[coarse];
}

// Назначение менеджера — сигнал, что по лиду начали работать.
export function statusAfterAssign(current: LeadStatus): LeadStatus {
  return current === "new" ? "in_progress" : current;
}

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
  assigned_manager_id: string | null;
  painting_id: string | null;
  created_at: string;
  paintings: { title: string } | null;
};

export async function getLeads(supabase: SupabaseClient): Promise<Lead[]> {
  const { data, error } = await supabase
    .from("leads")
    .select("id, name, contact, message, status, assigned_manager_id, painting_id, created_at, paintings(title)")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load leads: ${error.message}`);
  }

  return data as unknown as Lead[];
}

export async function getLeadById(supabase: SupabaseClient, id: string): Promise<Lead | null> {
  const { data, error } = await supabase
    .from("leads")
    .select("id, name, contact, message, status, assigned_manager_id, painting_id, created_at, paintings(title)")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load lead: ${error.message}`);
  }

  return data as unknown as Lead | null;
}
