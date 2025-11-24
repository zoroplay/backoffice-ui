"use client";

import React, { useCallback, useMemo, useState } from "react";
import { type MultiValue } from "react-select";
import type { Range } from "react-date-range";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { defaultDateRange } from "@/components/common/DateRangeFilter";
import { DataTable } from "@/components/tables/DataTable";
import { withAuth } from "@/utils/withAuth";

import { columns, LiabilityRow } from "./columns";
import { liabilityData, LiabilityRecord } from "./data";
import { TableFilterToolbar } from "@/components/common/TableFilterToolbar";

type FilterOption = { value: string; label: string };

const filterOptions: { label: string; options: FilterOption[] }[] = [
  {
    label: "Category",
    options: [
      { value: "category:pre_match", label: "Pre Match" },
      { value: "category:live", label: "Live" },
      { value: "category:settled", label: "Settled" },
    ],
  },
  {
    label: "Sport",
    options: [
      { value: "sport:football", label: "Football" },
      { value: "sport:basketball", label: "Basketball" },
      { value: "sport:tennis", label: "Tennis" },
      { value: "sport:baseball", label: "Baseball" },
      { value: "sport:cricket", label: "Cricket" },
      { value: "sport:rugby", label: "Rugby" },
      { value: "sport:esports", label: "Esports" },
    ],
  },
  {
    label: "Market Type",
    options: [
      { value: "market:1x2", label: "1X2" },
      { value: "market:total_points", label: "Totals" },
      { value: "market:handicap", label: "Handicap" },
      { value: "market:correct_score", label: "Correct Score" },
      { value: "market:anytime", label: "Anytime Scorer" },
      { value: "market:both_teams", label: "BTTS" },
      { value: "market:winning_margin", label: "Winning Margin" },
      { value: "market:double_chance", label: "Double Chance" },
    ],
  },
];

const mapRecordToRow = (record: LiabilityRecord): LiabilityRow => ({
  id: record.id,
  sport: record.sport,
  tournament: record.tournament,
  event: record.event,
  date: record.date,
  market: record.market,
  selection: record.selection,
  price: record.price,
  betCount: record.betCount,
  liability: record.liability,
  exposure: record.exposure,
});

function LiabilityPage() {
  const [dateRange, setDateRange] = useState<Range>(defaultDateRange);
  const [selectedFilter, setSelectedFilter] = useState<FilterOption[]>([]);
  const [appliedFilter, setAppliedFilter] = useState<FilterOption[]>([]);
  const [appliedDateRange, setAppliedDateRange] = useState<Range | null>(null);
  const [rows, setRows] = useState<LiabilityRow[]>(liabilityData.map(mapRecordToRow));

  const filterData = useCallback(
    (
      filters: FilterOption[],
      range: Range | null
    ) => {
      let filtered = liabilityData.slice();

      // Apply multiple filters (one per group)
      filters.forEach((filter) => {
        const [filterType, filterValueRaw] = filter.value.split(":");
        const filterValue = filterValueRaw.toLowerCase();

        if (filterType === "category") {
          filtered = filtered.filter((item) => item.category.toLowerCase().replace(" ", "_") === filterValue);
        }

        if (filterType === "sport") {
          filtered = filtered.filter(
            (item) => item.sport.toLowerCase().replace(" ", "") === filterValue.replace(" ", "")
          );
        }

        if (filterType === "market") {
          filtered = filtered.filter((item) => {
            const marketKey = item.market
              .toLowerCase()
              .replace(/\s+/g, "_")
              .replace(/[^a-z0-9_]/g, "");
            return marketKey.includes(filterValue.replace(/[^a-z0-9_]/g, ""));
          });
        }
      });

      if (range && range.startDate && range.endDate) {
        const start = new Date(range.startDate);
        const end = new Date(range.endDate);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);

        filtered = filtered.filter((item) => {
          const eventDate = new Date(item.date);
          return eventDate >= start && eventDate <= end;
        });
      }

      return filtered.map(mapRecordToRow);
    },
    []
  );

  const handleSearch = () => {
    const nextFilter = selectedFilter;
    const nextRange = dateRange;
    setAppliedFilter(nextFilter);
    setAppliedDateRange(nextRange);
    setRows(filterData(nextFilter, nextRange));
  };

  const handleClear = () => {
    setSelectedFilter([]);
    setAppliedFilter([]);
    setDateRange(defaultDateRange);
    setAppliedDateRange(null);
    setRows(liabilityData.map(mapRecordToRow));
  };

  const handleFilterChange = (selected: MultiValue<FilterOption>) => {
    const selectedArray = selected || [];
    
    // Group filters by their type (category, sport, market)
    // If multiple items from the same group exist, keep only the last one
    const groupedFilters: Record<string, FilterOption> = {};
    
    selectedArray.forEach((filter) => {
      const [filterType] = filter.value.split(":");
      // This will overwrite any previous selection from the same group
      groupedFilters[filterType] = filter;
    });
    
    // Convert back to array
    setSelectedFilter(Object.values(groupedFilters));
  };

  const summary = useMemo(() => {
    if (rows.length === 0) {
      return {
        totalLiability: 0,
        totalExposure: 0,
      };
    }

    return rows.reduce(
      (acc, item) => {
        acc.totalLiability += item.liability;
        acc.totalExposure += item.exposure;
        return acc;
      },
      { totalLiability: 0, totalExposure: 0 }
    );
  }, [rows]);

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Liability" />

      <TableFilterToolbar<FilterOption, true>
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        actions={{
          onSearch: handleSearch,
          onClear: handleClear,
        }}
        selectProps={{
          options: filterOptions,
          placeholder: "Filter Options",
          value: selectedFilter,
          onChange: handleFilterChange,
          isMulti: true,
          isClearable: true,
        }}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Events</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">{rows.length}</p>
        </div>
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Liability</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">
            ₦{summary.totalLiability.toLocaleString()}
          </p>
        </div>
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Exposure</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">
            ₦{summary.totalExposure.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-t-2xl border border-b-0 border-gray-200 bg-gray-100 px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Results</h2>
        </div>
        <DataTable columns={columns} data={rows} />
      </div>
    </div>
  );
}

export default withAuth(LiabilityPage);

