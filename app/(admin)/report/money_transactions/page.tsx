"use client";

import React, { useCallback, useEffect, useState } from "react";
import type { SingleValue } from "react-select";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DataTable } from "@/components/tables/DataTable";
import type { Range } from "react-date-range";
import { columns, Transaction } from "./columns";
import { transactions } from "./data";
import { withAuth } from "@/utils/withAuth";
import { useSearch } from "@/context/SearchContext";
import { TableFilterToolbar } from "@/components/common/TableFilterToolbar";
import { Info } from "lucide-react";

const defaultDateRange: Range = {
  startDate: new Date(new Date().setDate(new Date().getDate() - 30)), 
  endDate: new Date(), 
  key: "selection",
};

type OperationOption = { value: string; label: string };

const operationOptions: Array<{
  label: string;
  options: OperationOption[];
}> = [
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
  const [operationFilter, setOperationFilter] = useState<OperationOption | null>(
    null
  );

  const [dateRange, setDateRange] = useState<Range>(defaultDateRange);
  const [filteredData, setFilteredData] = useState<Transaction[]>(transactions);
  const [appliedOperationFilter, setAppliedOperationFilter] = useState<
    OperationOption | null
  >(null);
  const [appliedDateRange, setAppliedDateRange] = useState<Range | null>(null);
  const { query, setPlaceholder, resetPlaceholder, resetQuery } = useSearch();

  const handleOperationChange = useCallback(
    (option: SingleValue<OperationOption>) => {
      setOperationFilter(option ?? null);
    },
    []
  );

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

      <span className="flex items-center gap-1 mb-2 text-gray-500 dark:text-gray-400">
        <Info className="h-4 w-4" />
        <p className="text-sm text-gray-500 dark:text-gray-400">Use the global search to filter by Transaction ID, Keyword, or Username, or use the filters below to narrow down the results.</p>
      </span>

      <TableFilterToolbar<OperationOption>
        dateRange={dateRange}
        onDateRangeChange={(range) => setDateRange(range)}
        actions={{
          onSearch: applyFilters,
          onClear: clearFilters,
        }}
        selectProps={{
          containerClassName: "w-[15rem]",
          options: operationOptions,
          placeholder: "Operation Type",
          value: operationFilter,
          onChange: handleOperationChange,
        }}
      />

      <DataTable columns={columns} data={filteredData} />
    </div>
  );
}

export default withAuth(MoneyTransactions);
