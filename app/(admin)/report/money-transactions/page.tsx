"use client";

import React, { useCallback, useEffect, useState } from "react";
import type { SingleValue } from "react-select";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DataTable } from "@/components/tables/DataTable";
import type { Range } from "react-date-range";
import { columns, Transaction } from "./columns";
import { withAuth } from "@/utils/withAuth";
import { useSearch } from "@/context/SearchContext";
import { TableFilterToolbar } from "@/components/common/TableFilterToolbar";
import { Infotext } from "@/components/common/Info";
import { normalizeApiError, reportsApi } from "@/lib/api";
import { LoadingState } from "@/components/common/LoadingState";

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
  const [rows, setRows] = useState<Transaction[]>([]);
  const [filteredData, setFilteredData] = useState<Transaction[]>([]);
  const [appliedOperationFilter, setAppliedOperationFilter] = useState<
    OperationOption | null
  >(null);
  const [appliedDateRange, setAppliedDateRange] = useState<Range | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { query, setPlaceholder, resetPlaceholder, resetQuery } = useSearch();
  const [hasSearched, setHasSearched] = useState(false);
  const emptyStateText = "Search to see data.";

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

  const fmt = (d?: Date, endOfDay = false) => {
    if (!d) return "";
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy} ${endOfDay ? "23:59:59" : "00:00:00"}`;
  };

  const toNumber = (value: unknown): number => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const toTransaction = (row: Record<string, unknown>): Transaction => ({
    date: String(row.date ?? row.createdAt ?? row.transactionDate ?? ""),
    transactionId: String(
      row.transactionId ?? row.transaction_id ?? row.reference ?? ""
    ),
    username: String(row.username ?? row.userName ?? row.user ?? ""),
    operationType: String(row.operationType ?? row.type ?? row.operation ?? ""),
    description: String(row.description ?? row.narration ?? row.remark ?? ""),
    amount: toNumber(row.amount),
    prevBalance: toNumber(row.prevBalance ?? row.previousBalance),
    balance: toNumber(row.balance ?? row.currentBalance),
  });

  const getRowsFromResponse = (res: unknown): Transaction[] => {
    const root = (res as { data?: unknown })?.data ?? res;
    const list =
      (Array.isArray(root) && root) ||
      ((root as { data?: unknown })?.data as unknown[]) ||
      ((root as { rows?: unknown })?.rows as unknown[]) ||
      ((root as { results?: unknown })?.results as unknown[]) ||
      ((root as { items?: unknown })?.items as unknown[]) ||
      [];

    if (!Array.isArray(list)) return [];
    return list.map((row) => toTransaction((row as Record<string, unknown>) ?? {}));
  };

  // ----------------------
  // Filtering logic
  // ----------------------
  const filterTransactions = useCallback(
    (
      value: string,
      operation = appliedOperationFilter,
      range = appliedDateRange,
      sourceRows: Transaction[] = rows
    ) => {
      const normalizedSearch = value.trim().toLowerCase();

      return sourceRows.filter((row: Transaction) => {
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
    [appliedDateRange, appliedOperationFilter, rows]
  );

  useEffect(() => {
    setFilteredData(filterTransactions(query));
  }, [filterTransactions, query]);

  const applyFilters = async () => {
    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    const nextAppliedOperation = operationFilter;
    const nextAppliedDateRange = dateRange;
    const payload = {
      from: fmt(dateRange.startDate ?? undefined, false),
      to: fmt(dateRange.endDate ?? undefined, true),
      operationType: operationFilter?.value ?? "",
      search: query.trim(),
    } as const;

    try {
      const res = await reportsApi.getMoneyTransactions(payload, 1);
      const nextRows = getRowsFromResponse(res);

      setRows(nextRows);
      setAppliedOperationFilter(nextAppliedOperation);
      setAppliedDateRange(nextAppliedDateRange);
      setFilteredData(
        filterTransactions(
          query,
          nextAppliedOperation,
          nextAppliedDateRange,
          nextRows
        )
      );
    } catch (err) {
      const apiErr = normalizeApiError(err);
      setError(apiErr.message ?? "Failed to fetch money transactions");
      setRows([]);
      setFilteredData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearFilters = () => {
    setOperationFilter(null);
    setDateRange(defaultDateRange);
    setAppliedOperationFilter(null);
    setAppliedDateRange(null);
    setRows([]);
    setFilteredData([]);
    setError(null);
    resetQuery();
    setHasSearched(false);
  };

  return (
    <div className="space-y-6 p-4">
      {/* Breadcrumb */}
      <PageBreadcrumb pageTitle="Money Transactions" />

      <Infotext text="Use the global search to filter by Transaction ID, Keyword, or Username, or use the filters below to narrow down the results." />

      <TableFilterToolbar<OperationOption>
        dateRange={dateRange}
        onDateRangeChange={(range) => setDateRange(range)}
        isLoading={isLoading}
        actions={{
          onSearch: applyFilters,
          onClear: clearFilters,
        }}
        selectProps={{
          containerClassName: "max-w-[15rem]",
          options: operationOptions,
          placeholder: "Operation Type",
          value: operationFilter,
          onChange: handleOperationChange,
        }}
      />

      {isLoading ? (
        <LoadingState className="py-8" />
      ) : !hasSearched ? (
        <div className="flex justify-center py-8 text-gray-500">
          {emptyStateText}
        </div>
      ) : (
        <>
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <DataTable columns={columns} data={filteredData} />
        </>
      )}
    </div>
  );
}

export default withAuth(MoneyTransactions);
