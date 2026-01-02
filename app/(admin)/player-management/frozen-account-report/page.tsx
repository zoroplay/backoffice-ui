"use client";

import React, { useCallback, useEffect, useState } from "react";
import type { Range } from "react-date-range";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DataTable } from "@/components/tables/DataTable";
import { defaultDateRange } from "@/components/common/DateRangeFilter";
import { withAuth } from "@/utils/withAuth";
import { useTheme } from "@/context/ThemeContext";
import { useSearch } from "@/context/SearchContext";
import { columns } from "./columns";
import { frozenAccounts, FrozenAccount } from "./data";
import { TableFilterToolbar } from "@/components/common/TableFilterToolbar";
import { Info } from "lucide-react";

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
  const [appliedDateRange, setAppliedDateRange] = useState<Range | null>(null);

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
    setAppliedDateRange(null);
    setFilteredData(frozenAccounts);
    resetQuery();
  };

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Frozen Account Report" />
     
     <span className="flex items-center gap-1 mb-2 text-gray-500 dark:text-gray-400">  <Info className="h-4 w-4" />    
        <p className="text-sm text-gray-500 dark:text-gray-400">Use the global search to filter by Username, Full Name, or Reason</p>
      </span>

     <TableFilterToolbar
       dateRange={dateRange}
       onDateRangeChange={setDateRange}
       actions={{
         onSearch: applyFilters,
         onClear: clearFilters,
       }}
     />

      <DataTable columns={columns} data={filteredData} />
    </div>
  );
}

export default withAuth(FrozenAccountReportPage);

