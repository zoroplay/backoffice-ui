"use client";

import React, { useCallback, useEffect, useState, useMemo } from "react";
import type { SingleValue } from "react-select";
import { DataTable } from "@/components/tables/DataTable";
import type { Range } from "react-date-range";
import { columns, Transaction } from "@/app/(admin)/report/money-transactions/columns";
import { useSearch } from "@/context/SearchContext";
import { TableFilterToolbar } from "@/components/common/TableFilterToolbar";
import { Info } from "lucide-react";
import type { Agency } from "@/app/(admin)/network/agency-list/columns";

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

interface TransactionsTabProps {
  agentId: string;
  agent: Agency;
}

// Generate agent-specific transaction data
const generateAgentTransactions = (agentUsername: string): Transaction[] => {
  // Transactions with amounts (in chronological order, oldest first)
  const transactionData: Array<{
    date: string;
    transactionId: string;
    operationType: string;
    description: string;
    amount: number;
  }> = [
    {
      date: "2025-11-08",
      transactionId: `TXN-${agentUsername}-012`,
      operationType: "cut 5%",
      description: `CUT(1) 5% commission`,
      amount: -2500,
    },
    {
      date: "2025-11-09",
      transactionId: `TXN-${agentUsername}-011`,
      operationType: "cut stake",
      description: `CUT(1) Stake deduction`,
      amount: -5000,
    },
    {
      date: "2025-11-09",
      transactionId: `TXN-${agentUsername}-010`,
      operationType: "Deposit",
      description: `Bank deposit from ${agentUsername}`,
      amount: 40000,
    },
    {
      date: "2025-11-10",
      transactionId: `TXN-${agentUsername}-009`,
      operationType: "Bet Winnings",
      description: `Winning payout to player004`,
      amount: -25000,
    },
    {
      date: "2025-11-10",
      transactionId: `TXN-${agentUsername}-008`,
      operationType: "Interaccount Transfers",
      description: `Transfer to sub-agent`,
      amount: -15000,
    },
    {
      date: "2025-11-11",
      transactionId: `TXN-${agentUsername}-007`,
      operationType: "Bet Deposit",
      description: `Bet stake from player003`,
      amount: -10000,
    },
    {
      date: "2025-11-11",
      transactionId: `TXN-${agentUsername}-006`,
      operationType: "Bonuses",
      description: `Bonus credit to ${agentUsername}`,
      amount: 5000,
    },
    {
      date: "2025-11-12",
      transactionId: `TXN-${agentUsername}-005`,
      operationType: "Withdrawals",
      description: `Withdrawal request by ${agentUsername}`,
      amount: -20000,
    },
    {
      date: "2025-11-12",
      transactionId: `TXN-${agentUsername}-004`,
      operationType: "Deposit",
      description: `Bank deposit from ${agentUsername}`,
      amount: 30000,
    },
    {
      date: "2025-11-13",
      transactionId: `TXN-${agentUsername}-003`,
      operationType: "Bet Winnings",
      description: `Winning payout to player002`,
      amount: -30000,
    },
    {
      date: "2025-11-13",
      transactionId: `TXN-${agentUsername}-002`,
      operationType: "Bet Deposit",
      description: `Bet stake from player001`,
      amount: -15000,
    },
    {
      date: "2025-11-14",
      transactionId: `TXN-${agentUsername}-001`,
      operationType: "Deposit",
      description: `Bank deposit from ${agentUsername}`,
      amount: 50000,
    },
  ];

  // Calculate balances in chronological order
  // Start with initial balance before first transaction
  let balance = 100000;
  
  const transactionsWithBalances: Transaction[] = transactionData.map((tx) => {
    const prevBalance = balance;
    balance = prevBalance + tx.amount; // Add amount (can be negative)
    
    return {
      date: tx.date,
      transactionId: tx.transactionId,
      username: agentUsername,
      operationType: tx.operationType,
      description: tx.description,
      amount: tx.amount,
      prevBalance,
      balance,
    };
  });

  // Reverse to show newest first
  return transactionsWithBalances.reverse();
};

function TransactionsTab({ agentId, agent }: TransactionsTabProps) {
  const [operationFilter, setOperationFilter] = useState<OperationOption | null>(
    null
  );
  const [dateRange, setDateRange] = useState<Range>(defaultDateRange);
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

  // Generate agent-specific transaction data
  const agentFilteredData = useMemo(() => {
    return generateAgentTransactions(agent.username);
  }, [agent.username]);

  // Compute filtered data based on search, operation filter, and date range
  const filteredData = useMemo(() => {
    const normalizedSearch = query.trim().toLowerCase();
    const operation = appliedOperationFilter;
    const range = appliedDateRange;

    return agentFilteredData.filter((row: Transaction) => {
      // Search filter
      const matchesSearch =
        !normalizedSearch ||
        searchableFields.some((field) =>
          String(row[field] ?? "").toLowerCase().includes(normalizedSearch)
        );

      if (!matchesSearch) return false;

      // Operation filter
      const matchesOperation = operation
        ? row.operationType.toLowerCase() === operation.value.toLowerCase()
        : true;

      if (!matchesOperation) return false;

      // Date range filter
      const matchesDate =
        range && range.startDate && range.endDate
          ? (() => {
              // Handle date format - could be "YYYY-MM-DD" or "YYYY-MM-DD HH:MM:SS"
              const dateStr = row.date.split(" ")[0]; // Get just the date part
              const rowDate = new Date(dateStr);
              const start = new Date(range.startDate);
              const end = new Date(range.endDate);

              // Set to start/end of day for proper comparison
              rowDate.setHours(0, 0, 0, 0);
              start.setHours(0, 0, 0, 0);
              end.setHours(23, 59, 59, 999);

              return rowDate >= start && rowDate <= end;
            })()
          : true;

      return matchesDate;
    });
  }, [query, appliedOperationFilter, appliedDateRange, agentFilteredData]);

  const applyFilters = () => {
    setAppliedOperationFilter(operationFilter);
    setAppliedDateRange(dateRange);
  };

  const clearFilters = () => {
    setOperationFilter(null);
    setDateRange(defaultDateRange);
    setAppliedOperationFilter(null);
    setAppliedDateRange(null);
    resetQuery();
  };

  return (
    <div className="space-y-6">
      <span className="flex items-center gap-1 mb-2 text-gray-500 dark:text-gray-400">
        <Info className="h-4 w-4" />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Use the global search to filter by Transaction ID, Keyword, or
          Username, or use the filters below to narrow down the results.
        </p>
      </span>

      <TableFilterToolbar<OperationOption>
        dateRange={dateRange}
        onDateRangeChange={(range) => setDateRange(range)}
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

      <DataTable columns={columns} data={filteredData} />
    </div>
  );
}

export default TransactionsTab;

