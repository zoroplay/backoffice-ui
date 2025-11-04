"use client";

import React, { useCallback, useEffect, useState } from "react";
import Select from "react-select";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DataTable } from "@/components/tables/DataTable";
import type { Range } from "react-date-range";
import { DateRangeFilter } from "@/components/common/DateRangeFilter";
import { FilterActions } from "@/components/common/FilterActions";
import { columns, Transaction } from "./columns";
import { transactions } from "./data";
import { withAuth } from "@/utils/withAuth";
import { useSearch } from "@/context/SearchContext";

const defaultDateRange: Range = {
  startDate: new Date(new Date().setDate(new Date().getDate() - 30)), 
  endDate: new Date(), 
  key: "selection",
};

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

const searchableFields: Array<keyof Transaction> = [
  "transactionId",
  "description",
  "username",
];

function MoneyTransactions() {
  const [operationFilter, setOperationFilter] = useState<
    { value: string; label: string } | null
  >(null);

  const [dateRange, setDateRange] = useState<Range>(defaultDateRange);
  const [filteredData, setFilteredData] = useState<Transaction[]>(transactions);
  const [appliedOperationFilter, setAppliedOperationFilter] = useState<
    { value: string; label: string } | null
  >(null);
  const [appliedDateRange, setAppliedDateRange] = useState<Range | null>(null);
  const { query, setPlaceholder, resetPlaceholder, resetQuery } = useSearch();

  useEffect(() => {
    setPlaceholder("Search by Transaction ID, Keyword, or Username");

    return () => {
      resetPlaceholder();
    };
  }, [resetPlaceholder, setPlaceholder]);

  // ----------------------
  // Filtering logic
  // ----------------------
  const filterTransactions = useCallback(
    (
      value: string,
      operation = appliedOperationFilter,
      range = appliedDateRange
    ) => {
      const normalizedSearch = value.trim().toLowerCase();

      return transactions.filter((row: Transaction) => {
        const matchesSearch =
          !normalizedSearch ||
          searchableFields.some((field) =>
            String(row[field] ?? "").toLowerCase().includes(normalizedSearch)
          );

        const matchesOperation = operation
          ? row.operationType.toLowerCase() === operation.value.toLowerCase()
          : true;

        const matchesDate =
          range && range.startDate && range.endDate
            ? (() => {
                const rowDate = new Date(row.date);
                const start = new Date(range.startDate);
                const end = new Date(range.endDate);

                rowDate.setHours(0, 0, 0, 0);
                start.setHours(0, 0, 0, 0);
                end.setHours(23, 59, 59, 999);

                return rowDate >= start && rowDate <= end;
              })()
            : true;

        return matchesSearch && matchesOperation && matchesDate;
      });
    },
    [appliedDateRange, appliedOperationFilter]
  );

  useEffect(() => {
    setFilteredData(filterTransactions(query));
  }, [filterTransactions, query]);

  const applyFilters = () => {
    const nextAppliedOperation = operationFilter;
    const nextAppliedDateRange = dateRange;

    setAppliedOperationFilter(nextAppliedOperation);
    setAppliedDateRange(nextAppliedDateRange);
    setFilteredData(
      filterTransactions(query, nextAppliedOperation, nextAppliedDateRange)
    );
  };

  const clearFilters = () => {
    setOperationFilter(null);
    setDateRange(defaultDateRange);
    setAppliedOperationFilter(null);
    setAppliedDateRange(null);
    setFilteredData(transactions);
    resetQuery();
  };

  return (
    <div className="space-y-6 p-4">
      {/* Breadcrumb */}
      <PageBreadcrumb pageTitle="Money Transactions" />

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 flex-col md:flex-row">
        <div className="flex flex-col md:flex-row gap-4">
           {/* Operation Type */}
          <div className="w-[15rem]">
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
        </div>       

       
        <FilterActions onSearch={applyFilters} onClear={clearFilters} />
      </div>

      {/* Table */}
      <DataTable columns={columns} data={filteredData} />
    </div>
  );
}

export default withAuth(MoneyTransactions);
