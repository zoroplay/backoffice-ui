"use client";

import React, { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DataTable } from "@/components/tables/DataTable";
import type { Range } from "react-date-range";
import { DateRangeFilter, defaultDateRange } from "@/components/common/DateRangeFilter";
import { columns } from "./column";
import { tableData } from "./data";
import { withAuth } from "@/utils/withAuth";
import { reactSelectStyles } from "@/utils/reactSelectStyles";
import { useTheme } from "@/context/ThemeContext";
import { useSearch } from "@/context/SearchContext";


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


// ----------------------
// Component
// ----------------------
function GamingActivities() {
  const { theme } = useTheme();
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

  return (
    <div className="space-y-6 p-4">
      {/* Breadcrumb */}
      <PageBreadcrumb pageTitle="Gaming Activities" />
      <div className="text-sm text-gray-500 dark:text-gray-400">        
        <p>Use the global search to filter by Group, or use the filters below to narrow down the results.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap justify-between items-center gap-4">      
       <DateRangeFilter
          range={dateRange}
          onChange={(range) => setDateRange(range)}
/>
        
        <div className="max-w-[24rem]">
          <Select<FilterSelection, true>
            styles={reactSelectStyles(theme)}
            options={groupedOptions}
            isMulti
            placeholder="Filter by Game, Match, Ticket, Bet, Client..."
            value={filters}
            onChange={(val) => setFilters(val ? [...val] : [])}
          />
        </div>   

      </div>
      
      <DataTable columns={columns} data={filteredData} />
    </div>
  );
}

export default withAuth(GamingActivities);
