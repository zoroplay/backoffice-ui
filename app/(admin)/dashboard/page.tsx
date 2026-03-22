"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
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

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DateRangeFilter, defaultDateRange } from "@/components/common/DateRangeFilter";
import { FilterActions } from "@/components/common/FilterActions";
import { DataTable } from "@/components/tables/DataTable";
import Badge from "@/components/ui/badge/Badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "@/context/ThemeContext";
import { dashboardApi } from "@/lib/api";
import { withAuth } from "@/utils/withAuth";
import type { Range } from "react-date-range";
import { LoadingState } from "@/components/common/LoadingState";

type DashboardProductTabKey = "overall" | "sport" | "agents" | "mobile";

type DashboardProductRow = {
  product: string;
  turnover: number;
  margin: number;
  ggr: number;
  bonusGiven: number;
  bonusSpent: number;
  ngr: number;
};

type DashboardFinancialRow = {
  label: string;
  value: string;
};

type RealtimeData = {
  onlinePlayers: number;
  newPlayers: number;
  totalPlayers: number;
};

type StatisticsChartPoint = {
  month: string;
  games: number;
  casino: number;
  sport: number;
  virtual: number;
};

const monthOrder = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const productLabelMap: Record<DashboardProductTabKey, string> = {
  overall: "Overall Gaming",
  sport: "Sport",
  agents: "Agents",
  mobile: "Mobile",
};

function Dashboard() {
  const { theme } = useTheme();
  const [dateRange, setDateRange] = useState<Range>(defaultDateRange);
  const [activeProductTab, setActiveProductTab] =
    useState<DashboardProductTabKey>("overall");

  const [overallRows, setOverallRows] = useState<DashboardProductRow[]>([]);
  const [sportRows, setSportRows] = useState<DashboardProductRow[]>([]);
  const [agentRows, setAgentRows] = useState<DashboardProductRow[]>([]);
  const [mobileRows, setMobileRows] = useState<DashboardProductRow[]>([]);

  const [realtimeData, setRealtimeData] = useState<RealtimeData>({
    onlinePlayers: 0,
    newPlayers: 0,
    totalPlayers: 0,
  });
  const [chartData, setChartData] = useState<StatisticsChartPoint[]>(
    monthOrder.map((month) => ({
      month: month.slice(0, 3),
      games: 0,
      casino: 0,
      sport: 0,
      virtual: 0,
    }))
  );
  const [financialCards, setFinancialCards] = useState<DashboardFinancialRow[]>([]);
  const [balanceCards, setBalanceCards] = useState<DashboardFinancialRow[]>([]);

  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);
  const [isLoadingTabs, setIsLoadingTabs] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const toNumber = (value: unknown): number => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const parseMargin = (value: unknown): number => {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const parsed = Number(value.replace("%", "").trim());
      return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
  };

  const fmtDate = (date?: Date): string => {
    if (!date) return "";
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const mapProductRows = useCallback((response: unknown): DashboardProductRow[] => {
    const root = (response as { data?: unknown })?.data ?? response;
    const list =
      ((root as { data?: unknown })?.data as unknown[]) ||
      (Array.isArray(root) ? root : []);

    if (!Array.isArray(list)) return [];
    return list.map((row) => {
      const rec = (row as Record<string, unknown>) ?? {};
      return {
        product: String(rec.product ?? "-"),
        turnover: toNumber(rec.turnover),
        margin: parseMargin(rec.margin),
        ggr: toNumber(rec.ggr),
        bonusGiven: toNumber(rec.bonusGiven),
        bonusSpent: toNumber(rec.bonusSpent),
        ngr: toNumber(rec.ngr),
      };
    });
  }, []);

  const mapStatistics = useCallback((response: unknown): StatisticsChartPoint[] => {
    const root = (response as { data?: unknown })?.data ?? response;
    const rows =
      ((root as { data?: unknown })?.data as unknown[]) ||
      (Array.isArray(root) ? root : []);

    const points = monthOrder.map((month) => ({
      month: month.slice(0, 3),
      games: 0,
      casino: 0,
      sport: 0,
      virtual: 0,
    }));

    if (!Array.isArray(rows)) return points;

    rows.forEach((item) => {
      const rec = (item as Record<string, unknown>) ?? {};
      const product = String(rec.product ?? "").toLowerCase();
      const monthlyData = (rec.monthlyData as unknown[]) ?? [];

      monthlyData.forEach((entry) => {
        const e = (entry as Record<string, unknown>) ?? {};
        const month = String(e.month ?? "");
        const monthIndex = monthOrder.findIndex(
          (label) => label.toLowerCase() === month.toLowerCase()
        );
        if (monthIndex < 0) return;
        const turnover = toNumber(e.turnover);

        if (product.includes("game")) points[monthIndex].games = turnover;
        if (product.includes("casino")) points[monthIndex].casino = turnover;
        if (product.includes("sport")) points[monthIndex].sport = turnover;
        if (product.includes("virtual")) points[monthIndex].virtual = turnover;
      });
    });

    return points;
  }, []);

  const loadTabData = useCallback(
    async (range: Range) => {
      setIsLoadingTabs(true);
      setError(null);
      try {
        const params = {
          from: fmtDate(range.startDate),
          to: fmtDate(range.endDate),
        };

        const [overallRes, sportsRes, shopRes, onlineRes] = await Promise.all([
          dashboardApi.getOverallGaming(params),
          dashboardApi.getSportsData(params),
          dashboardApi.getShopData(params),
          dashboardApi.getOnlineData(params),
        ]);

        setOverallRows(mapProductRows(overallRes));
        setSportRows(mapProductRows(sportsRes));
        setAgentRows(mapProductRows(shopRes));
        setMobileRows(mapProductRows(onlineRes));
      } catch (err) {
        const message =
          (err as { message?: string })?.message ?? "Failed to fetch dashboard data";
        setError(message);
        setOverallRows([]);
        setSportRows([]);
        setAgentRows([]);
        setMobileRows([]);
      } finally {
        setIsLoadingTabs(false);
      }
    },
    [mapProductRows]
  );

  const loadStaticDashboardData = useCallback(async () => {
    try {
      const [realtimeRes, balanceRes, statsRes, financialRes] = await Promise.all([
        dashboardApi.getRealtimeData(),
        dashboardApi.getPlayerBalance(),
        dashboardApi.getStatistics(),
        dashboardApi.getFinancialPerformance(),
      ]);

      const realtimeRoot = (realtimeRes as Record<string, unknown>) ?? {};
      const realtimePayload =
        ((realtimeRoot.data as Record<string, unknown>) ??
          (realtimeRoot.result as Record<string, unknown>) ??
          realtimeRoot) as Record<string, unknown>;

      setRealtimeData({
        onlinePlayers: toNumber(realtimePayload.onlinePlayers),
        newPlayers: toNumber(realtimePayload.newPlayers),
        totalPlayers: toNumber(realtimePayload.totalPlayers),
      });

      const balanceRoot =
        ((balanceRes as { data?: unknown })?.data as Record<string, unknown>) ??
        (balanceRes as Record<string, unknown>) ??
        {};
      setBalanceCards([
        {
          label: "Total Online Player Balance",
          value: currencyFormatter.format(toNumber(balanceRoot.totalOnlinePlayerBalance)),
        },
        {
          label: "Total Online Player Bonus",
          value: currencyFormatter.format(toNumber(balanceRoot.totalOnlinePlayerBonus)),
        },
        {
          label: "Total Retail Balance",
          value: currencyFormatter.format(toNumber(balanceRoot.totalRetailBalance)),
        },
        {
          label: "Total Retail Trust Balance",
          value: currencyFormatter.format(toNumber(balanceRoot.totalRetailTrustBalance)),
        },
      ]);

      const finRoot =
        ((financialRes as { data?: unknown })?.data as Record<string, unknown>) ??
        (financialRes as Record<string, unknown>) ??
        {};
      setFinancialCards([
        {
          label: "Total Deposits",
          value: currencyFormatter.format(toNumber(finRoot.totalDeposit)),
        },
        {
          label: "Total Withdrawals",
          value: currencyFormatter.format(toNumber(finRoot.totalWithdrawal)),
        },
      ]);

      setChartData(mapStatistics(statsRes));
    } catch (err) {
      const message =
        (err as { message?: string })?.message ??
        "Failed to fetch dashboard summary data";
      setError(message);
      setRealtimeData({
        onlinePlayers: 0,
        newPlayers: 0,
        totalPlayers: 0,
      });
      setFinancialCards([]);
      setBalanceCards([]);
    }
  }, [currencyFormatter, mapStatistics]);

  useEffect(() => {
    let cancelled = false;
    const bootstrap = async () => {
      setIsLoadingDashboard(true);
      await Promise.all([loadTabData(defaultDateRange), loadStaticDashboardData()]);
      if (!cancelled) setIsLoadingDashboard(false);
    };
    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [loadStaticDashboardData, loadTabData]);

  const handleClearFilters = () => {
    setDateRange(defaultDateRange);
    void loadTabData(defaultDateRange);
  };

  const handleApplyFilters = () => {
    void loadTabData(dateRange);
  };

  const renderFinancialCards = (rows: DashboardFinancialRow[]) => (
    <div className="grid gap-3 sm:grid-cols-2">
      {rows.map((metric) => (
        <div
          key={metric.label}
          className="group relative overflow-hidden rounded-xl border border-gray-100 bg-gradient-to-br from-white via-white to-gray-50 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-gray-800 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900"
        >
          <div className="relative flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              {metric.label}
            </p>
            <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {metric.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );

  const productColumns = useMemo<ColumnDef<DashboardProductRow>[]>(
    () => [
      {
        accessorKey: "product",
        header: "Product",
        cell: ({ row }) => (
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {row.original.product}
          </span>
        ),
      },
      {
        accessorKey: "turnover",
        header: "Turnover",
        cell: ({ getValue }) => currencyFormatter.format(getValue<number>()),
      },
      {
        accessorKey: "margin",
        header: "Margin %",
        cell: ({ getValue }) => percentFormatter(getValue<number>()),
      },
      {
        accessorKey: "ggr",
        header: "GGR",
        cell: ({ getValue }) => currencyFormatter.format(getValue<number>()),
      },
      {
        accessorKey: "bonusGiven",
        header: "Bonus Given",
        cell: ({ getValue }) => currencyFormatter.format(getValue<number>()),
      },
      {
        accessorKey: "bonusSpent",
        header: "Bonus Spent",
        cell: ({ getValue }) => currencyFormatter.format(getValue<number>()),
      },
      {
        accessorKey: "ngr",
        header: "NGR",
        cell: ({ getValue }) => currencyFormatter.format(getValue<number>()),
      },
    ],
    [currencyFormatter]
  );

  const summaryCards = useMemo(() => {
    const totals = overallRows.reduce(
      (acc, row) => {
        acc.turnover += row.turnover;
        acc.ggr += row.ggr;
        acc.bonusSpent += row.bonusSpent;
        acc.ngr += row.ngr;
        return acc;
      },
      { turnover: 0, ggr: 0, bonusSpent: 0, ngr: 0 }
    );

    return [
      { id: "turnover", label: "Total Turnover", value: currencyFormatter.format(totals.turnover) },
      { id: "ggr", label: "Gross Gaming Revenue", value: currencyFormatter.format(totals.ggr) },
      { id: "bonus", label: "Bonus Spent", value: currencyFormatter.format(totals.bonusSpent) },
      { id: "ngr", label: "Net Gaming Revenue", value: currencyFormatter.format(totals.ngr) },
    ];
  }, [currencyFormatter, overallRows]);

  const productTabs = useMemo(
    () => [
      { key: "overall" as const, rows: overallRows },
      { key: "sport" as const, rows: sportRows },
      { key: "agents" as const, rows: agentRows },
      { key: "mobile" as const, rows: mobileRows },
    ],
    [overallRows, sportRows, agentRows, mobileRows]
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

        <div className="mt-6 flex w-full flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase text-gray-500 dark:text-gray-400">
              Date Range
            </p>
            <DateRangeFilter range={dateRange} onChange={setDateRange} />
          </div>
          <div className="w-full md:w-auto">
            <FilterActions
              onSearch={handleApplyFilters}
              onClear={handleClearFilters}
              isLoading={isLoadingTabs}
            />
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
      ) : null}

      {isLoadingDashboard ? <LoadingState className="py-8" /> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((metric) => (
          <div
            key={metric.id}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950"
          >
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {metric.label}
            </p>
            <p className="mt-3 text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
              {metric.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2.3fr),minmax(0,1fr)]">
        <div className="space-y-6 min-w-0">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
            <Tabs
              value={activeProductTab}
              onValueChange={(value) => setActiveProductTab(value as DashboardProductTabKey)}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-4 dark:border-gray-800">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    Product Turnover Snapshot
                  </h3>
                </div>
                <TabsList className="hidden gap-2 rounded-full border border-gray-200 bg-transparent p-1 md:flex dark:border-gray-800">
                  {(["overall", "sport", "agents", "mobile"] as DashboardProductTabKey[]).map(
                    (tab) => (
                      <TabsTrigger
                        key={tab}
                        value={tab}
                        className="rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 transition data-[state=active]:bg-brand-500 data-[state=active]:text-white dark:text-gray-400 dark:data-[state=active]:bg-brand-400 dark:data-[state=active]:text-gray-950"
                      >
                        {productLabelMap[tab]}
                      </TabsTrigger>
                    )
                  )}
                </TabsList>
              </div>
              {productTabs.map((tab) => (
                <TabsContent key={tab.key} value={tab.key} className="px-5 pb-5 pt-4">
                  {isLoadingTabs ? (
                    <LoadingState className="py-8" />
                  ) : (
                    <DataTable columns={productColumns} data={tab.rows} />
                  )}
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
              </div>
              <Badge variant="light" color="info" size="sm">
                Live API
              </Badge>
            </div>
            <div className="mt-5 h-[320px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
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
                  />
                  <Tooltip
                    cursor={{
                      fill: isDark
                        ? "rgba(148, 163, 184, 0.08)"
                        : "rgba(59, 130, 246, 0.08)",
                    }}
                    contentStyle={{
                      background: chartTooltipBg,
                      border: `1px solid ${chartTooltipBorder}`,
                      borderRadius: "12px",
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
              {[
                { label: "Online Players", value: String(realtimeData.onlinePlayers) },
                { label: "New Players", value: String(realtimeData.newPlayers) },
                { label: "Total Players", value: String(realtimeData.totalPlayers) },
              ].map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-xl border border-gray-100 p-4 shadow-sm dark:border-gray-800"
                >
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    {metric.label}
                  </span>
                  <p className="mt-3 text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {metric.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Open Bets
            </h3>
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              Open bets API is currently unavailable.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Financial Performance
            </h3>
            <div className="mt-4">{renderFinancialCards(financialCards)}</div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Player Balances
            </h3>
            <div className="mt-4">{renderFinancialCards(balanceCards)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(Dashboard);
