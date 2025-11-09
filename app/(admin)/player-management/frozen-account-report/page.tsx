"use client";

import React, { useCallback, useEffect, useState } from "react";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import type { Range } from "react-date-range";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DataTable } from "@/components/tables/DataTable";
import { DateRangeFilter, defaultDateRange } from "@/components/common/DateRangeFilter";
import { FilterActions } from "@/components/common/FilterActions";
import { withAuth } from "@/utils/withAuth";
import { reactSelectStyles } from "@/utils/reactSelectStyles";
import { useTheme } from "@/context/ThemeContext";
import { useSearch } from "@/context/SearchContext";

import { columns } from "./columns";
import { frozenAccounts, FrozenAccount } from "./data";

const animatedComponents = makeAnimated();

type FilterOption = {
  value: string;
  label: string;
};

const filterOptions: Array<{ label: string; options: FilterOption[] }> = [
  {
    label: "Freeze Type",
    options: [
      { value: "FreezeType:Manual", label: "Manual" },
      { value: "FreezeType:Automatic", label: "Automatic" },
      { value: "FreezeType:Compliance", label: "Compliance" },
    ],
  },
  {
    label: "Player Status",
    options: [
      { value: "PlayerStatus:Frozen", label: "Frozen" },
      { value: "PlayerStatus:Partially Frozen", label: "Partially Frozen" },
      { value: "PlayerStatus:Released", label: "Released" },
    ],
  },
  {
    label: "Process Status",
    options: [
      { value: "ProcessStatus:Pending", label: "Pending" },
      { value: "ProcessStatus:In Progress", label: "In Progress" },
      { value: "ProcessStatus:Completed", label: "Completed" },
    ],
  },
];

const searchableFields: Array<keyof FrozenAccount> = [
  "username",
  "fullName",
  "reason",
];

function FrozenAccountReportPage() {
  const { theme } = useTheme();
  const [filteredData, setFilteredData] = useState<FrozenAccount[]>(frozenAccounts);
  const [dateRange, setDateRange] = useState<Range>(defaultDateRange);
  const [selectedFilters, setSelectedFilters] = useState<FilterOption[]>([]);

  const [appliedFilters, setAppliedFilters] = useState<FilterOption[]>([]);
  const [appliedDateRange, setAppliedDateRange] = useState<Range | null>(defaultDateRange);

  const { query, setPlaceholder, resetPlaceholder, resetQuery } = useSearch();

  useEffect(() => {
    const placeholderText = "Search by Username, Full Name, or Reason";
    setPlaceholder(placeholderText);

    return () => {
      resetPlaceholder();
    };
  }, [resetPlaceholder, setPlaceholder]);

  const filterAccounts = useCallback(
    (
      value: string,
      freeze: FilterOption[] | null = appliedFilters,
      range: Range | null = appliedDateRange
    ) => {
      const searchTerm = value.trim().toLowerCase();

      return frozenAccounts.filter((row) => {
        if (searchTerm) {
          const matchesSearch = searchableFields.some((field) =>
            String(row[field] ?? "").toLowerCase().includes(searchTerm)
          );

          if (!matchesSearch) {
            return false;
          }
        }

        const selections = (freeze ?? []).reduce<Record<string, string>>((acc, option) => {
          if (!option?.value) {
            return acc;
          }

          const [category, value] = option.value.split(":");
          if (category && value) {
            acc[category] = value;
          }

          return acc;
        }, {});

        const matchesFreezeType = selections.FreezeType
          ? row.freezeType.toLowerCase() === selections.FreezeType.toLowerCase()
          : true;

        const matchesPlayerStatus = selections.PlayerStatus
          ? row.playerStatus.toLowerCase() === selections.PlayerStatus.toLowerCase()
          : true;

        const matchesProcessStatus = selections.ProcessStatus
          ? row.processStatus.toLowerCase() === selections.ProcessStatus.toLowerCase()
          : true;

        const matchesDate =
          range && range.startDate && range.endDate
            ? (() => {
                const rowDate = new Date(row.freezeDate);
                const start = new Date(range.startDate);
                const end = new Date(range.endDate);

                rowDate.setHours(0, 0, 0, 0);
                start.setHours(0, 0, 0, 0);
                end.setHours(23, 59, 59, 999);

                return rowDate >= start && rowDate <= end;
              })()
            : true;

        return (
          matchesFreezeType &&
          matchesPlayerStatus &&
          matchesProcessStatus &&
          matchesDate
        );
      });
    },
    [appliedDateRange, appliedFilters]
  );

  useEffect(() => {
    setFilteredData(filterAccounts(query));
  }, [filterAccounts, query]);

  const applyFilters = () => {
    const nextFilters = selectedFilters;
    const nextRange = dateRange.startDate && dateRange.endDate ? dateRange : defaultDateRange;

    setAppliedFilters(nextFilters);
    setAppliedDateRange(nextRange);
    setFilteredData(filterAccounts(query, nextFilters, nextRange));
  };

  const clearFilters = () => {
    setSelectedFilters([]);
    setDateRange(defaultDateRange);
    setAppliedFilters([]);
    setAppliedDateRange(defaultDateRange);
    setFilteredData(frozenAccounts);
    resetQuery();
  };

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Frozen Account Report" />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <DateRangeFilter range={dateRange} onChange={(range) => setDateRange(range)} />

          <div className="w-[22rem]">
            <Select
              styles={reactSelectStyles(theme)}
              options={filterOptions}
              placeholder="Filter by Freeze Type, Player Status, Process Status"
              components={animatedComponents}
              isMulti
              value={selectedFilters}
              onChange={(val) => {
                if (!val || (Array.isArray(val) && val.length === 0)) {
                  setSelectedFilters([]);
                  return;
                }

                const nextSelection = Array.isArray(val) ? [...val] : [val];
                const latest = nextSelection[nextSelection.length - 1] as FilterOption;

                if (!latest) {
                  setSelectedFilters(nextSelection as FilterOption[]);
                  return;
                }

                const categoryPrefix = latest.value.split(":")[0];
                const filtered = nextSelection.filter(
                  (item) => item.value.split(":")[0] !== categoryPrefix
                );

                setSelectedFilters([
                  ...(filtered as FilterOption[]),
                  latest,
                ]);
              }}
            />
          </div>
        </div>

        <FilterActions onSearch={applyFilters} onClear={clearFilters} />
      </div>

      <DataTable columns={columns} data={filteredData} />
    </div>
  );
}

export default withAuth(FrozenAccountReportPage);

