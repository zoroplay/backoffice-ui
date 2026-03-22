"use client";

import React, { useCallback, useEffect, useState } from "react";
import type { Range } from "react-date-range";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DataTable } from "@/components/tables/DataTable";
import { defaultDateRange } from "@/components/common/DateRangeFilter";
import { withAuth } from "@/utils/withAuth";
import { cashflowApi, normalizeApiError } from "@/lib/api";
import { TableFilterToolbar } from "@/components/common/TableFilterToolbar";
import { Infotext } from "@/components/common/Info";

import { columns } from "./columns";
import { NetworkSalesReport } from "./columns";

const formatDDMMYYYY = (date?: Date) => {
  if (!date) return "";
  const day = `${date.getDate()}`.padStart(2, "0");
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const toNumber = (value: unknown) => {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) ? amount : 0;
};

const parseRows = (response: unknown): NetworkSalesReport[] => {
  if (!response || typeof response !== "object") return [];
  const root = response as Record<string, unknown>;
  const candidates = [
    root.data,
    root.rows,
    root.report,
    root.result,
    root.data && typeof root.data === "object"
      ? (root.data as Record<string, unknown>).rows
      : undefined,
  ];
  const list = candidates.find(Array.isArray) as unknown[] | undefined;
  if (!Array.isArray(list)) return [];

  return list.map((item, index) => {
    const row = (item as Record<string, unknown>) ?? {};
    return {
      id: String(row.id ?? index + 1),
      name: String(row.name ?? row.agentName ?? row.shopName ?? row.username ?? "-"),
      onlineSales: toNumber(row.onlineSales ?? row.online_sales),
      totalOnlineSales: toNumber(row.totalOnlineSales ?? row.total_online_sales),
      onlineWithdrawal: toNumber(row.onlineWithdrawal ?? row.online_withdrawal),
      totalOnlineWithdrawals: toNumber(
        row.totalOnlineWithdrawals ?? row.total_online_withdrawals
      ),
      onlineBalance: toNumber(row.onlineBalance ?? row.online_balance),
      availableBalance: toNumber(row.availableBalance ?? row.available_balance),
    };
  });
};

function NetworkSalesReportPage() {
  const [data, setData] = useState<NetworkSalesReport[]>([]);
  const [dateRange, setDateRange] = useState<Range>(defaultDateRange);
  const [appliedDateRange, setAppliedDateRange] = useState<Range>(defaultDateRange);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = useCallback(async (range: Range) => {
    const from = formatDDMMYYYY(range.startDate);
    const to = formatDDMMYYYY(range.endDate);
    if (!from || !to) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await cashflowApi.getRetailCashSales({ from, to });
      setData(parseRows(response));
    } catch (err) {
      const apiError = normalizeApiError(err);
      setError(apiError.message ?? "Failed to fetch retail cash sales report");
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchReport(appliedDateRange);
  }, [appliedDateRange, fetchReport]);

  const applyFilters = () => {
    const nextRange =
      dateRange.startDate && dateRange.endDate ? dateRange : defaultDateRange;
    setAppliedDateRange(nextRange);
  };

  const clearFilters = () => {
    setDateRange(defaultDateRange);
    setAppliedDateRange(defaultDateRange);
  };

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Network Sales Report" />
      <Infotext text="Filter by date range and click Search to load report data." />

      <TableFilterToolbar
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        actions={{
          onSearch: applyFilters,
          onClear: clearFilters,
        }}
        isLoading={isLoading}
      />

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <DataTable columns={columns} data={data} loading={isLoading} />
    </div>
  );
}

export default withAuth(NetworkSalesReportPage);

