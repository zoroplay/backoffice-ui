"use client";

import React, { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Bar,
} from "recharts";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DateRangeFilter, defaultDateRange } from "@/components/common/DateRangeFilter";
import { FilterActions } from "@/components/common/FilterActions";
import { DataTable } from "@/components/tables/DataTable";
import Badge from "@/components/ui/badge/Badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";
import { withAuth } from "@/utils/withAuth";
import type { Range } from "react-date-range";

import {
  financialPerformance,
  openBets,
  productTabs,
  playerBalances,
  realtimeMetrics,
  summaryMetrics,
  turnoverChartData,
  type DashboardFinancialRow,
  type DashboardSummaryMetric,
  type DashboardProductTabKey,
  type DashboardProductRow,
} from "./data";

type OpenBetTabKey = keyof typeof openBets;

const realtimeAccentPalette = [
  "bg-emerald-400/90",
  "bg-brand-500/90",
  "bg-orange-400/90",
  "bg-sky-400/90",
  "bg-purple-400/90",
  "bg-rose-500/90",
] as const;

const trendIconMap: Record<NonNullable<DashboardSummaryMetric["delta"]>["trend"], React.ReactNode> = {
  up: <TrendingUp className="h-4 w-4 text-success-500" />,
  down: <TrendingDown className="h-4 w-4 text-error-500" />,
  flat: <Minus className="h-4 w-4 text-gray-400" />,
};

function Dashboard() {
  const { theme } = useTheme();
  const [dateRange, setDateRange] = useState<Range>(defaultDateRange);
  const [activeBetTab, setActiveBetTab] = useState<OpenBetTabKey>("single");
  const [activeProductTab, setActiveProductTab] =
    useState<DashboardProductTabKey>("overall");

  const normalizedTheme: "light" | "dark" = theme === "dark" ? "dark" : "light";

  const isDark = normalizedTheme === "dark";

  const chartAxisColor = isDark ? "#98a2b3" : "#667085";
  const chartGridColor = isDark ? "rgba(152, 162, 179, 0.2)" : "rgba(209, 213, 219, 0.6)";
  const chartTooltipBg = isDark ? "#101828" : "#ffffff";
  const chartTooltipBorder = isDark ? "#1d2939" : "#e5e7eb";

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        maximumFractionDigits: 0,
      }),
    []
  );

  const percentFormatter = (value: number) => `${value.toFixed(1)}%`;

  const handleClearFilters = () => {
    setDateRange(defaultDateRange);
  };

  const handleApplyFilters = () => {
    // Placeholder: would trigger data fetch / refresh in real integration
  };

  const renderFinancialCards = (rows: DashboardFinancialRow[]) => (
    <div className="grid gap-3 sm:grid-cols-2">
      {rows.map((metric) => (
        <div
          key={metric.label}
          className="group relative overflow-hidden rounded-xl border border-gray-100 bg-gradient-to-br from-white via-white to-gray-50 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-gray-800 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900"
        >
          <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-brand-500/0 via-brand-500/0 to-brand-500/0 opacity-0 transition group-hover:from-brand-500/8 group-hover:via-brand-500/0 group-hover:to-brand-500/12 group-hover:opacity-100 dark:group-hover:from-brand-400/15 dark:group-hover:to-brand-400/10" />
          <div className="relative flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              {metric.label}
            </p>
            <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {metric.value}
            </p>
            {metric.helper && (
              <span className="inline-flex w-fit items-center rounded-full bg-brand-500/10 px-2 py-0.5 text-[11px] font-semibold text-brand-600 dark:bg-brand-500/20 dark:text-brand-200">
                {metric.helper}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const productColumns = useMemo<ColumnDef<DashboardProductRow>[]>(
    () => [
      {
        accessorKey: "product",
        header: () => (
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Product
          </span>
        ),
        cell: ({ row }) => (
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {row.original.product}
          </span>
        ),
        meta: { cellClassName: "text-center" },
      },
      {
        accessorKey: "turnover",
        header: () => (
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Turnover
          </span>
        ),
        cell: ({ getValue }) => (
          <span className="font-medium text-gray-700 dark:text-gray-200">
            {currencyFormatter.format(getValue<number>())}
          </span>
        ),
      },
      {
        accessorKey: "margin",
        header: () => (
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Margin %
          </span>
        ),
        cell: ({ getValue }) => (
          <span className="font-medium text-gray-700 dark:text-gray-200">
            {percentFormatter(getValue<number>())}
          </span>
        ),
      },
      {
        accessorKey: "ggr",
        header: () => (
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            GGR
          </span>
        ),
        cell: ({ getValue }) => (
          <span className="font-medium text-gray-700 dark:text-gray-200">
            {currencyFormatter.format(getValue<number>())}
          </span>
        ),
      },
      {
        accessorKey: "bonusGiven",
        header: () => (
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Bonus Given
          </span>
        ),
        cell: ({ getValue }) => (
          <span className="font-medium text-gray-700 dark:text-gray-200">
            {currencyFormatter.format(getValue<number>())}
          </span>
        ),
        meta: { cellClassName: "whitespace-nowrap" },
      },
      {
        accessorKey: "bonusSpent",
        header: () => (
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Bonus Spent
          </span>
        ),
        cell: ({ getValue }) => (
          <span className="font-medium text-gray-700 dark:text-gray-200">
            {currencyFormatter.format(getValue<number>())}
          </span>
        ),
        meta: { cellClassName: "whitespace-nowrap" },
      },
      {
        accessorKey: "ngr",
        header: () => (
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            NGR
          </span>
        ),
        cell: ({ getValue }) => (
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {currencyFormatter.format(getValue<number>())}
          </span>
        ),
      },
    ],
    [currencyFormatter]
  );

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Home · Dashboard" />

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Operational Overview
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Track turnover, player activity, and product performance in real-time.
            </p>
          </div>
        </div>

        <div className=" w-full mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 uppercase">Date Range</p>
            <DateRangeFilter range={dateRange} onChange={setDateRange} />
          </div>

          <div className="w-full md:w-auto">
            <FilterActions onSearch={handleApplyFilters} onClear={handleClearFilters} />
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryMetrics.map((metric) => (
          <div
            key={metric.id}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-950"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{metric.label}</p>
              {metric.delta && (
                <Badge variant="light" size="sm">
                  {trendIconMap[metric.delta.trend]}
                </Badge>
              )}
            </div>
            <p className="mt-3 text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
              {metric.value}
            </p>
            {metric.delta && (
              <p
                className={cn(
                  "mt-2 text-sm font-medium",
                  metric.delta.trend === "up" && "text-success-500",
                  metric.delta.trend === "down" && "text-error-500",
                  metric.delta.trend === "flat" && "text-gray-400 dark:text-gray-500"
                )}
              >
                {`${metric.delta.value} ${metric.delta.label}`}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2.3fr),minmax(0,1fr)]">
        <div className="space-y-6 min-w-0">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
            <Tabs value={activeProductTab} onValueChange={(value) => setActiveProductTab(value as DashboardProductTabKey)}>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-4 dark:border-gray-800">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    Product Turnover Snapshot
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Compare performance across product groups, channels, and partners.
                  </p>
                </div>
                <TabsList className="hidden md:flex bg-transparent gap-2 rounded-full border border-gray-200 p-1 dark:border-gray-800">
                  {productTabs.map((tab) => (
                    <TabsTrigger
                      key={tab.key}
                      value={tab.key}
                      className="rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 transition data-[state=active]:bg-brand-500 data-[state=active]:text-white dark:text-gray-400 dark:data-[state=active]:bg-brand-400 dark:data-[state=active]:text-gray-950"
                    >
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
              {productTabs.map((tab) => (
                <TabsContent key={tab.key} value={tab.key} className="px-5 pb-5 pt-4">
                  <DataTable columns={productColumns} data={tab.rows} />
                </TabsContent>
              ))}
            </Tabs>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  Overall Turnover (YTD)
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Monthly turnover trends split across Games, Casino, Sport, and Virtual segments.
                </p>
              </div>
              <Badge variant="light" color="info" size="sm">
                Updated 5 mins ago
              </Badge>
            </div>
            <div className="mt-5 h-[320px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={turnoverChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid stroke={chartGridColor} strokeDasharray="4 6" />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: chartAxisColor, fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: chartAxisColor, fontSize: 12 }}
                    tickFormatter={(value) => `${value}`}
                  />
                  <Tooltip
                    cursor={{ fill: isDark ? "rgba(148, 163, 184, 0.08)" : "rgba(59, 130, 246, 0.08)" }}
                    contentStyle={{
                      background: chartTooltipBg,
                      border: `1px solid ${chartTooltipBorder}`,
                      borderRadius: "12px",
                      boxShadow: "0 12px 16px -4px rgba(15, 23, 42, 0.18)",
                    }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: 12 }} />
                  <Bar dataKey="sport" fill="#2563eb" radius={[6, 6, 0, 0]} name="Sport" />
                  <Area
                    type="monotone"
                    dataKey="casino"
                    stroke="#7c3aed"
                    fill="rgba(124, 58, 237, 0.18)"
                    strokeWidth={2}
                    name="Casino"
                    activeDot={{ r: 6 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="games"
                    stroke="#16a34a"
                    fill="rgba(22, 163, 74, 0.18)"
                    strokeWidth={2}
                    name="Games"
                  />
                  <Area
                    type="monotone"
                    dataKey="virtual"
                    stroke="#f97316"
                    fill="rgba(249, 115, 22, 0.18)"
                    strokeWidth={2}
                    name="Virtual"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="space-y-6 min-w-0">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Realtime Data
            </h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {realtimeMetrics.map((metric, index) => {
                const accent = realtimeAccentPalette[index % realtimeAccentPalette.length];
                return (
                  <div
                    key={metric.label}
                    className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white/80 p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-gray-800 dark:bg-gray-950/80"
                  >
                    <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-brand-500/0 to-brand-500/0 opacity-0 transition group-hover:from-brand-500/10 group-hover:to-transparent group-hover:opacity-100 dark:group-hover:from-brand-400/15" />
                    <div className="relative flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        {metric.label}
                      </span>
                      <span
                        className={cn(
                          "h-2.5 w-2.5 rounded-full ring-2 ring-white/80 shadow-sm transition group-hover:scale-110 dark:ring-gray-950",
                          accent
                        )}
                      />
                    </div>
                    <p className="relative mt-3 text-xl font-semibold text-gray-900 dark:text-gray-100">
                      {metric.value}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
            <Tabs
              value={activeBetTab}
              onValueChange={(value) => setActiveBetTab(value as OpenBetTabKey)}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4 dark:border-gray-800">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    Open Bets
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Exposure overview by bet type and market risk.
                  </p>
                </div>
                <TabsList className="bg-transparent gap-2 rounded-full border border-gray-100 p-1 dark:border-gray-800">
                  <TabsTrigger
                    value="single"
                    className="rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500 transition data-[state=active]:bg-brand-500 data-[state=active]:text-white dark:text-gray-400 dark:data-[state=active]:bg-brand-400 dark:data-[state=active]:text-gray-950"
                  >
                    Single Bets
                  </TabsTrigger>
                  <TabsTrigger
                    value="combo"
                    className="rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500 transition data-[state=active]:bg-brand-500 data-[state=active]:text-white dark:text-gray-400 dark:data-[state=active]:bg-brand-400 dark:data-[state=active]:text-gray-950"
                  >
                    Combo Bets
                  </TabsTrigger>
                </TabsList>
              </div>
              {(["single", "combo"] as OpenBetTabKey[]).map((key) => (
                <TabsContent key={key} value={key} className="pt-4">
                  <div className="space-y-3">
                    {openBets[key].map((metric) => (
                      <div
                        key={metric.label}
                        className="rounded-xl border border-gray-100 px-4 py-3 dark:border-gray-800"
                      >
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                          {metric.label}
                        </p>
                        <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {metric.value}
                        </p>
                        {metric.trend && (
                          <p className="text-xs text-gray-400 dark:text-gray-500">{metric.trend}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Financial Performance
            </h3>
            <div className="mt-4">{renderFinancialCards(financialPerformance)}</div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Player Balances
            </h3>
            <div className="mt-4">{renderFinancialCards(playerBalances)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(Dashboard);
