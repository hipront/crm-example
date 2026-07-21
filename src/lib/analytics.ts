import type { SupabaseClient } from "@supabase/supabase-js";
import {
  COARSE_STATUSES,
  COARSE_STATUS_LABELS,
  COARSE_STATUS_COLORS,
  type CoarseStatus,
  type LeadStatus,
} from "@/lib/leads";
import type { LeadStage } from "@/lib/stages";

const STALE_DAYS = 3;
const SPARK_POINTS = 8;

export type RawLead = {
  id: string;
  name: string;
  status: LeadStatus;
  pipeline_status: CoarseStatus;
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

export type PipelineStep = {
  key: CoarseStatus;
  label: string;
  color: string;
  count: number;
  pct: number;
};

export type StageBucket = {
  key: string;
  label: string;
  color: string;
  count: number;
};

export type ManagerRevenue = {
  managerId: string | null;
  managerName: string;
  dealCount: number;
  revenue: number;
  avgTicket: number;
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
  pipeline_status: CoarseStatus;
  managerId: string | null;
  managerName: string;
  price: number;
  createdAt: string;
};

export type KpiSparklines = {
  total: number[];
  conversion: number[];
  revenue: number[];
  avgCheck: number[];
};

export type Analytics = {
  totalLeads: number;
  convertedCount: number;
  conversionRate: number;
  totalRevenue: number;
  avgCheck: number;
  pipeline: PipelineStep[];
  stageDistribution: StageBucket[];
  revenueByManager: ManagerRevenue[];
  staleLeads: StaleLead[];
  leads: LeadSummary[];
  kpiSparklines: KpiSparklines;
};

export async function getAnalyticsData(
  client: SupabaseClient,
): Promise<{ leads: RawLead[]; profiles: RawProfile[] }> {
  const [{ data: leadsData, error: leadsError }, { data: profilesData, error: profilesError }] =
    await Promise.all([
      client
        .from("leads")
        .select("id, name, status, pipeline_status, assigned_manager_id, created_at, updated_at, paintings(price)"),
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

// Спарклайны на KPI-плитках строятся из реальных данных (не выдуманы): период
// делится на SPARK_POINTS равных отрезков по created_at лидов. Честная
// аппроксимация — точной даты "закрытия" сделки БД не хранит, только created_at.
function buildSparklines(leads: RawLead[], filter: PeriodFilter): KpiSparklines {
  const to = filter.to ?? new Date();
  let from = filter.from;
  if (!from) {
    from =
      leads.length > 0
        ? new Date(Math.min(...leads.map((l) => new Date(l.created_at).getTime())))
        : new Date(to.getTime() - 7 * 24 * 60 * 60 * 1000);
  }

  const span = Math.max(to.getTime() - from.getTime(), 1);
  const bucketMs = span / SPARK_POINTS;

  const total = Array(SPARK_POINTS).fill(0) as number[];
  const closed = Array(SPARK_POINTS).fill(0) as number[];
  const revenue = Array(SPARK_POINTS).fill(0) as number[];

  for (const lead of leads) {
    const t = new Date(lead.created_at).getTime();
    const idx = Math.min(Math.max(Math.floor((t - from.getTime()) / bucketMs), 0), SPARK_POINTS - 1);
    total[idx] += 1;
    if (lead.pipeline_status === "closed") {
      closed[idx] += 1;
      revenue[idx] += lead.paintings?.price ?? 0;
    }
  }

  const conversion = total.map((t, i) => (t > 0 ? Math.round((closed[i] / t) * 100) : 0));
  const avgCheck = closed.map((c, i) => (c > 0 ? Math.round(revenue[i] / c) : 0));

  return { total, conversion, revenue, avgCheck };
}

export function computeAnalytics(
  allLeads: RawLead[],
  profiles: RawProfile[],
  stages: LeadStage[],
  filter: PeriodFilter = { from: null, to: null },
): Analytics {
  const nameById = new Map(profiles.map((p) => [p.id, p.full_name || "Без имени"]));
  const leads = allLeads.filter((l) => inRange(l.created_at, filter));

  const converted = leads.filter((l) => l.pipeline_status === "closed");

  const pipeline: PipelineStep[] = COARSE_STATUSES.map((key) => {
    const count = leads.filter((l) => l.pipeline_status === key).length;
    return {
      key,
      label: COARSE_STATUS_LABELS[key],
      color: COARSE_STATUS_COLORS[key],
      count,
      pct: leads.length > 0 ? Math.round((count / leads.length) * 100) : 0,
    };
  });

  const stageDistribution: StageBucket[] = stages.map((stage) => ({
    key: stage.key,
    label: stage.title,
    color: stage.color,
    count: leads.filter((l) => l.status === stage.key).length,
  }));

  const revenueMap = new Map<string, Omit<ManagerRevenue, "avgTicket">>();
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
  const revenueByManager: ManagerRevenue[] = [...revenueMap.values()]
    .map((m) => ({ ...m, avgTicket: m.dealCount > 0 ? Math.round(m.revenue / m.dealCount) : 0 }))
    .sort((a, b) => b.revenue - a.revenue);

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
    pipeline_status: l.pipeline_status,
    managerId: l.assigned_manager_id,
    managerName: l.assigned_manager_id ? nameById.get(l.assigned_manager_id) ?? "Без имени" : "Не назначен",
    price: l.paintings?.price ?? 0,
    createdAt: l.created_at,
  }));

  const totalRevenue = converted.reduce((sum, l) => sum + (l.paintings?.price ?? 0), 0);

  return {
    totalLeads: leads.length,
    convertedCount: converted.length,
    conversionRate: leads.length > 0 ? converted.length / leads.length : 0,
    totalRevenue,
    avgCheck: converted.length > 0 ? totalRevenue / converted.length : 0,
    pipeline,
    stageDistribution,
    revenueByManager,
    staleLeads,
    leads: leadSummaries,
    kpiSparklines: buildSparklines(leads, filter),
  };
}
