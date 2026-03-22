"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { GroupBase, StylesConfig, MultiValue } from "react-select";
import makeAnimated from "react-select/animated";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DataTable } from "@/components/tables/DataTable";
import { columns, TicketOnHold } from "./columns";

import { withAuth } from "@/utils/withAuth";
import { reactSelectStyles } from "@/utils/reactSelectStyles";
import { useTheme } from "@/context/ThemeContext";
import { TableFilterToolbar } from "@/components/common/TableFilterToolbar";
import type { Range } from "react-date-range";
import { betsApi, normalizeApiError } from "@/lib/api";
import { LoadingState } from "@/components/common/LoadingState";

// ----------------------
// Filter Options
// ----------------------
type FilterOption = { value: string; label: string };

type FilterCategory = "betType" | "stake" | "return" | "refresh" | "other";

const getFilterCategory = (value: string): FilterCategory => {
  if (["Single", "Multiple", "System"].includes(value)) {
    return "betType";
  }

  if (value.startsWith("stake_")) {
    return "stake";
  }

  if (value.startsWith("return_")) {
    return "return";
  }

  if (value.startsWith("refresh_")) {
    return "refresh";
  }

  return "other";
};

const filterOptions: Array<{
  label: string;
  options: FilterOption[];
}> = [
  {
    label: "Bet Type",
    options: [
      { value: "Single", label: "Single Bet" },
      { value: "Multiple", label: "Multiple Bet" },
      { value: "System", label: "System Bet" },
    ],
  },
  {
    label: "Stake Range",
    options: [
      { value: "stake_low", label: "Stake < ₦1,000" },
      { value: "stake_medium", label: "Stake ₦1,000 - ₦5,000" },
      { value: "stake_high", label: "Stake > ₦5,000" },
    ],
  },
  {
    label: "Potential Return",
    options: [
      { value: "return_low", label: "Return < ₦5,000" },
      { value: "return_medium", label: "Return ₦5,000 - ₦10,000" },
      { value: "return_high", label: "Return > ₦10,000" },
    ],
  },
  {
    label: "Refresh",
    options: [
      { value: "refresh_5", label: "Refresh 5 mins" },
      { value: "refresh_10", label: "Refresh 10 mins" },
      { value: "refresh_15", label: "Refresh 15 mins" },
      { value: "refresh_20", label: "Refresh 20 mins" },
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

const createDefaultDateRange = (): Range => ({
  startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
  endDate: new Date(),
  key: "selection",
});

function TicketOnHoldPage() {
  const { theme } = useTheme();  
  const [selectedFilters, setSelectedFilters] = useState<FilterOption[]>([]);
  const [filteredData, setFilteredData] = useState<TicketOnHold[]>([]);
  const [dateRange, setDateRange] = useState<Range>(createDefaultDateRange());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const emptyStateText = "Search to see data.";

  

  // ----------------------
  // Clear filters
  // ----------------------
  const handleClear = () => {
     setSelectedFilters([]);  
     setFilteredData([]);  
     setError(null);
     setDateRange(createDefaultDateRange());
     setHasSearched(false);
  };

  // Handle select change with category constraint
  const handleSelectChange = useCallback(
    (val: MultiValue<FilterOption>) => {
      if (!val || val.length === 0) {
        handleClear();
        return;
      }

      const nextSelection = val.reduce<FilterOption[]>((acc, option) => {
        const category = getFilterCategory(option.value);
        const existingIndex = acc.findIndex(
          (selected) => getFilterCategory(selected.value) === category
        );

        if (existingIndex !== -1) {
          acc.splice(existingIndex, 1);
        }

        acc.push(option);
        return acc;
      }, []);

      setSelectedFilters(nextSelection);
    },
    [handleClear]
  );

  // Apply filters
  const handleSearch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    const fmt = (d?: Date, endOfDay = false) => {
      if (!d) return "";
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const yyyy = d.getFullYear();
      return `${yyyy}-${mm}-${dd} ${endOfDay ? "23:59:59" : "00:00:00"}`;
    };

    const payload = selectedFilters.reduce<Record<string, string>>(
      (acc, option) => {
        const groupLabel = filterOptionGroupMap.get(option.value);
        if (!groupLabel) return acc;

        const keyMap: Record<string, string> = {
          "Bet Type": "betType",
          "Stake Range": "stakeRange",
          "Potential Return": "returnRange",
          Refresh: "refreshMinutes",
        };

        const key = keyMap[groupLabel] ?? groupLabel;
        acc[key] = option.value;
        return acc;
      },
      {}
    );

    payload.from = fmt(dateRange.startDate ?? undefined, false);
    payload.to = fmt(dateRange.endDate ?? undefined, true);

    try {
      const res = await betsApi.getTicketsOnHold(payload, 1);
      const root = (res as { data?: unknown })?.data ?? res;
      const list =
        (Array.isArray(root) && root) ||
        ((root as { data?: unknown })?.data as unknown[]) ||
        ((root as { rows?: unknown })?.rows as unknown[]) ||
        ((root as { results?: unknown })?.results as unknown[]) ||
        [];

      const rows = Array.isArray(list)
        ? list.map((row) => {
            const rec = (row as Record<string, unknown>) ?? {};
            return {
              betslipId: String(rec.betslipId ?? rec.betslip_id ?? rec.ticketId ?? ""),
              username: String(rec.username ?? rec.user ?? rec.player ?? ""),
              betType: String(rec.betType ?? rec.type ?? ""),
              selection: Number(rec.selection ?? rec.selections ?? 0),
              odds: Number(rec.odds ?? 0),
              stake: Number(rec.stake ?? 0),
              potentialReturn: Number(rec.potentialReturn ?? rec.returns ?? 0),
              clientType: String(rec.clientType ?? rec.channel ?? ""),
              dateTime: new Date(String(rec.dateTime ?? rec.createdAt ?? rec.date ?? "")),
            } as TicketOnHold;
          })
        : [];

      setFilteredData(rows);
    } catch (err) {
      const apiErr = normalizeApiError(err);
      setError(apiErr.message ?? "Failed to fetch tickets on hold");
      setFilteredData([]);
    } finally {
      setIsLoading(false);
    }
  }, [dateRange.endDate, dateRange.startDate, selectedFilters]);

  const refreshMinutes = useMemo(() => {
    const refresh = selectedFilters.find((f) => f.value.startsWith("refresh_"));
    if (!refresh) return 0;
    const minutes = Number(refresh.value.replace("refresh_", ""));
    return Number.isFinite(minutes) ? minutes : 0;
  }, [selectedFilters]);

  useEffect(() => {
    if (!hasSearched || refreshMinutes <= 0) return;
    const id = window.setInterval(() => {
      void handleSearch();
    }, refreshMinutes * 60 * 1000);

    return () => window.clearInterval(id);
  }, [handleSearch, hasSearched, refreshMinutes]);

  return (
    <div className="p-4">
      {/* Breadcrumb */}
      <PageBreadcrumb pageTitle="Tickets On Hold" />

      <TableFilterToolbar<FilterOption, true, GroupBase<FilterOption>>   
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
          placeholder: "Filter by Bet Type, Stake or Returns",
          value: selectedFilters,
          onChange: handleSelectChange,
          styles: reactSelectStyles(theme) as StylesConfig<FilterOption, true, GroupBase<FilterOption>>,
        }}
      />

      {/* Table */}
      <div className="mt-6">
        {isLoading ? (
          <LoadingState className="py-8" />
        ) : !hasSearched ? (
          <div className="flex justify-center py-8 text-gray-500">
            {emptyStateText}
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-3 rounded-md bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}
            <DataTable columns={columns} data={filteredData} />
          </>
        )}
      </div>
    </div>
  );
}

export default withAuth(TicketOnHoldPage);
