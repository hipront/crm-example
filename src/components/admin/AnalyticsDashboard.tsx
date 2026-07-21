"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, ChevronDown, Target, Users, Wallet } from "lucide-react";
import { computeAnalytics, type PeriodFilter, type RawLead, type RawProfile } from "@/lib/analytics";
import type { LeadStage } from "@/lib/stages";
import KpiTile from "@/components/admin/analytics/KpiTile";
import StatusDonut from "@/components/admin/analytics/StatusDonut";
import StageDistribution from "@/components/admin/analytics/StageDistribution";
import StaleLeadsPanel from "@/components/admin/analytics/StaleLeadsPanel";
import ManagersRevenueTable from "@/components/admin/analytics/ManagersRevenueTable";
import PeriodFilter_, { type CustomRange, type Period } from "@/components/admin/analytics/PeriodFilter";
import ExportPdfButton from "@/components/admin/analytics/ExportPdfButton";

function rub(n: number) {
  return n.toLocaleString("ru-RU") + " ₽";
}

function periodToFilter(period: Period | null, customRange: CustomRange): PeriodFilter {
  if (period === null && customRange) {
    return { from: new Date(customRange.from), to: new Date(`${customRange.to}T23:59:59`) };
  }
  const now = new Date();
  if (period === "all" || period === null) return { from: null, to: null };
  const days = period === "week" ? 7 : 30;
  return { from: new Date(now.getTime() - days * 24 * 60 * 60 * 1000), to: now };
}

function previousFilter(filter: PeriodFilter): PeriodFilter | null {
  if (!filter.from) return null;
  const to = filter.to ?? new Date();
  const lengthMs = to.getTime() - filter.from.getTime();
  return { from: new Date(filter.from.getTime() - lengthMs), to: filter.from };
}

function trendPct(curr: number, prev: number): number | null {
  if (prev === 0) return curr > 0 ? 100 : null;
  return Math.round(((curr - prev) / prev) * 100);
}

export default function AnalyticsDashboard({
  rawLeads,
  rawProfiles,
  stages,
}: {
  rawLeads: RawLead[];
  rawProfiles: RawProfile[];
  stages: LeadStage[];
}) {
  const router = useRouter();
  const [period, setPeriod] = useState<Period | null>("month");
  const [customRange, setCustomRange] = useState<CustomRange>(null);
  const [stagesOpen, setStagesOpen] = useState(() => typeof window === "undefined" || window.innerWidth >= 768);
  const [exportMode, setExportMode] = useState(false);

  const filter = useMemo(() => periodToFilter(period, customRange), [period, customRange]);
  const data = useMemo(
    () => computeAnalytics(rawLeads, rawProfiles, stages, filter),
    [rawLeads, rawProfiles, stages, filter],
  );

  const prevFilter = useMemo(() => previousFilter(filter), [filter]);
  const prevData = useMemo(
    () => (prevFilter ? computeAnalytics(rawLeads, rawProfiles, stages, prevFilter) : null),
    [rawLeads, rawProfiles, stages, prevFilter],
  );

  function goToKanban(status: string) {
    router.push(`/admin/kanban?status=${status}`);
  }

  function goToLeads(pipelineStatus: string) {
    router.push(`/admin/leads?pipeline=${pipelineStatus}`);
  }

  async function handleExportPdf() {
    const wasStagesOpen = stagesOpen;
    setStagesOpen(true);
    setExportMode(true);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

    window.print();

    setExportMode(false);
    setStagesOpen(wasStagesOpen);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Показатели</h2>
          <p className="mt-1 hidden text-xs text-white/40 print:block">
            Период: {period === "week" ? "Неделя" : period === "month" ? "Месяц" : period === "all" ? "Всё время" : "свой диапазон"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <PeriodFilter_
            period={period}
            customRange={customRange}
            onPeriodChange={(p) => {
              setPeriod(p);
              setCustomRange(null);
            }}
            onCustomRangeChange={(range) => {
              setCustomRange(range);
              if (range) setPeriod(null);
            }}
          />
          <ExportPdfButton onExport={handleExportPdf} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiTile
          icon={Users}
          label="Всего лидов"
          value={String(data.totalLeads)}
          sublabel={period === "week" ? "за неделю" : period === "month" ? "за месяц" : "за период"}
          trend={prevData ? trendPct(data.totalLeads, prevData.totalLeads) : null}
          spark={data.kpiSparklines.total}
          color="#e879f9"
        />
        <KpiTile
          icon={Target}
          label="Конверсия в продажу"
          value={`${Math.round(data.conversionRate * 100)}%`}
          sublabel={`${data.convertedCount} из ${data.totalLeads}`}
          trend={
            prevData ? trendPct(Math.round(data.conversionRate * 100), Math.round(prevData.conversionRate * 100)) : null
          }
          spark={data.kpiSparklines.conversion}
          color="#22d3ee"
        />
        <KpiTile
          icon={Wallet}
          label="Выручка"
          value={rub(data.totalRevenue)}
          sublabel="завершённые сделки"
          trend={prevData ? trendPct(data.totalRevenue, prevData.totalRevenue) : null}
          spark={data.kpiSparklines.revenue}
          color="#4ade80"
        />
        <KpiTile
          icon={BarChart3}
          label="Средний чек"
          value={rub(Math.round(data.avgCheck))}
          sublabel="на одну сделку"
          spark={data.kpiSparklines.avgCheck}
          color="rgba(255,255,255,.55)"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr] lg:items-stretch">
        <div className="rounded-2xl border border-fuchsia-400/25 bg-[radial-gradient(120%_140%_at_0%_0%,rgba(232,121,249,.09),rgba(255,255,255,.03)_55%)] p-6">
          <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-base font-bold text-white">Статусы сделок</h3>
            <span className="text-[11.5px] italic text-white/40">
              Распределение лидов по исходу — стабильные статусы, сравнимы между периодами
            </span>
          </div>
          <div className="mt-4">
            <StatusDonut steps={data.pipeline} total={data.totalLeads} onSelect={goToLeads} />
          </div>
        </div>

        <StaleLeadsPanel staleLeads={data.staleLeads} onSelect={goToKanban} noScroll={exportMode} />
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <button
          type="button"
          onClick={() => setStagesOpen((o) => !o)}
          className="flex w-full flex-wrap items-center justify-between gap-2 text-left"
        >
          <div className="flex items-center gap-2.5">
            <h3 className="text-sm font-medium text-white/85">По этапам доски (сейчас)</h3>
            <span className="text-[11px] italic text-white/35">
              Оперативный срез — не воронка конверсии, этапы настраиваются в Настройках
            </span>
          </div>
          <ChevronDown className={`h-4 w-4 shrink-0 text-white/50 transition-transform ${stagesOpen ? "rotate-180" : ""}`} />
        </button>
        {(stagesOpen || exportMode) && (
          <div className="mt-4">
            <StageDistribution buckets={data.stageDistribution} onSelect={goToKanban} noScroll={exportMode} />
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h3 className="mb-4 text-sm font-medium text-white/85">Выручка по менеджерам</h3>
        <ManagersRevenueTable managers={data.revenueByManager} leads={data.leads} forceExpandAll={exportMode} />
      </div>
    </div>
  );
}
