"use client";

import React, { useCallback, useEffect, useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DataTable } from "@/components/tables/DataTable";
import { columns, OpenBet } from "./column";
import { openBets } from "./data";
import Select from "react-select";
import type { Range } from "react-date-range";
import { DateRangeFilter } from "@/components/common/DateRangeFilter";
import { FilterActions } from "@/components/common/FilterActions";
import { withAuth } from "@/utils/withAuth";
import { useSearch } from "@/context/SearchContext";
import { reactSelectStyles } from "@/utils/reactSelectStyles";
import { useTheme } from "@/context/ThemeContext";

//  Default last 30 days range
const defaultDateRange: Range = {
  startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
  endDate: new Date(),
  key: "selection",
};

const operationOptions = [
  {
    label: "Client Type",
    options: [
      { value: "website", label: "Website" },
      { value: "cashier", label: "Cashier" },
      { value: "mobile", label: "Mobile" },
    ],
  },
  {
    label: "Ticket Type",
    options: [
      { value: "real", label: "Real" },
      { value: "simulated", label: "Simulated" },
    ],
  },
  {
    label: "Bet Type",
    options: [
      { value: "single", label: "Single Bet" },
      { value: "multi", label: "Multiple Bet" },
      { value: "system", label: "System Bet" },
      { value: "split", label: "Split Bet" },
    ],
  },
  {
    label: "Stake Range",
    options: [
      { value: "stake_low", label: "Stake < ₦1,000" },
      { value: "stake_medium", label: "Stake ₦1,000 - ₦5,000" },
      { value: "stake_high", label: "Stake > ₦5,000" },
    ],
  },
  {
    label: "Potential Return",
    options: [
      { value: "return_low", label: "Return < ₦5,000" },
      { value: "return_medium", label: "Return ₦5,000 - ₦10,000" },
      { value: "return_high", label: "Return > ₦10,000" },
    ],
  },
  {
    label: "Pre-Match/Live",
    options: [
      { value: "prematch", label: "Pre-match" },
      { value: "live", label: "Live" },
    ],
  },
];

const searchableFields: Array<keyof OpenBet> = [
  "betslipId",
  "by",
  "sport",
  "league",
];

function OpenBetsPage() {
  const { theme } = useTheme();
  const [filteredData, setFilteredData] = useState<OpenBet[]>(openBets);

  const [operationFilter, setOperationFilter] = useState<
    { value: string; label: string } | null
  >(null);

  const [dateRange, setDateRange] = useState<Range>(defaultDateRange);
  const [appliedOperationFilter, setAppliedOperationFilter] = useState<
    { value: string; label: string } | null
  >(null);
  const [appliedDateRange, setAppliedDateRange] = useState<Range | null>(null);
  const { query, setPlaceholder, resetPlaceholder, resetQuery } = useSearch();

  useEffect(() => {
    const placeholderText = "Search by Betslip ID, Username, Sport, or League";
    setPlaceholder(placeholderText);

    return () => {
      resetPlaceholder();
    };
  }, [resetPlaceholder, setPlaceholder]);

  // ----------------------
  // Filtering logic
  // ----------------------
  const filterBets = useCallback(
    (
      value: string,
      operation: { value: string; label: string } | null = appliedOperationFilter,
      range: Range | null = appliedDateRange
    ) => {
      const searchTerm = value.trim().toLowerCase();

      return openBets.filter((row) => {
        let match = true;

        if (searchTerm) {
          const matchesSearch = searchableFields.some((field) =>
            String(row[field] ?? "").toLowerCase().includes(searchTerm)
          );

          if (!matchesSearch) {
            return false;
          }
        }

        if (operation) {
          const val = operation.value.toLowerCase();

          if (["website", "cashier", "mobile"].includes(val)) {
            match = match && row.clientType.toLowerCase() === val;
          }

          if (["single", "multi", "system", "split"].includes(val)) {
            match = match && row.betType.toLowerCase() === val;
          }

          if (val.startsWith("stake_")) {
            const stake = row.stake;
            if (val === "stake_low") match = match && stake < 1000;
            if (val === "stake_medium")
              match = match && stake >= 1000 && stake <= 5000;
            if (val === "stake_high") match = match && stake > 5000;
          }

          if (val.startsWith("return_")) {
            const ret = row.ret;
            if (val === "return_low") match = match && ret < 5000;
            if (val === "return_medium")
              match = match && ret >= 5000 && ret <= 10000;
            if (val === "return_high") match = match && ret > 10000;
          }

          if (["prematch", "live"].includes(val)) {
            match = match && row.market.toLowerCase().includes(val);
          }
        }

        if (range && range.startDate && range.endDate) {
          const rowDate = new Date(row.placedOn);
          const start = new Date(range.startDate);
          const end = new Date(range.endDate);

          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);

          match = match && rowDate >= start && rowDate <= end;
        }

        return match;
      });
    },
    [appliedDateRange, appliedOperationFilter]
  );

  useEffect(() => {
    setFilteredData(filterBets(query));
  }, [filterBets, query]);

  const applyFilters = () => {
    const nextOperation = operationFilter;
    const nextDateRange = dateRange;

    setAppliedOperationFilter(nextOperation);
    setAppliedDateRange(nextDateRange);
    setFilteredData(filterBets(query, nextOperation, nextDateRange));
  };

  const clearFilters = () => {
    setOperationFilter(null);
    setDateRange(defaultDateRange);
    setAppliedOperationFilter(null);
    setAppliedDateRange(null);
    setFilteredData(openBets);
    resetQuery();
  };

  // ----------------------
  // UI
  // ----------------------
  return (
    <div className="space-y-6 p-4">
      {/* Breadcrumb */}
      <PageBreadcrumb pageTitle="Open Bets" />
      
      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 flex-col md:flex-row">
        <div className="flex flex-wrap items-center gap-4 flex-col md:flex-row">
           {/* Date Range Picker */}
        <DateRangeFilter range={dateRange} onChange={(range) => setDateRange(range)} />
           {/* Operation Filter */}
        <div className="w-[18rem]">
            <Select
              styles={reactSelectStyles(theme)}
              options={operationOptions}
            placeholder="Filter Options"
            value={operationFilter}
            onChange={(val) => setOperationFilter(val)}
          />
        </div>
      </div>
       
       

        {/* Filter Actions */}
        <FilterActions onSearch={applyFilters} onClear={clearFilters} />
      </div>

      

      {/* Table */}
      <DataTable columns={columns} data={filteredData} />
    </div>
  );
}

export default withAuth(OpenBetsPage);
