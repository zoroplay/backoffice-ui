"use client";

import React, { useState } from "react";
import Select from "react-select";
import { DateRangePicker, Range, RangeKeyDict, DateRangePickerProps } from "react-date-range";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DataTable } from "@/components/tables/DataTable";
import { columns } from "./column";
import { tableData } from "./data";
import { withAuth } from "@/utils/withAuth";

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
// Date Picker Type Fix
// ----------------------
interface FixedDateRangePickerProps extends DateRangePickerProps {
  showSelectionPreview?: boolean;
  showMonthAndYearPickers?: boolean;
}

// ----------------------
// Component
// ----------------------
function GamingActivities() {
  const [filters, setFilters] = useState<any[]>([]);
  const [searchText, setSearchText] = useState("");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectionRange, setSelectionRange] = useState<Range>({
    startDate: new Date(),
    endDate: new Date(),
    key: "selection",
  });

  const handleSelect = (ranges: RangeKeyDict): void => {
    const { startDate, endDate } = ranges.selection;
    if (startDate && endDate) {
      setSelectionRange({ startDate, endDate, key: "selection" });
      setIsCalendarOpen(false);
    }
  };

  // ----------------------
  // Filter & Search logic placeholder
  // ----------------------
  const filteredData = tableData.filter((row) => {
    // Example: filter by search text in group column
    if (searchText) {
      return row.group.toString().includes(searchText);
    }
    return true;
  });

  return (
    <div className="space-y-6 p-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Grouped Multi-Select */}
        <div className="w-[28rem]">
          <Select
            options={groupedOptions}
            isMulti
            placeholder="Filter by Game, Match, Ticket, Bet, Client..."
            value={filters}
            onChange={(val) => setFilters(val as any[])}
          />
        </div>

        {/* Date Range Picker */}
        <div className="relative">
          <input
            type="text"
            value={`${selectionRange.startDate?.toLocaleDateString()} - ${selectionRange.endDate?.toLocaleDateString()}`}
            readOnly
            onClick={() => setIsCalendarOpen(!isCalendarOpen)}
            className="border py-2 pl-3 rounded focus:outline-none focus:ring focus:ring-zinc-500"
            placeholder="Select date range"
          />
          {isCalendarOpen && (
            <div className="absolute top-full left-0 mt-2 z-10">
              <DateRangePicker
                ranges={[selectionRange]}
                onChange={handleSelect}
                {...({ showSelectionPreview: true, showMonthAndYearPickers: true } as FixedDateRangePickerProps)}
                className="shadow-lg border rounded"
              />
            </div>
          )}
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="border py-2 px-3 rounded focus:outline-none focus:ring focus:ring-zinc-500 w-[20rem]"
        />
      </div>

      {/* Breadcrumb */}
      <PageBreadcrumb pageTitle="Gaming Activities" />

      {/* Table */}
      <DataTable columns={columns} data={filteredData} />
    </div>
  );
}

export default withAuth(GamingActivities);
