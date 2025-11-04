"use client";

import React, { useCallback, useEffect, useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DataTable } from "@/components/tables/DataTable";
import { columns, BetHistory } from "./columns";
import { betHistory } from "./data";
import Select from "react-select";
import type { Range } from "react-date-range";
import { DateRangeFilter } from "@/components/common/DateRangeFilter";
import { FilterActions } from "@/components/common/FilterActions";
import { withAuth } from "@/utils/withAuth";
import { useSearch } from "@/context/SearchContext";

//  Default last 30 days range
const defaultDateRange: Range = {
  startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
  endDate: new Date(),
  key: "selection",
};

// ----------------------
// Options
// ----------------------
type SearchField = { value: keyof BetHistory; label: string };

const searchOptions: SearchField[] = [
  { value: "betslipId", label: "Betslip ID" },
  { value: "placedBy", label: "Username" },
  { value: "sport", label: "Sport" },
  { value: "league", label: "League" },
];

const searchableFields: Array<keyof BetHistory> = [
  "betslipId",
  "placedBy",
  "sport",
  "league",
];

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
  {
    label: "Status",
    options: [
      { value: "pending", label: "Pending" },
      { value: "won", label: "won" },
      { value: "lost", label: "Lost" },
      { value:"canceled", label: "Canceled" },
      { value: "cut 2", label: "CUT(2)" },
      
    ],
  },
  {
    label: "Paid Status",
    options: [
      { value: "paid", label: "Paid" },
      { value: "unpaid", label: "Unpaid" },
    ],
  },
];

function BetsHistoryPage() {
  const [filteredData, setFilteredData] = useState<BetHistory[]>(betHistory);

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
    const placeholderText =
      "Search by Betslip ID, Username, Sport, or League";
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

      return betHistory.filter((row) => {
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
            const returns = row.returns;
            if (val === "return_low") match = match && returns < 5000;
            if (val === "return_medium")
              match = match && returns >= 5000 && returns <= 10000;
            if (val === "return_high") match = match && returns > 10000;
          }

          if (["prematch", "live"].includes(val)) {
            const text = `${row.market} ${row.event}`.toLowerCase();
            match = match && text.includes(val);
          }

          if (["pending", "won", "lost", "canceled", "cut 2"].includes(val)) {
            match = match && row.betStatus.toLowerCase() === val;
          }

          if (["paid", "unpaid"].includes(val)) {
            const paidStatus = row.winLoss.startsWith("+") ? "paid" : "unpaid";
            match = match && paidStatus === val;
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
    setFilteredData(betHistory);
    resetQuery();
  };

  // ----------------------
  // UI
  // ----------------------
  return (
    <div className="space-y-6 p-4">
      {/* Breadcrumb */}
      <PageBreadcrumb pageTitle="Bets History" />
      
      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Date Range Picker */}
          <DateRangeFilter range={dateRange} onChange={(range) => setDateRange(range)} />
          {/* Operation Filter */}
          <div className="w-[18rem]">
            <Select
              className="dark:text-black"
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
,...
      

      {/* Table */}
      <DataTable columns={columns} data={filteredData} />
    </div>
  );
}

export default withAuth(BetsHistoryPage);
