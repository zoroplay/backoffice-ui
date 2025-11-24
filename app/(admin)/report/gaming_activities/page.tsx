"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { GroupBase } from "react-select";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DataTable } from "@/components/tables/DataTable";
import type { Range } from "react-date-range";
import { defaultDateRange } from "@/components/common/DateRangeFilter";
import { columns } from "./column";
import { tableData } from "./data";
import { withAuth } from "@/utils/withAuth";
import { useSearch } from "@/context/SearchContext";
import type { MultiValue } from "react-select";
import { TableFilterToolbar } from "@/components/common/TableFilterToolbar";
import { Info } from "lucide-react";


// ----------------------
// Select Options
// ----------------------
const groupedOptions = [
  {
    label: "Game",
    options: [
      { value: "Sport", label: "Sport" },
      { value: "Casino", label: "Casino" },
      { value: "Games", label: "Games" },
      { value: "Virtual Sport", label: "Virtual Sport" },
    ],
  },
  {
    label: "Match",
    options: [
      { value: "All", label: "All" },
      { value: "Pre Match", label: "Pre Match" },
      { value: "Live", label: "Live" },
    ],
  },
  {
    label: "Ticket",
    options: [
      { value: "Real", label: "Real" },
      { value: "Simulated", label: "Simulated" },
    ],
  },
  {
    label: "Bet",
    options: [
      { value: "Single", label: "Single" },
      { value: "Combo", label: "Combo" },
    ],
  },
  {
    label: "Client",
    options: [
      { value: "Website", label: "Website" },
      { value: "Mobile", label: "Mobile" },
      { value: "Cashier", label: "Cashier" },
    ],
  },
];

type FilterSelection = { value: string; label: string };

const filterOptionGroupMap = groupedOptions.reduce<Map<string, string>>(
  (map, group) => {
    group.options.forEach((option) => {
      map.set(option.value, group.label);
    });
    return map;
  },
  new Map()
);


// ----------------------
// Component
// ----------------------
function GamingActivities() {
  const [filters, setFilters] = useState<FilterSelection[]>([]);
  const [dateRange, setDateRange] = useState<Range>(defaultDateRange);
  const { query, setPlaceholder, resetPlaceholder } = useSearch();

  useEffect(() => {
    setPlaceholder("Search by Group");

    return () => {
      resetPlaceholder();
    };
  }, [resetPlaceholder, setPlaceholder]);

  

  // ----------------------
  // Filter & Search logic placeholder
  // ----------------------
  const filteredData = useMemo(() => {
    const searchTerm = query.trim().toLowerCase();

    if (!searchTerm) {
      return tableData;
    }

    return tableData.filter((row) =>
      row.group.toString().toLowerCase().includes(searchTerm)
    );
  }, [query]);

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

    setFilters(uniqueSelections);
  };

  return (
    <div className="space-y-6 p-4">
      {/* Breadcrumb */}
      <PageBreadcrumb pageTitle="Gaming Activities" />
      <span className="flex items-center gap-1 mb-2 text-gray-500 dark:text-gray-400">
        <Info className="h-4 w-4 " />
        <p className="text-sm  ">Use the global search to filter by Group, or use the filters below to narrow down the results.</p>
      </span>

      <TableFilterToolbar<FilterSelection, true, GroupBase<FilterSelection>>
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        selectProps={{
          containerClassName: "max-w-[26rem]",
          options: groupedOptions,
          isMulti: true,
          placeholder: "Filter by Game, Match, Ticket, Bet, Client...",
          value: filters,
          onChange: (val: MultiValue<FilterSelection>) => handleFilterChange(val),
        }}
      />
      
      <DataTable columns={columns} data={filteredData} />
    </div>
  );
}

export default withAuth(GamingActivities);
