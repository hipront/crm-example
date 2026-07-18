import type { SupabaseClient } from "@supabase/supabase-js";
import { LEAD_STATUSES, LEAD_STATUS_LABELS, type LeadStatus } from "@/lib/leads";

const CONVERTED_STATUSES: LeadStatus[] = ["paid", "shipped", "closed"];
const STALE_DAYS = 3;

export type RawLead = {
  id: string;
  name: string;
  status: LeadStatus;
  assigned_manager_id: string | null;
  created_at: string;
  updated_at: string;
  paintings: { price: number } | null;
};

export type RawProfile = {
  id: string;
  full_name: string | null;
};

export type PeriodFilter = { from: Date | null; to: Date | null };

export type FunnelStep = { status: LeadStatus; label: string; count: number };

export type ManagerRevenue = {
  managerId: string | null;
  managerName: string;
  dealCount: number;
  revenue: number;
};

export type StaleLead = {
  id: string;
  name: string;
  status: LeadStatus;
  managerName: string;
  daysSinceUpdate: number;
};

export type LeadSummary = {
  id: string;
  name: string;
  status: LeadStatus;
  managerId: string | null;
  managerName: string;
  price: number;
  createdAt: string;
};

export type Analytics = {
  totalLeads: number;
  convertedCount: number;
  conversionRate: number;
  totalRevenue: number;
  funnel: FunnelStep[];
  revenueByManager: ManagerRevenue[];
  staleLeads: StaleLead[];
  leads: LeadSummary[];
};

export async function getAnalyticsData(
  client: SupabaseClient,
): Promise<{ leads: RawLead[]; profiles: RawProfile[] }> {
  const [{ data: leadsData, error: leadsError }, { data: profilesData, error: profilesError }] =
    await Promise.all([
      client
        .from("leads")
        .select("id, name, status, assigned_manager_id, created_at, updated_at, paintings(price)"),
      client.from("profiles").select("id, full_name"),
    ]);

  if (leadsError) throw new Error(`Failed to load leads: ${leadsError.message}`);
  if (profilesError) throw new Error(`Failed to load profiles: ${profilesError.message}`);

  return {
    leads: (leadsData ?? []) as unknown as RawLead[],
    profiles: (profilesData ?? []) as RawProfile[],
  };
}

function inRange(iso: string, filter: PeriodFilter) {
  const t = new Date(iso).getTime();
  if (filter.from && t < filter.from.getTime()) return false;
  if (filter.to && t > filter.to.getTime()) return false;
  return true;
}

export function computeAnalytics(
  allLeads: RawLead[],
  profiles: RawProfile[],
  filter: PeriodFilter = { from: null, to: null },
): Analytics {
  const nameById = new Map(profiles.map((p) => [p.id, p.full_name || "Без имени"]));
  const leads = allLeads.filter((l) => inRange(l.created_at, filter));

  const nonRejected = leads.filter((l) => l.status !== "rejected");
  const converted = leads.filter((l) => CONVERTED_STATUSES.includes(l.status));

  const funnel: FunnelStep[] = LEAD_STATUSES.filter((s) => s !== "rejected").map((status) => ({
    status,
    label: LEAD_STATUS_LABELS[status],
    count: leads.filter((l) => l.status === status).length,
  }));

  const revenueMap = new Map<string, ManagerRevenue>();
  for (const lead of converted) {
    const key = lead.assigned_manager_id ?? "unassigned";
    const entry = revenueMap.get(key) ?? {
      managerId: lead.assigned_manager_id,
      managerName: lead.assigned_manager_id ? nameById.get(lead.assigned_manager_id) ?? "Без имени" : "Не назначено",
      dealCount: 0,
      revenue: 0,
    };
    entry.dealCount += 1;
    entry.revenue += lead.paintings?.price ?? 0;
    revenueMap.set(key, entry);
  }
  const revenueByManager = [...revenueMap.values()].sort((a, b) => b.revenue - a.revenue);

  const now = Date.now();
  const staleLeads: StaleLead[] = leads
    .filter((l) => l.status !== "closed" && l.status !== "rejected")
    .map((l) => ({
      id: l.id,
      name: l.name,
      status: l.status,
      managerName: l.assigned_manager_id ? nameById.get(l.assigned_manager_id) ?? "Без имени" : "Не назначен",
      daysSinceUpdate: Math.floor((now - new Date(l.updated_at).getTime()) / (1000 * 60 * 60 * 24)),
    }))
    .filter((l) => l.daysSinceUpdate >= STALE_DAYS)
    .sort((a, b) => b.daysSinceUpdate - a.daysSinceUpdate);

  const leadSummaries: LeadSummary[] = leads.map((l) => ({
    id: l.id,
    name: l.name,
    status: l.status,
    managerId: l.assigned_manager_id,
    managerName: l.assigned_manager_id ? nameById.get(l.assigned_manager_id) ?? "Без имени" : "Не назначен",
    price: l.paintings?.price ?? 0,
    createdAt: l.created_at,
  }));

  return {
    totalLeads: leads.length,
    convertedCount: converted.length,
    conversionRate: nonRejected.length > 0 ? converted.length / nonRejected.length : 0,
    totalRevenue: converted.reduce((sum, l) => sum + (l.paintings?.price ?? 0), 0),
    funnel,
    revenueByManager,
    staleLeads,
    leads: leadSummaries,
  };
}
