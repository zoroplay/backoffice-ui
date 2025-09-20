"use client";

import React, { useState } from "react";
import Select from "react-select";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DataTable } from "@/components/tables/DataTable";
import type { Range } from "react-date-range";
import { DateRangeFilter } from "@/components/common/DateRangeFilter";
import { columns } from "./columns";
import { transactions } from "./data";
import { withAuth } from "@/utils/withAuth";

// ----------------------
// Transaction type
// ----------------------
type Transaction = {
  date: string;
  transactionId: string;
  user: string;
  operationType: string;
  description: string;
  amount: number;
  prevBalance: number;
  balance: number;
};

const defaultDateRange: Range = {
  startDate: new Date(),
  endDate: new Date(),
  key: "selection",
};

// ----------------------
// Options
// ----------------------
type SearchField = { value: keyof Transaction; label: string };

const searchOptions: SearchField[] = [
  { value: "transactionId", label: "Transaction ID" },
  { value: "description", label: "Keyword" },
  { value: "user", label: "Username" },
];

const operationOptions = [{
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
]}];

function MoneyTransactions() {
  const [operationFilter, setOperationFilter] = useState<
    { value: string; label: string } | null
  >(null);

  const [searchFields, setSearchFields] = useState<SearchField[]>([
    searchOptions[0]
  ]); // default is Transaction ID
  const [dateRange, setDateRange] = useState<Range>(defaultDateRange);

  const [searchValue, setSearchValue] = useState("");

  // ----------------------
  // Filtering logic
  // ----------------------
  const filteredData = transactions.filter((row: Transaction) => {
    let match = true;

    // Apply search fields + value
    if (searchValue && searchFields.length > 0) {
      match =
        match &&
        searchFields.some((field) => {
          const rowValue = String(row[field.value]).toLowerCase();
          return rowValue.includes(searchValue.toLowerCase());
        });
    }

    // Apply operation type filter
    if (operationFilter) {
      match = match && row.operationType === operationFilter.value;
    }

    return match;
  });

  return (
    <div className="space-y-6 p-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Multi-field Search */}
        <div className="flex items-center gap-2">
          <div className="w-[16rem]">
            <Select
              options={searchOptions}
              isMulti
              placeholder="Choose fields..."
              value={searchFields}
              onChange={(val) => setSearchFields(val as SearchField[])}
            />
          </div>
        </div>

        {/* Operation Type */}
        <div className="w-[18rem]">
          <Select
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
      </div>

      {/* Breadcrumb */}
      <PageBreadcrumb pageTitle="Money Transactions" />

      {/* Table */}
      <DataTable columns={columns} data={filteredData} />
    </div>
  );
}

export default withAuth(MoneyTransactions);
