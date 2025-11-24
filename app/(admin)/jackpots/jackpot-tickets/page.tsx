"use client";

import React, { useState, useCallback } from "react";
import { MultiValue } from "react-select";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DataTable } from "@/components/tables/DataTable";
import { withAuth } from "@/utils/withAuth";
import { Range } from "react-date-range";

import { columns, JackpotTicket } from "./columns";
import { jackpotTicketsData } from "./data";
import { TableFilterToolbar } from "@/components/common/TableFilterToolbar";
import { FilterOption } from "../../network/pending-requests/data";

const defaultDateRange: Range = {
  startDate: new Date(new Date().setHours(0, 0, 0, 0)),
  endDate: new Date(new Date().setHours(23, 59, 59, 999)),
  key: "selection",
};

const filterOptions: Array<{
  label: string;
  options: FilterOption[];
}> = [
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
  const [filteredData, setFilteredData] = useState<JackpotTicket[]>(jackpotTicketsData);
  const [dateRange, setDateRange] = useState<Range>(defaultDateRange);
  const [appliedDateRange, setAppliedDateRange] = useState<Range | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<FilterOption[]>([]);
  const [appliedFilter, setAppliedFilter] = useState<FilterOption[]>([]);

  const filterTickets = useCallback(
    (
      filters: FilterOption[] = appliedFilter,
      range: Range | null = appliedDateRange
    ) => {
      let filtered = [...jackpotTicketsData];

      // Apply multiple filters
      filters.forEach((filter) => {
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
      });

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

  const applyFilters = () => {
    setAppliedFilter(selectedFilter);
    setAppliedDateRange(dateRange);
    const filtered = filterTickets(selectedFilter, dateRange);
    setFilteredData(filtered);
  };

  const clearFilters = () => {
    setDateRange(defaultDateRange);
    setAppliedDateRange(null);
    setSelectedFilter([]);
    setAppliedFilter([]);
    setFilteredData(jackpotTicketsData);
  };

  const handleFilterChange = (selected: MultiValue<FilterOption>) => {
    const selectedArray = selected || [];
    
    // Group filters by their type (jackpot, status, stake)
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

  return (
    <div className="space-y-6 p-4">
      {/* Breadcrumb */}
      <PageBreadcrumb pageTitle="Jackpot Tickets" />

      <TableFilterToolbar<FilterOption, true>
        dateRange={dateRange}
        onDateRangeChange={(range) => setDateRange(range)}
        actions={{
          onSearch: applyFilters,
          onClear: clearFilters,
        }}
        selectProps={{
          containerClassName: "max-w-[18rem]",
          options: filterOptions,
          placeholder: "Select Filter Options",
          value: selectedFilter,
          onChange: handleFilterChange,
          isMulti: true,
          isClearable: true,
        }}
      />        

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

