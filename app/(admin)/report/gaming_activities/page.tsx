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


// ----------------------
// Component
// ----------------------
function GamingActivities() {
  const [filters, setFilters] = useState<any[]>([]);
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

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Date Range Picker */}
       <DateRangeFilter
          range={dateRange}
          onChange={(range) => setDateRange(range)}
/>
        {/* Grouped Multi-Select */}
        <div className="w-[28rem]">
          <Select
            className="dark:text-black"
            options={groupedOptions}
            isMulti
            placeholder="Filter by Game, Match, Ticket, Bet, Client..."
            value={filters}
            onChange={(val) => setFilters(val as any[])}
          />
        </div>

     

      </div>
      {/* Table */}
      <DataTable columns={columns} data={filteredData} />
    </div>
  );
}

export default withAuth(GamingActivities);
