"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { Range } from "react-date-range";
import type { SingleValue } from "react-select";
import { DollarSign, Calendar, CheckCircle2, Gift } from "lucide-react";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { defaultDateRange } from "@/components/common/DateRangeFilter";
import { DataTable } from "@/components/tables/DataTable";
import Button from "@/components/ui/button/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { withAuth } from "@/utils/withAuth";
import { TableFilterToolbar } from "@/components/common/TableFilterToolbar";
import { agentsApi, normalizeApiError } from "@/lib/api";

import { columns, Commission } from "./columns";

const cloneRange = (range: Range) => ({
  startDate: range.startDate ? new Date(range.startDate) : undefined,
  endDate: range.endDate ? new Date(range.endDate) : undefined,
  key: "selection",
}) satisfies Range;

type SportOption = {
  value: string;
  label: string;
};

const sportOptions: SportOption[] = [
  { value: "sports", label: "Sports" },
  { value: "casino", label: "Casino" },
  { value: "poker", label: "Poker" },
  { value: "virtual", label: "Virtual" },
];

const formatDateParam = (date?: Date) => {
  if (!date) return "";
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseList = (input: unknown): unknown[] => {
  if (Array.isArray(input)) return input;
  if (!input || typeof input !== "object") return [];
  const root = input as Record<string, unknown>;

  const nestedData = root.data as Record<string, unknown> | undefined;
  if (Array.isArray(root.data)) return root.data as unknown[];
  if (nestedData && Array.isArray(nestedData.data)) return nestedData.data as unknown[];
  if (Array.isArray(root.results)) return root.results as unknown[];
  return [];
};

const parseMeta = (input: unknown) => {
  if (!input || typeof input !== "object") {
    return { page: 1, total: 0, totalPages: 1 };
  }
  const root = input as Record<string, unknown>;
  const meta =
    (root.meta as Record<string, unknown> | undefined) ||
    ((root.data as Record<string, unknown> | undefined)?.meta as
      | Record<string, unknown>
      | undefined);

  if (!meta) {
    return { page: 1, total: 0, totalPages: 1 };
  }

  return {
    page: Number(meta.page ?? 1),
    total: Number(meta.total ?? 0),
    totalPages: Number(meta.lastPage ?? meta.totalPages ?? 1),
  };
};

const toCommission = (item: unknown, index: number): Commission => {
  const row = (item as Record<string, unknown>) ?? {};
  const toNumber = (value: unknown) => {
    const num = Number(value ?? 0);
    return Number.isFinite(num) ? num : 0;
  };

  return {
    id: String(row.id ?? row.userId ?? row.agentId ?? index + 1),
    agent: String(row.agent ?? row.name ?? row.username ?? "N/A"),
    sport: String(row.sport ?? row.provider ?? "sports").toLowerCase(),
    reportDate: String(row.reportDate ?? row.date ?? row.createdAt ?? ""),
    commissionProfile: String(row.commissionProfile ?? row.profile ?? "N/A"),
    noOfTickets: toNumber(row.noOfTickets ?? row.no_of_tickets ?? row.ticketCount),
    amountPlayed: toNumber(row.amountPlayed ?? row.amount_played ?? row.turnover),
    totalWon: toNumber(row.totalWon ?? row.total_won ?? row.winning),
    net: toNumber(row.net ?? row.netAmount ?? row.net_amount),
    commissions: toNumber(
      row.commissions ?? row.commission ?? row.commissionAmount ?? row.commission_amount
    ),
    profit: toNumber(row.profit ?? row.ggr ?? row.margin),
  };
};

function CommissionsPage() {
  const [activeTab, setActiveTab] = useState<"weekly" | "paid" | "bonus">("weekly");
  const [selectedSport, setSelectedSport] = useState<SportOption | null>(null);
  const [appliedSport, setAppliedSport] = useState<string>("sports");
  const [selectedRange, setSelectedRange] = useState<Range>(() => cloneRange(defaultDateRange));
  const [appliedRange, setAppliedRange] = useState<Range>(() => cloneRange(defaultDateRange));
  const [rows, setRows] = useState<Commission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [rowSelection, setRowSelection] = useState({});

  useEffect(() => {
    let cancelled = false;

    const fetchCommissions = async () => {
      const from = formatDateParam(appliedRange.startDate);
      const to = formatDateParam(appliedRange.endDate);
      if (!from || !to) return;

      setIsLoading(true);
      setError(null);
      try {
        let response: unknown;
        if (activeTab === "weekly") {
          response = await agentsApi.getWeeklyCommissions({
            page,
            provider: appliedSport || "sports",
            from,
            to,
          });
        } else if (activeTab === "paid") {
          response = await agentsApi.getPaidCommissions({
            page,
            provider: appliedSport || "sports",
            from,
            to,
          });
        } else {
          response = await agentsApi.getPowerBonusCommissions({
            page,
            from,
            to,
          });
        }

        if (cancelled) return;
        const list = parseList(response).map((item, index) => toCommission(item, index));
        const meta = parseMeta(response);

        setRows(list);
        setTotal(meta.total || list.length);
        setTotalPages(meta.totalPages || 1);
      } catch (err) {
        if (cancelled) return;
        const apiError = normalizeApiError(err);
        setError(apiError.message ?? "Failed to fetch commissions");
        setRows([]);
        setTotal(0);
        setTotalPages(1);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void fetchCommissions();

    return () => {
      cancelled = true;
    };
  }, [activeTab, appliedRange.endDate, appliedRange.startDate, appliedSport, page]);

  const applyFilters = () => {
    const normalizedRange =
      selectedRange.startDate && selectedRange.endDate
        ? cloneRange(selectedRange)
        : cloneRange(defaultDateRange);
    setAppliedRange(normalizedRange);
    setAppliedSport(selectedSport?.value ?? "sports");
    setPage(1);
  };

  const clearFilters = () => {
    const resetRange = cloneRange(defaultDateRange);
    setSelectedSport(null);
    setAppliedSport("sports");
    setSelectedRange(resetRange);
    setAppliedRange(resetRange);
    setPage(1);
  };

  const handlePayAllAgents = () => {
    console.log("Pay all agents triggered", { tab: activeTab });
  };

  const paginationText = useMemo(
    () => `Page ${page} of ${totalPages} (${total} total rows)`,
    [page, total, totalPages]
  );

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Commissions Report" />

      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          setActiveTab(value as "weekly" | "paid" | "bonus");
          setPage(1);
        }}
        defaultValue="weekly"
        className="w-full"
      >
        <TabsList className="mb-6 h-auto rounded-xl border border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 p-1.5 shadow-sm dark:border-gray-700 dark:from-gray-800/50 dark:to-gray-800/30">
          <TabsTrigger
            value="weekly"
            className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium transition-all duration-200 hover:bg-gray-50 data-[state=active]:border data-[state=active]:border-blue-200 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md dark:hover:bg-gray-800 dark:data-[state=active]:border-blue-700 dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-blue-400"
          >
            <Calendar className="h-4 w-4" />
            Weekly Commissions
          </TabsTrigger>
          <TabsTrigger
            value="paid"
            className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium transition-all duration-200 hover:bg-gray-50 data-[state=active]:border data-[state=active]:border-green-200 data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-md dark:hover:bg-gray-800 dark:data-[state=active]:border-green-700 dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-green-400"
          >
            <CheckCircle2 className="h-4 w-4" />
            Paid Commissions
          </TabsTrigger>
          <TabsTrigger
            value="bonus"
            className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium transition-all duration-200 hover:bg-gray-50 data-[state=active]:border data-[state=active]:border-purple-200 data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-md dark:hover:bg-gray-800 dark:data-[state=active]:border-purple-700 dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-purple-400"
          >
            <Gift className="h-4 w-4" />
            Bonus Commissions
          </TabsTrigger>
        </TabsList>

        <TableFilterToolbar<SportOption>
          dateRange={selectedRange}
          onDateRangeChange={setSelectedRange}
          actions={{
            onSearch: applyFilters,
            onClear: clearFilters,
          }}
          selectProps={{
            options: sportOptions,
            placeholder: "Provider",
            value: selectedSport,
            onChange: (option: SingleValue<SportOption>) => setSelectedSport(option ?? null),
            isClearable: true,
            containerClassName: "max-w-[22rem]",
          }}
          isLoading={isLoading}
        />

        <div className="my-4 flex justify-end">
          <Button
            variant="primary"
            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600"
            onClick={handlePayAllAgents}
          >
            <DollarSign className="h-4 w-4" />
            Pay All Agents
          </Button>
        </div>

        {error ? (
          <div className="mb-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <TabsContent value="weekly" className="mt-0">
          <DataTable
            columns={columns}
            data={rows}
            loading={isLoading}
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
            hidePagination
          />
        </TabsContent>

        <TabsContent value="paid" className="mt-0">
          <DataTable
            columns={columns}
            data={rows}
            loading={isLoading}
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
            hidePagination
          />
        </TabsContent>

        <TabsContent value="bonus" className="mt-0">
          <DataTable
            columns={columns}
            data={rows}
            loading={isLoading}
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
            hidePagination
          />
        </TabsContent>
      </Tabs>

      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="text-sm text-gray-700 dark:text-gray-300">{paginationText}</div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(1)}
            disabled={page <= 1 || isLoading}
          >
            First
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page <= 1 || isLoading}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={page >= totalPages || isLoading}
          >
            Next
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(totalPages)}
            disabled={page >= totalPages || isLoading}
          >
            Last
          </Button>
        </div>
      </div>
    </div>
  );
}

export default withAuth(CommissionsPage);

