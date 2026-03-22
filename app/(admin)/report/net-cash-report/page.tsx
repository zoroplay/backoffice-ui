"use client";

import React, { useState } from "react";
import type { GroupBase } from "react-select";
import makeAnimated from "react-select/animated";
import type { Range } from "react-date-range";
import type { MultiValue } from "react-select";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DataTable } from "@/components/tables/DataTable";
import { defaultDateRange } from "@/components/common/DateRangeFilter";
import { summaryColumns, groupColumns } from "./columns";
import { NetCashGroup, NetCashSummary } from "./columns";
import { withAuth } from "@/utils/withAuth";
import { TableFilterToolbar } from "@/components/common/TableFilterToolbar";
import { Infotext } from "@/components/common/Info";
import { normalizeApiError, reportsApi } from "@/lib/api";
import { LoadingState } from "@/components/common/LoadingState";

// ----------------------
// Filter Options
// ----------------------
const filterOptions = [
  {
    label: "Payment",
    options: [
      { value: "paystack", label: "Paystack" },
      { value: "internal transfer", label: "Internal Transfer" },
      { value: "bank transfer", label: "Bank Transfer" },
    ],
  },
  {
    label: "Client Type",
    options: [
      { value: "website", label: "Website" },
      { value: "mobile", label: "Mobile" },
      { value: "cashier", label: "Cashier" },
    ],
  },
];

const animatedComponents = makeAnimated();

const filterOptionGroupMap = filterOptions.reduce<Map<string, string>>(
  (map, group) => {
    group.options.forEach((option) => {
      map.set(option.value, group.label);
    });
    return map;
  },
  new Map()
);

type FilterSelection = { value: string; label: string };

function NetCashReport() {
  const [dateRange, setDateRange] = useState<Range>(defaultDateRange);
  const [selectedFilters, setSelectedFilters] = useState<FilterSelection[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const emptyStateText = "Search to see data.";

  const handleFilterChange = (value: MultiValue<FilterSelection>) => {
    const latestSelections = new Map<string, FilterSelection>();

    value.forEach((option) => {
      const groupKey = filterOptionGroupMap.get(option.value) ?? option.value;
      latestSelections.set(groupKey, option);
    });

    const uniqueSelections: FilterSelection[] = [];
    const seenGroups = new Set<string>();

    value.forEach((option) => {
      const groupKey = filterOptionGroupMap.get(option.value) ?? option.value;
      if (seenGroups.has(groupKey)) {
        return;
      }

      const latestOption = latestSelections.get(groupKey);
      if (latestOption?.value === option.value) {
        uniqueSelections.push(option);
        seenGroups.add(groupKey);
      }
    });

    setSelectedFilters(uniqueSelections);
  };

  // state for filtered data
  const [filteredSummary, setFilteredSummary] =
    useState<NetCashSummary[]>([]);
  const [filteredGroups, setFilteredGroups] =
    useState<NetCashGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toNumber = (value: unknown): number => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const toSummary = (row: Record<string, unknown>): NetCashSummary => ({
    deposits: toNumber(row.deposits ?? row.totalDeposits ?? row.depositCount),
    depositAmount: toNumber(
      row.depositAmount ?? row.totalDepositAmount ?? row.depositsAmount
    ),
    avgDepositAmount: toNumber(
      row.avgDepositAmount ?? row.averageDepositAmount ?? row.avgDeposit
    ),
    withdrawals: toNumber(
      row.withdrawals ?? row.totalWithdrawals ?? row.withdrawalCount
    ),
    withdrawalAmount: toNumber(
      row.withdrawalAmount ?? row.totalWithdrawalAmount ?? row.withdrawalsAmount
    ),
    avgWithdrawalAmount: toNumber(
      row.avgWithdrawalAmount ?? row.averageWithdrawalAmount ?? row.avgWithdrawal
    ),
    netCash: toNumber(row.netCash ?? row.net_cash ?? row.net),
    ratio: toNumber(
      row.ratio ?? row.netCashRatio ?? row.netCashToDepositRatio
    ),
    date: String(row.date ?? row.period ?? row.label ?? ""),
    paymentMethod: String(row.paymentMethod ?? row.method ?? ""),
    clientType: String(row.clientType ?? row.channel ?? ""),
  });

  const toGroup = (row: Record<string, unknown>): NetCashGroup => ({
    group: String(
      row.group ?? row.name ?? row.clientType ?? row.paymentMethod ?? ""
    ),
    deposits: toNumber(row.deposits ?? row.totalDeposits ?? row.depositCount),
    depositAmount: toNumber(
      row.depositAmount ?? row.totalDepositAmount ?? row.depositsAmount
    ),
    avgDepositAmount: toNumber(
      row.avgDepositAmount ?? row.averageDepositAmount ?? row.avgDeposit
    ),
    withdrawals: toNumber(
      row.withdrawals ?? row.totalWithdrawals ?? row.withdrawalCount
    ),
    withdrawalAmount: toNumber(
      row.withdrawalAmount ?? row.totalWithdrawalAmount ?? row.withdrawalsAmount
    ),
    avgWithdrawalAmount: toNumber(
      row.avgWithdrawalAmount ?? row.averageWithdrawalAmount ?? row.avgWithdrawal
    ),
    netCash: toNumber(row.netCash ?? row.net_cash ?? row.net),
    ratio: toNumber(
      row.ratio ?? row.netCashRatio ?? row.netCashToDepositRatio
    ),
    date: String(row.date ?? row.period ?? row.label ?? ""),
    paymentMethod: String(row.paymentMethod ?? row.method ?? ""),
    clientType: String(row.clientType ?? row.channel ?? ""),
  });

  // ----------------------
  // Clear filters
  // ----------------------
  const handleClear = () => {
    setDateRange(defaultDateRange);
    setSelectedFilters([]);
    setFilteredSummary([]);
    setFilteredGroups([]);
    setError(null);
    setHasSearched(false);
  };

  // ----------------------
  // Apply filters
  // ----------------------
  const handleSearch = async () => {
    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    const fmt = (d?: Date, endOfDay = false) => {
      if (!d) return "";
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const yyyy = d.getFullYear();
      return `${dd}-${mm}-${yyyy} ${endOfDay ? "23:59:59" : "00:00:00"}`;
    };

    try {
      const payload = {
        from: fmt(dateRange.startDate ?? undefined, false),
        to: fmt(dateRange.endDate ?? undefined, true),
        filters: selectedFilters.map((f) => f.value),
      } as const;

      const res = await reportsApi.getNetCashReport(payload, 1);
      const root = (res as { data?: unknown })?.data ?? res;

      const summarySource =
        ((root as { summary?: unknown })?.summary as unknown[]) ||
        ((root as { summaryData?: unknown })?.summaryData as unknown[]) ||
        ((root as { totals?: unknown })?.totals as unknown[]) ||
        [];

      const groupSource =
        ((root as { groups?: unknown })?.groups as unknown[]) ||
        ((root as { grouped?: unknown })?.grouped as unknown[]) ||
        ((root as { data?: unknown })?.data as unknown[]) ||
        (Array.isArray(root) ? root : []);

      setFilteredSummary(
        Array.isArray(summarySource)
          ? summarySource.map((row) =>
              toSummary((row as Record<string, unknown>) ?? {})
            )
          : []
      );
      setFilteredGroups(
        Array.isArray(groupSource)
          ? groupSource.map((row) =>
              toGroup((row as Record<string, unknown>) ?? {})
            )
          : []
      );
    } catch (err) {
      const apiErr = normalizeApiError(err);
      setError(apiErr.message ?? "Failed to fetch net cash report");
      setFilteredSummary([]);
      setFilteredGroups([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="space-y-6 p-4">
      {/* Breadcrumb */}
      <PageBreadcrumb pageTitle="Net Cash Report" />
      <Infotext text="Use the filters below to narrow down the results." />

      {/* Filters */}
      <TableFilterToolbar<FilterSelection, true, GroupBase<FilterSelection>>
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        actions={{
          onSearch: handleSearch,
          onClear: handleClear,
        }}
        selectProps={{
          containerClassName: "max-w-[22rem]",
          options: filterOptions,
          components: animatedComponents,
          isMulti: true,
          placeholder: "Filter by Payment or Client Type",
          value: selectedFilters,
          onChange: (val: MultiValue<FilterSelection>) => handleFilterChange(val),
        }}
      />

      {!hasSearched ? (
        <div className="flex justify-center py-8 text-gray-500">
          {emptyStateText}
        </div>
      ) : isLoading ? (
        <LoadingState className="py-8" />
      ) : (
        <>
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
          {/* First Table */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Total Net Cash</h2>
            <DataTable columns={summaryColumns} data={filteredSummary} />
          </div>

          {/* Second Table */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Results</h2>
            <DataTable columns={groupColumns} data={filteredGroups} />
          </div>
        </>
      )}
    </section>
  );
}

export default withAuth(NetCashReport);
