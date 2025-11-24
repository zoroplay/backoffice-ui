"use client";

import React, { useCallback, useMemo, useState } from "react";
import Select, { type SingleValue, type MultiValue } from "react-select";
import type { Range } from "react-date-range";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DateRangeFilter, defaultDateRange } from "@/components/common/DateRangeFilter";
import { FilterActions } from "@/components/common/FilterActions";
import { DataTable } from "@/components/tables/DataTable";
import { useTheme } from "@/context/ThemeContext";
import { reactSelectStyles } from "@/utils/reactSelectStyles";
import { withAuth } from "@/utils/withAuth";

import { columns, ProfitabilityRow } from "./columns";
import { profitabilityData, ProfitabilityRecord } from "./data";
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
      { value: "market:both_teams", label: "BTTS" },
      { value: "market:handicap", label: "Handicap" },
      { value: "market:totals", label: "Totals" },
      { value: "market:correct_score", label: "Correct Score" },
      { value: "market:double_chance", label: "Double Chance" },
      { value: "market:anytime", label: "Anytime Scorer" },
      { value: "market:moneyline", label: "Moneyline" },
      { value: "market:winning_margin", label: "Winning Margin" },
      { value: "market:halftime_fulltime", label: "Halftime/Fulltime" },
    ],
  },
];

const recordToRow = (record: ProfitabilityRecord): ProfitabilityRow => {
  const profit = record.settled - record.payout;
  const margin = record.settled === 0 ? 0 : (profit / record.settled) * 100;
  return {
    id: record.id,
    sport: record.sport,
    tournament: record.tournament,
    event: record.event,
    date: record.date,
    market: record.market,
    selection: record.selection,
    price: record.price,
    betCount: record.betCount,
    stake: record.stake,
    potentialWinnings: record.potentialWinnings,
    settled: record.settled,
    payout: record.payout,
    profit,
    margin,
  };
};

function ProfitabilityPage() {
  const [dateRange, setDateRange] = useState<Range>(defaultDateRange);
  const [selectedFilter, setSelectedFilter] = useState<FilterOption[]>([]);
  const [appliedFilter, setAppliedFilter] = useState<FilterOption | null>(null);
  const [appliedDateRange, setAppliedDateRange] = useState<Range | null>(null);
  const [rows, setRows] = useState<ProfitabilityRow[]>(profitabilityData.map(recordToRow));

  const handleFilterChange = (newValue: MultiValue<FilterOption>) => {
    if (!newValue || newValue.length === 0) {
      setSelectedFilter([]);
      return;
    }

    // Ensure only one entry per group (by prefix before colon)
    const filterMap = new Map<string, FilterOption>();
    
    Array.from(newValue).forEach((filter) => {
      const [groupType] = filter.value.split(":");
      filterMap.set(groupType, filter);
    });
    
    setSelectedFilter(Array.from(filterMap.values()));
  };

  const filterData = useCallback(
    (
      filter: FilterOption | null = appliedFilter,
      range: Range | null = appliedDateRange
    ) => {
      let filtered = profitabilityData.slice();

      if (filter) {
        const [filterType, rawValue] = filter.value.split(":");
        const value = rawValue.toLowerCase();

        if (filterType === "category") {
          filtered = filtered.filter((item) => item.category.toLowerCase().replace(" ", "_") === value);
        }

        if (filterType === "sport") {
          filtered = filtered.filter(
            (item) => item.sport.toLowerCase().replace(/\s+/g, "") === value.replace(/\s+/g, "")
          );
        }

        if (filterType === "market") {
          filtered = filtered.filter((item) => {
            const key = item.market.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
            return key.includes(value.replace(/[^a-z0-9_]/g, ""));
          });
        }
      }

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

      return filtered.map(recordToRow);
    },
    [appliedDateRange, appliedFilter]
  );

  const handleSearch = () => {
    const nextFilter: FilterOption | null = selectedFilter.length > 0 ? selectedFilter[0] ?? null : null;
    const nextRange = dateRange;
    setAppliedFilter(nextFilter);
    setAppliedDateRange(nextRange);
    setRows(filterData(nextFilter, nextRange));
  };

  const handleClear = () => {
    setSelectedFilter([]);
    setAppliedFilter(null);
    setDateRange(defaultDateRange);
    setAppliedDateRange(null);
    setRows(profitabilityData.map(recordToRow));
  };

  const summary = useMemo(() => {
    if (rows.length === 0) {
      return {
        totalStake: 0,
        settledStake: 0,
        totalPayout: 0,
        netProfit: 0,
        avgMargin: 0,
      };
    }

    const totals = rows.reduce(
      (acc, item) => {
        acc.totalStake += item.stake;
        acc.settledStake += item.settled;
        acc.totalPayout += item.payout;
        acc.netProfit += item.profit;
        acc.marginSum += item.margin;
        return acc;
      },
      { totalStake: 0, settledStake: 0, totalPayout: 0, netProfit: 0, marginSum: 0 }
    );

    return {
      totalStake: totals.totalStake,
      settledStake: totals.settledStake,
      totalPayout: totals.totalPayout,
      netProfit: totals.netProfit,
      avgMargin: totals.marginSum / rows.length,
    };
  }, [rows]);

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Profitability" />

     <TableFilterToolbar<FilterOption, true>
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        actions={{
          onSearch: handleSearch,
          onClear: handleClear,
        }}
        selectProps={{
          containerClassName: "max-w-[22rem]",
          options: filterOptions,
          placeholder: "Filter Options",
          value: selectedFilter,
          onChange: handleFilterChange,
          isMulti: true,
          isClearable: true,
        }}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Stake</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">
            ₦{summary.totalStake.toLocaleString()}
          </p>
        </div>
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <p className="text-sm text-gray-500 dark:text-gray-400">Settled Stake</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">
            ₦{summary.settledStake.toLocaleString()}
          </p>
        </div>
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Payout</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">
            ₦{summary.totalPayout.toLocaleString()}
          </p>
        </div>
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <p className="text-sm text-gray-500 dark:text-gray-400">Net Profit</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">
            ₦{summary.netProfit.toLocaleString()}
          </p>
          <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">Avg margin: {summary.avgMargin.toFixed(2)}%</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className=" border rounded-md border-gray-200 bg-gray-100 px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Results</h2>
        </div>
        <DataTable columns={columns} data={rows} />
      </div>
    </div>
  );
}

export default withAuth(ProfitabilityPage);

