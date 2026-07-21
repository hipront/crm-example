"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { computeAnalytics, type PeriodFilter, type RawLead, type RawProfile } from "@/lib/analytics";
import type { LeadStage } from "@/lib/stages";
import LeadsMiniList from "@/components/admin/analytics/LeadsMiniList";
import PeriodFilter_, { type CustomRange, type Period } from "@/components/admin/analytics/PeriodFilter";
import FunnelChart from "@/components/admin/analytics/FunnelChart";
import StaleLeadsPanel from "@/components/admin/analytics/StaleLeadsPanel";

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

function StatTile({
  label,
  value,
  sublabel,
  trend,
}: {
  label: string;
  value: string;
  sublabel?: string;
  trend?: number | null;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-white/50">{label}</p>
        {trend != null && (
          <span className={`text-xs font-semibold ${trend >= 0 ? "text-emerald-300" : "text-red-300"}`}>
            {trend >= 0 ? "+" : ""}
            {trend}%
          </span>
        )}
      </div>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      {sublabel && <p className="mt-1 text-xs text-white/40">{sublabel}</p>}
    </div>
  );
}

function BarRow({
  label,
  value,
  valueLabel,
  maxValue,
  title,
  open,
  onToggle,
  children,
}: {
  label: string;
  value: number;
  valueLabel: string;
  maxValue: number;
  title: string;
  open: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
}) {
  const pct = maxValue > 0 ? Math.max((value / maxValue) * 100, value > 0 ? 3 : 0) : 0;
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        title={title}
        className="flex w-full items-center gap-3 rounded-lg px-1 py-1.5 text-left transition-colors hover:bg-white/5"
      >
        <span className={`shrink-0 text-white/30 transition-transform ${open ? "rotate-90" : ""}`} aria-hidden>
          ›
        </span>
        <span className="w-28 shrink-0 truncate text-sm text-white/70">{label}</span>
        <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full bg-cyan-400 transition-[width] duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="min-w-[90px] shrink-0 text-right text-sm tabular-nums text-white/80">{valueLabel}</span>
      </button>
      {open && <div className="mb-1 ml-7 mt-1">{children}</div>}
    </div>
  );
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
  const [openManager, setOpenManager] = useState<string | null>(null);

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

  const maxRevenue = Math.max(...data.revenueByManager.map((m) => m.revenue), 1);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-lg font-semibold">Показатели</h2>
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
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Всего лидов"
          value={String(data.totalLeads)}
          trend={prevData ? trendPct(data.totalLeads, prevData.totalLeads) : null}
        />
        <StatTile
          label="Конверсия"
          value={`${Math.round(data.conversionRate * 100)}%`}
          sublabel={`${data.convertedCount} из ${data.totalLeads} (без отказов)`}
          trend={
            prevData ? trendPct(Math.round(data.conversionRate * 100), Math.round(prevData.conversionRate * 100)) : null
          }
        />
        <StatTile
          label="Выручка"
          value={rub(data.totalRevenue)}
          sublabel="оплачен + отправлен + закрыт"
          trend={prevData ? trendPct(data.totalRevenue, prevData.totalRevenue) : null}
        />
        <StatTile
          label="Зависшие лиды"
          value={String(data.staleLeads.length)}
          sublabel="без обновления 3+ дня"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr] lg:items-start">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="mb-1.5 flex items-center gap-2">
            <span className="h-2 w-2 shrink-0 rounded-sm bg-purple-500" />
            <h3 className="text-sm font-medium text-white/80">Воронка по статусам</h3>
          </div>
          <p className="mb-4 text-xs text-white/40">Клик по столбцу — открыть список в Канбане</p>
          <FunnelChart funnel={data.funnel} onSelect={goToKanban} />
        </div>

        <StaleLeadsPanel staleLeads={data.staleLeads} onSelect={goToKanban} />
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="mb-4 flex items-center gap-2">
          <span className="h-2 w-2 shrink-0 rounded-full bg-cyan-400" />
          <h3 className="text-sm font-medium text-white/80">Выручка по менеджерам</h3>
        </div>
        {data.revenueByManager.length === 0 ? (
          <p className="text-sm text-white/40">Пока нет оплаченных/закрытых сделок</p>
        ) : (
          <div className="space-y-1">
            {data.revenueByManager.map((m) => {
              const key = m.managerId ?? "unassigned";
              return (
                <BarRow
                  key={key}
                  label={m.managerName}
                  value={m.revenue}
                  valueLabel={rub(m.revenue)}
                  maxValue={maxRevenue}
                  title={`${m.managerName}: ${rub(m.revenue)}, ${m.dealCount} сделок — нажмите, чтобы посмотреть`}
                  open={openManager === key}
                  onToggle={() => setOpenManager((s) => (s === key ? null : key))}
                >
                  <LeadsMiniList
                    leads={data.leads.filter(
                      (l) => (l.managerId ?? "unassigned") === key && ["paid", "shipped", "closed"].includes(l.status),
                    )}
                  />
                </BarRow>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
