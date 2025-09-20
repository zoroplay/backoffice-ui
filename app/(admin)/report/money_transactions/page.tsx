"use client";

import React, { useState } from "react";
import Select from "react-select";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DataTable } from "@/components/tables/DataTable";
import type { Range } from "react-date-range";
import { DateRangeFilter } from "@/components/common/DateRangeFilter";
import { FilterActions } from "@/components/common/FilterActions";
import { columns } from "./columns";
import { Transaction } from "./columns";
import { transactions } from "./data";
import { withAuth } from "@/utils/withAuth";

const defaultDateRange: Range = {
  startDate: new Date(new Date().setDate(new Date().getDate() - 30)), // 30 days ago
  endDate: new Date(), // today
  key: "selection",
};

// ----------------------
// Options
// ----------------------
type SearchField = { value: keyof Transaction; label: string };

const searchOptions: SearchField[] = [
  { value: "transactionId", label: "Transaction ID" },
  { value: "description", label: "Keyword" },
  { value: "username", label: "Username" },
];

const operationOptions = [
  {
    label: "Operation Type",
    options: [
      { value: "bet deposit", label: "Bet Deposit" },
      { value: "bet winnings", label: "Bet Winnings" },
      { value: "deposit", label: "Deposit" },
      { value: "withdrawals", label: "Withdrawals" },
      { value: "bonuses", label: "Bonuses" },
      { value: "interaccount transfers", label: "Interaccount Transfers" },
      { value: "cut stake", label: "CUT(1) Stake" },
      { value: "cut 5%", label: "CUT(1) 5%" },
    ],
  },
];

function MoneyTransactions() {
  const [operationFilter, setOperationFilter] = useState<
    { value: string; label: string } | null
  >(null);

  const [searchField, setSearchField] = useState<SearchField>(
    searchOptions[0] // default Transaction ID
  );

  const [dateRange, setDateRange] = useState<Range>(defaultDateRange);
  const [searchValue, setSearchValue] = useState("");
  const [filteredData, setFilteredData] = useState<Transaction[]>(transactions);

  // ----------------------
  // Filtering logic
  // ----------------------
  const applyFilters = () => {
    const filtered = transactions.filter((row: Transaction) => {
      let match = true;

      
      if (searchValue && searchField) {
        const rowValue = String(row[searchField.value]).toLowerCase();
        match = match && rowValue.includes(searchValue.toLowerCase());
      }

    
      if (operationFilter) {
        match = match && row.operationType.toLowerCase() === operationFilter.value.toLowerCase();
      }

      
      if (dateRange.startDate && dateRange.endDate) {
        const rowDate = new Date(row.date);
        const start = new Date(dateRange.startDate);
        const end = new Date(dateRange.endDate);

        rowDate.setHours(0, 0, 0, 0);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);

        match = match && rowDate >= start && rowDate <= end;
      }
      console.log(match);
      return match;
    });

    setFilteredData(filtered);
  };

  const clearFilters = () => {
    setSearchValue("");
    setOperationFilter(null);
    setDateRange(defaultDateRange);
    setSearchField(searchOptions[0]);
    setFilteredData(transactions);
  };

  return (
    <div className="space-y-6 p-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Select + Single Search Bar */}
        <div className="flex items-center gap-2">
          {/* Search Field Selector */}
          <div className="w-[16rem]">
            <Select
              className="dark:text-black"
              options={searchOptions}
              placeholder="Search by..."
              value={searchField}
              onChange={(val) => setSearchField(val as SearchField)}
            />
          </div>

          {/* Search Input */}
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder={`Search by ${searchField?.label || "..."}`}
            className="border rounded px-3 py-2 w-[16rem] dark:bg-gray-900 dark:text-white"
          />
        </div>

        {/* Operation Type */}
        <div className="w-[18rem]">
          <Select
            className="dark:text-black"
            options={operationOptions}
            placeholder="Operation Type"
            value={operationFilter}
            onChange={(val) => setOperationFilter(val)}
          />
        </div>

        {/* Date Range Picker */}
        <DateRangeFilter
          range={dateRange}
          onChange={(range) => setDateRange(range)}
        />

       
        <FilterActions onSearch={applyFilters} onClear={clearFilters} />
      </div>

      {/* Breadcrumb */}
      <PageBreadcrumb pageTitle="Money Transactions" />

      {/* Table */}
      <DataTable columns={columns} data={filteredData} />
    </div>
  );
}

export default withAuth(MoneyTransactions);
