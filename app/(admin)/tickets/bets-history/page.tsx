"use client";

import React, { useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DataTable } from "@/components/tables/DataTable";
import { columns, BetHistory } from "./columns";
import { betHistory } from "./data";
import Select from "react-select";
import type { Range } from "react-date-range";
import { DateRangeFilter } from "@/components/common/DateRangeFilter";
import { FilterActions } from "@/components/common/FilterActions";
import { withAuth } from "@/utils/withAuth";

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
  const [searchValue, setSearchValue] = useState("");
  const [filteredData, setFilteredData] = useState<BetHistory[]>(betHistory);

  const [operationFilter, setOperationFilter] = useState<
    { value: string; label: string } | null
  >(null);

  const [searchField, setSearchField] = useState<SearchField>(searchOptions[0]);
  const [dateRange, setDateRange] = useState<Range>(defaultDateRange);

  // ----------------------
  // Filtering logic
  // ----------------------
  const applyFilters = () => {
  const filtered = betHistory.filter((row) => {
    let match = true;

    // 🔍 Text search filter
    if (searchValue && searchField) {
      const rowValue = String(row[searchField.value] ?? "").toLowerCase();
      match = match && rowValue.includes(searchValue.toLowerCase());
    }

    // ⚙️ Operation filter (handles multiple types)
    if (operationFilter) {
      const val = operationFilter.value.toLowerCase();

      // ✅ Client Type
      if (["website", "cashier", "mobile"].includes(val)) {
        match = match && row.clientType.toLowerCase() === val;
      }

      // ✅ Bet Type
      if (["single", "multi", "system", "split"].includes(val)) {
        match = match && row.betType.toLowerCase() === val;
      }

      // ✅ Stake range
      if (val.startsWith("stake_")) {
        const stake = row.stake;
        if (val === "stake_low") match = match && stake < 1000;
        if (val === "stake_medium") match = match && stake >= 1000 && stake <= 5000;
        if (val === "stake_high") match = match && stake > 5000;
      }

        // ✅ Return range
        if (val.startsWith("return_")) {
          const returns = row.returns;
          if (val === "return_low") match = match && returns < 5000;
          if (val === "return_medium") match = match && returns >= 5000 && returns <= 10000;
          if (val === "return_high") match = match && returns > 10000;
        }      // ✅ Pre-Match / Live
      if (["prematch", "live"].includes(val)) {
        // Assuming market or event name contains "live" or "prematch"
        const text = `${row.market} ${row.event}`.toLowerCase();
        match = match && text.includes(val);
      }

      // ✅ Bet Status
      if (["pending", "won", "lost", "canceled", "cut 2"].includes(val)) {
        match = match && row.betStatus.toLowerCase() === val;
      }

      // ✅ Paid Status
      if (["paid", "unpaid"].includes(val)) {
        // Use winLoss field to determine paid status
        const paidStatus = row.winLoss.startsWith("+") ? "paid" : "unpaid";
        match = match && paidStatus === val;
      }
    }

    // 📅 Date range filter
    if (dateRange.startDate && dateRange.endDate) {
      const rowDate = new Date(row.placedOn);
      const start = new Date(dateRange.startDate);
      const end = new Date(dateRange.endDate);

      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      match = match && rowDate >= start && rowDate <= end;
    }

    return match;
  });

  setFilteredData(filtered);
};


  const clearFilters = () => {
    setSearchValue("");
    setOperationFilter(null);
    setDateRange(defaultDateRange);
    setSearchField(searchOptions[0]);
    setFilteredData(betHistory);
  };

  // ----------------------
  // UI
  // ----------------------
  return (
    <div className="space-y-6 p-4">
      {/* Breadcrumb */}
      <PageBreadcrumb pageTitle="Bets History" />
      
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Search by dropdown and input */}
        <div className="flex items-center gap-2">
          <div className="w-[16rem]">
            <Select
              className="dark:text-black"
              options={searchOptions}
              placeholder="Search by..."
              value={searchField}
              onChange={(val) => setSearchField(val as SearchField)}
            />
          </div>

          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder={`Search by ${searchField?.label || "..."}`}
            className="border rounded px-3 py-2 w-[16rem] dark:bg-gray-900 dark:text-white"
          />
        </div>

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

        {/* Date Range Picker */}
        <DateRangeFilter range={dateRange} onChange={(range) => setDateRange(range)} />

        {/* Filter Actions */}
        <FilterActions onSearch={applyFilters} onClear={clearFilters} />
      </div>

      

      {/* Table */}
      <DataTable columns={columns} data={filteredData} />
    </div>
  );
}

export default withAuth(BetsHistoryPage);
