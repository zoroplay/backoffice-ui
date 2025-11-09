"use client";

import React, { useState, useCallback } from "react";
import Select from "react-select";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DateRangeFilter } from "@/components/common/DateRangeFilter";
import { FilterActions } from "@/components/common/FilterActions";
import { DataTable } from "@/components/tables/DataTable";
import { withAuth } from "@/utils/withAuth";
import { reactSelectStyles } from "@/utils/reactSelectStyles";
import { useTheme } from "@/context/ThemeContext";
import { Range } from "react-date-range";

import { columns, JackpotTicket } from "./columns";
import { jackpotTicketsData } from "./data";

const defaultDateRange: Range = {
  startDate: new Date(new Date().setHours(0, 0, 0, 0)),
  endDate: new Date(new Date().setHours(23, 59, 59, 999)),
  key: "selection",
};

const filterOptions = [
  {
    label: "Jackpot",
    options: [
      { value: "jackpot:super_weekend", label: "Super Weekend Jackpot" },
      { value: "jackpot:midweek_mega", label: "Midweek Mega Jackpot" },
      { value: "jackpot:friday_night", label: "Friday Night Jackpot" },
      { value: "jackpot:monday_special", label: "Monday Special" },
      { value: "jackpot:champions_league", label: "Champions League Jackpot" },
      { value: "jackpot:daily_mini", label: "Daily Mini Jackpot" },
    ],
  },
  {
    label: "Status",
    options: [
      { value: "status:1_lost", label: "1 Lost" },
      { value: "status:2_lost", label: "2 Lost" },
      { value: "status:all_lost", label: "All Lost" },
      { value: "status:all_won", label: "All Won" },
      { value: "status:pending", label: "Pending" },
    ],
  },
  {
    label: "Stake",
    options: [
      { value: "stake:0-50", label: "₦0 - ₦50" },
      { value: "stake:51-100", label: "₦51 - ₦100" },
      { value: "stake:101-200", label: "₦101 - ₦200" },
      { value: "stake:201-500", label: "₦201 - ₦500" },
      { value: "stake:500+", label: "₦500+" },
    ],
  },
];

function JackpotTicketsPage() {
  const { theme } = useTheme();
  const [filteredData, setFilteredData] = useState<JackpotTicket[]>(jackpotTicketsData);
  const [dateRange, setDateRange] = useState<Range>(defaultDateRange);
  const [appliedDateRange, setAppliedDateRange] = useState<Range | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<{ value: string; label: string } | null>(
    null
  );
  const [appliedFilter, setAppliedFilter] = useState<{ value: string; label: string } | null>(
    null
  );

  const filterTickets = useCallback(
    (
      filter: { value: string; label: string } | null = appliedFilter,
      range: Range | null = appliedDateRange
    ) => {
      let filtered = [...jackpotTicketsData];

      // Apply multi-filter
      if (filter) {
        const [filterType, filterValue] = filter.value.split(":");

        if (filterType === "jackpot") {
          // For now, just keep all data since we don't have jackpot names in the mock data
          // In a real app, you would filter based on the jackpot type
          filtered = filtered;
        } else if (filterType === "status") {
          if (filterValue === "1_lost") {
            filtered = filtered.filter((ticket) => ticket.status === "Lost");
          } else if (filterValue === "2_lost") {
            filtered = filtered.filter((ticket) => ticket.status === "Lost");
          } else if (filterValue === "all_lost") {
            filtered = filtered.filter((ticket) => ticket.status === "Lost");
          } else if (filterValue === "all_won") {
            filtered = filtered.filter((ticket) => ticket.status === "Won");
          } else if (filterValue === "pending") {
            filtered = filtered.filter((ticket) => ticket.status === "Pending");
          }
        } else if (filterType === "stake") {
          if (filterValue === "0-50") {
            filtered = filtered.filter((ticket) => ticket.stake >= 0 && ticket.stake <= 50);
          } else if (filterValue === "51-100") {
            filtered = filtered.filter((ticket) => ticket.stake >= 51 && ticket.stake <= 100);
          } else if (filterValue === "101-200") {
            filtered = filtered.filter((ticket) => ticket.stake >= 101 && ticket.stake <= 200);
          } else if (filterValue === "201-500") {
            filtered = filtered.filter((ticket) => ticket.stake >= 201 && ticket.stake <= 500);
          } else if (filterValue === "500+") {
            filtered = filtered.filter((ticket) => ticket.stake > 500);
          }
        }
      }

      // Apply date range filter
      if (range && range.startDate && range.endDate) {
        filtered = filtered.filter((ticket) => {
          const ticketDate = new Date(ticket.placedOn);
          return ticketDate >= range.startDate! && ticketDate <= range.endDate!;
        });
      }

      return filtered;
    },
    [appliedFilter, appliedDateRange]
  );

  const handleSearch = () => {
    setAppliedFilter(selectedFilter);
    setAppliedDateRange(dateRange);
    const filtered = filterTickets(selectedFilter, dateRange);
    setFilteredData(filtered);
  };

  const handleClearFilters = () => {
    setDateRange(defaultDateRange);
    setAppliedDateRange(null);
    setSelectedFilter(null);
    setAppliedFilter(null);
    setFilteredData(jackpotTicketsData);
  };

  return (
    <div className="space-y-6 p-4">
      {/* Breadcrumb */}
      <PageBreadcrumb pageTitle="Jackpot Tickets" />

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Date Range Filter */}
          <DateRangeFilter range={dateRange} onChange={(range) => setDateRange(range)} />

          {/* Multi-Filter (Jackpot, Status & Stake) */}
          <div className="w-[18rem]">
            <Select
              styles={reactSelectStyles(theme)}
              options={filterOptions}
              placeholder="Filter Options"
              value={selectedFilter}
              onChange={(val) => setSelectedFilter(val)}
              isClearable
            />
          </div>
        </div>

        {/* Search & Clear Buttons */}
        <FilterActions onSearch={handleSearch} onClear={handleClearFilters} />
      </div>

      {/* Results */}
      <div className="space-y-4">
        <div className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-3 rounded-t-lg">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Results</h2>
        </div>
        <DataTable columns={columns} data={filteredData} />
      </div>
    </div>
  );
}

export default withAuth(JackpotTicketsPage);

