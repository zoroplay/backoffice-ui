"use client";

import React, { useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DataTable } from "@/components/tables/DataTable";
import type { Range } from "react-date-range";
import { defaultDateRange } from "@/components/common/DateRangeFilter";
import { columns } from "./columns";
import type { RetailCashRecord } from "./data";
import { normalizeApiError, reportsApi } from "@/lib/api";
import { withAuth } from "@/utils/withAuth";
import { TableFilterToolbar } from "@/components/common/TableFilterToolbar";
import { Infotext } from "@/components/common/Info";


function RetailCashReport() {
  const [dateRange, setDateRange] = useState<Range>(defaultDateRange);
  const [filteredData, setFilteredData] = useState<RetailCashRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toNumber = (value: unknown): number => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const toRetailCashRow = (row: Record<string, unknown>): RetailCashRecord => ({
    username: String(row.username ?? ""),
    deposits: toNumber(row.deposits ?? row.numberOfDeposits),
    depositAmount: toNumber(row.depositAmount ?? row.totalDeposits),
    withdrawals: toNumber(row.withdrawals ?? row.numberOfWithdrawals),
    withdrawalAmount: toNumber(row.withdrawalAmount ?? row.totalWithdrawals),
    date:
      row.date != null && String(row.date).trim().length > 0
        ? String(row.date)
        : undefined,
  });

  const getRowsFromResponse = (res: unknown): RetailCashRecord[] => {
    const root = (res as { data?: unknown })?.data ?? res;
    if (Array.isArray(root)) {
      return root.map((row) =>
        toRetailCashRow((row as Record<string, unknown>) ?? {})
      );
    }

    const nested = (root as { data?: unknown })?.data;
    if (Array.isArray(nested)) {
      return nested.map((row) =>
        toRetailCashRow((row as Record<string, unknown>) ?? {})
      );
    }

    return [];
  };

  const rowInDateRange = (item: RetailCashRecord, range: Range) => {
    if (!item.date) return true;
    const start = range.startDate ?? new Date("1900-01-01");
    const end = range.endDate ?? new Date("2100-12-31");
    const itemDate = new Date(item.date);
    if (Number.isNaN(itemDate.getTime())) return true;
    return itemDate >= start && itemDate <= end;
  };

  // ----------------------
  // Clear filters
  // ----------------------
  const handleClear = () => {
    setDateRange(defaultDateRange);
    setFilteredData([]);
    setError(null);
  };

  // ----------------------
  // Apply filters
  // ----------------------
  const handleSearch = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await reportsApi.getRetailCashReport();
      const rows = getRowsFromResponse(res);
      setFilteredData(rows.filter((item) => rowInDateRange(item, dateRange)));
    } catch (err) {
      const apiErr = normalizeApiError(err);
      setError(apiErr.message ?? "Failed to fetch retail cash report");
      setFilteredData([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-4">
      {/* Breadcrumb */}
      <PageBreadcrumb pageTitle="Retail Cash Report" />
      <Infotext text="Use the filters below to narrow down the results." />

      <TableFilterToolbar
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        isLoading={isLoading}
        actions={{
          onSearch: handleSearch,
          onClear: handleClear,
        }}
      />

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-8 text-gray-500">Loading...</div>
      ) : (
        <>
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <DataTable columns={columns} data={filteredData} />
        </>
      )}
    </div>
  );
}

export default withAuth(RetailCashReport);
