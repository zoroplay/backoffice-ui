"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { SingleValue } from "react-select";
import { DataTable } from "@/components/tables/DataTable";
import type { Range } from "react-date-range";
import { columns, Transaction } from "@/app/(admin)/report/money-transactions/columns";
import { useSearch } from "@/context/SearchContext";
import { TableFilterToolbar } from "@/components/common/TableFilterToolbar";
import { Info } from "lucide-react";
import type { Agency } from "@/app/(admin)/network/agency-list/columns";
import { normalizeApiError, playerApi, usersApi } from "@/lib/api";

const defaultDateRange: Range = {
  startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
  endDate: new Date(),
  key: "selection",
};

type UserOption = { value: string; label: string };

const searchableFields: Array<keyof Transaction> = [
  "transactionId",
  "description",
  "username",
];

interface TransactionsTabProps {
  agentId: string;
  agent: Agency;
}

function TransactionsTab({ agentId, agent }: TransactionsTabProps) {
  const effectiveAgentId = agentId || agent.id || agent.username;
  const [userOptions, setUserOptions] = useState<UserOption[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserOption | null>(null);
  const [dateRange, setDateRange] = useState<Range>(defaultDateRange);
  const [rows, setRows] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { query, setPlaceholder, resetPlaceholder, resetQuery } = useSearch();

  const toNumber = (value: unknown) => {
    const num = Number(value ?? 0);
    return Number.isFinite(num) ? num : 0;
  };

  const formatDateTime = (date: Date | undefined, endOfDay = false) => {
    const d = date ? new Date(date) : new Date();
    if (endOfDay) {
      d.setHours(23, 59, 59, 0);
    } else {
      d.setHours(0, 0, 0, 0);
    }
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
      d.getHours()
    )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  const formatTransactionDate = (value: unknown) => {
    const raw = String(value ?? "").trim();
    if (!raw) return "";
    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) {
      return raw.replace(/\sGMT.*$/, "");
    }
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(
      parsed.getDate()
    )} ${pad(parsed.getHours())}:${pad(parsed.getMinutes())}:${pad(
      parsed.getSeconds()
    )}`;
  };

  useEffect(() => {
    setPlaceholder("Search by Transaction ID, Keyword, or Username");
    return () => {
      resetPlaceholder();
    };
  }, [resetPlaceholder, setPlaceholder]);

  useEffect(() => {
    let cancelled = false;

    const parseList = (input: unknown): Record<string, unknown>[] => {
      if (Array.isArray(input)) return input as Record<string, unknown>[];
      if (input && typeof input === "object") {
        const record = input as Record<string, unknown>;
        if (Array.isArray(record.data)) return record.data as Record<string, unknown>[];
      }
      return [];
    };

    const fetchUsers = async () => {
      try {
        const response = await usersApi.getAgentUsers({
          agentId: effectiveAgentId,
          page: 1,
          user_type: "",
        });
        if (cancelled) return;

        const options = parseList(response).map((row) => ({
          value: String(row.id ?? ""),
          label: String(row.username ?? row.code ?? row.id ?? ""),
        }));

        setUserOptions(options);
        setSelectedUser(options[0] ?? null);
      } catch (err) {
        if (cancelled) return;
        const apiError = normalizeApiError(err);
        setError(apiError.message ?? "Failed to fetch agent users");
      }
    };

    void fetchUsers();

    return () => {
      cancelled = true;
    };
  }, [effectiveAgentId]);

  const fetchTransactions = useCallback(async () => {
    if (!selectedUser?.value) {
      setRows([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await playerApi.getPlayerTransactions({
        playerId: selectedUser.value,
        page: 1,
        startDate: formatDateTime(dateRange.startDate),
        endDate: formatDateTime(dateRange.endDate, true),
      });

      const parseList = (input: unknown): Record<string, unknown>[] => {
        if (Array.isArray(input)) return input as Record<string, unknown>[];
        if (input && typeof input === "object") {
          const record = input as Record<string, unknown>;
          if (Array.isArray(record.data)) return record.data as Record<string, unknown>[];
          if (record.data && typeof record.data === "object") {
            const nested = record.data as Record<string, unknown>;
            if (Array.isArray(nested.data)) return nested.data as Record<string, unknown>[];
          }
        }
        return [];
      };

      const mapped = parseList(response).map((row) => ({
        date: formatTransactionDate(row.transactionDate ?? row.date ?? row.created_at),
        transactionId: String(
          row.referenceNo ?? row.transactionId ?? row.transaction_id ?? row.reference ?? row.id ?? ""
        ),
        username: String(row.username ?? row.user_name ?? selectedUser.label),
        operationType: String(row.subject ?? row.operationType ?? row.operation_type ?? ""),
        description: String(row.description ?? ""),
        amount:
          String(row.type ?? "").toLowerCase() === "debit"
            ? -Math.abs(toNumber(row.amount))
            : Math.abs(toNumber(row.amount)),
        prevBalance: (() => {
          const amount = toNumber(row.amount);
          const balance = toNumber(row.balance);
          const type = String(row.type ?? "").toLowerCase();
          if (type === "debit") return balance + amount;
          if (type === "credit") return balance - amount;
          return toNumber(row.prevBalance ?? row.prev_balance);
        })(),
        balance: toNumber(row.balance),
      })) satisfies Transaction[];

      setRows(mapped);
    } catch (err) {
      const apiError = normalizeApiError(err);
      setError(apiError.message ?? "Failed to fetch transactions");
      setRows([]);
    } finally {
      setIsLoading(false);
    }
  }, [dateRange.endDate, dateRange.startDate, selectedUser]);

  useEffect(() => {
    if (!selectedUser) return;
    void fetchTransactions();
  }, [fetchTransactions, selectedUser]);

  const filteredData = useMemo(() => {
    const normalizedSearch = query.trim().toLowerCase();
    if (!normalizedSearch) return rows;
    return rows.filter((row) =>
      searchableFields.some((field) =>
        String(row[field] ?? "").toLowerCase().includes(normalizedSearch)
      )
    );
  }, [query, rows]);

  const handleUserChange = (option: SingleValue<UserOption>) => {
    setSelectedUser(option ?? null);
  };

  const applyFilters = () => {
    void fetchTransactions();
  };

  const clearFilters = () => {
    setDateRange(defaultDateRange);
    resetQuery();
    void fetchTransactions();
  };

  return (
    <div className="space-y-6">
      <span className="flex items-center gap-1 mb-2 text-gray-500 dark:text-gray-400">
        <Info className="h-4 w-4" />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Select a user to view transactions, then filter by date range.
        </p>
      </span>

      <TableFilterToolbar<UserOption>
        dateRange={dateRange}
        onDateRangeChange={(range) => setDateRange(range)}
        actions={{
          onSearch: applyFilters,
          onClear: clearFilters,
        }}
        selectProps={{
          containerClassName: "max-w-[20rem]",
          options: userOptions,
          placeholder: "Select User",
          value: selectedUser,
          onChange: handleUserChange,
        }}
      />

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <DataTable columns={columns} data={filteredData} loading={isLoading} />
    </div>
  );
}

export default TransactionsTab;
