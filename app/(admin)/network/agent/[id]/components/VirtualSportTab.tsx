"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { DataTable } from "@/components/tables/DataTable";
import type { SingleValue } from "react-select";
import type { Range } from "react-date-range";
import { ColumnDef } from "@tanstack/react-table";
import { useSearch } from "@/context/SearchContext";
import { TableFilterToolbar } from "@/components/common/TableFilterToolbar";
import { Info } from "lucide-react";
import type { Agency } from "@/app/(admin)/network/agency-list/columns";
import Badge from "@/components/ui/badge/Badge";
import { betsApi, normalizeApiError } from "@/lib/api";

const defaultDateRange: Range = {
  startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
  endDate: new Date(),
  key: "selection",
};

export type VirtualSportBet = {
  player: string;
  ticketNumber: string;
  stake: number;
  placedOn: string;
  amountWon: number;
  jackpot: number;
  status: "Won" | "Lost" | "Pending";
};

const columns: ColumnDef<VirtualSportBet>[] = [
  { accessorKey: "player", header: "Player" },
  { accessorKey: "ticketNumber", header: "Ticket Number" },
  {
    accessorKey: "stake",
    header: "Stake",
    cell: ({ row }) => `₦${row.getValue<number>("stake").toLocaleString()}`,
  },
  { accessorKey: "placedOn", header: "Placed on" },
  {
    accessorKey: "amountWon",
    header: "Amount Won",
    cell: ({ row }) => `₦${row.getValue<number>("amountWon").toLocaleString()}`,
  },
  {
    accessorKey: "jackpot",
    header: "Jackpot",
    cell: ({ row }) => `₦${row.getValue<number>("jackpot").toLocaleString()}`,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue<string>("status");
      return (
        <Badge
          variant="light"
          color={
            status === "Won" ? "success" : status === "Lost" ? "error" : "info"
          }
        >
          {status}
        </Badge>
      );
    },
  },
];

type FilterOption = { value: string; label: string };

const operationOptions: Array<{
  label: string;
  options: FilterOption[];
}> = [
  {
    label: "Bet Type",
    options: [
      { value: "single", label: "Single Bet" },
      { value: "multi", label: "Multiple Bet" },
    ],
  },
  {
    label: "Status",
    options: [
      { value: "won", label: "Won" },
      { value: "lost", label: "Lost" },
      { value: "pending", label: "Pending" },
    ],
  },
];

const searchableFields: Array<keyof VirtualSportBet> = ["player", "ticketNumber"];

interface VirtualSportTabProps {
  agentId: string;
  agent: Agency;
}

function VirtualSportTab({ agentId, agent }: VirtualSportTabProps) {
  const effectiveAgentId = agentId || agent.id || agent.username;
  const [rows, setRows] = useState<VirtualSportBet[]>([]);
  const [operationFilter, setOperationFilter] = useState<FilterOption | null>(null);
  const [dateRange, setDateRange] = useState<Range>(defaultDateRange);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { query, setPlaceholder, resetPlaceholder, resetQuery } = useSearch();

  const handleOperationChange = useCallback((option: SingleValue<FilterOption>) => {
    setOperationFilter(option ?? null);
  }, []);

  useEffect(() => {
    setPlaceholder("Search by Player or Ticket Number");
    return () => {
      resetPlaceholder();
    };
  }, [resetPlaceholder, setPlaceholder]);

  const toNumber = (value: unknown) => {
    const num = Number(value ?? 0);
    return Number.isFinite(num) ? num : 0;
  };

  const mapStatus = (value: unknown): VirtualSportBet["status"] => {
    const normalized = String(value ?? "").toLowerCase();
    if (normalized.includes("won")) return "Won";
    if (normalized.includes("lost")) return "Lost";
    return "Pending";
  };

  const formatDateTime = (date: Date | undefined, endOfDay = false) => {
    const d = date ? new Date(date) : new Date();
    if (endOfDay) {
      d.setHours(23, 59, 59, 0);
    } else {
      d.setHours(0, 0, 0, 0);
    }
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

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

  const mapRow = (row: Record<string, unknown>): VirtualSportBet => ({
    player: String(row.player ?? row.username ?? ""),
    ticketNumber: String(row.ticketNumber ?? row.ticket_number ?? row.betslip_id ?? ""),
    stake: toNumber(row.stake),
    placedOn: String(row.placedOn ?? row.placed_on ?? row.created_at ?? ""),
    amountWon: toNumber(row.amountWon ?? row.amount_won ?? row.winnings),
    jackpot: toNumber(row.jackpot),
    status: mapStatus(row.status ?? row.state),
  });

  const fetchVirtualBets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const payload = {
        period: "",
        username: "",
        from: formatDateTime(dateRange.startDate),
        to: formatDateTime(dateRange.endDate, true),
        bet_type: "",
        event_type: "",
        sport: "",
        league: "",
        market: "",
        state: "",
        group_type: "",
        amount_range: "",
        status: "",
      };
      const response = await betsApi.getAgentVirtualBets(
        effectiveAgentId,
        payload,
        1,
        100
      );
      setRows(parseList(response).map(mapRow));
    } catch (err) {
      const apiError = normalizeApiError(err);
      setError(apiError.message ?? "Failed to fetch virtual bets");
      setRows([]);
    } finally {
      setIsLoading(false);
    }
  }, [dateRange.endDate, dateRange.startDate, effectiveAgentId]);

  useEffect(() => {
    void fetchVirtualBets();
  }, [fetchVirtualBets]);

  const filteredData = useMemo(() => {
    const searchTerm = query.trim().toLowerCase();
    if (!searchTerm) return rows;
    return rows.filter((row) =>
      searchableFields.some((field) =>
        String(row[field] ?? "").toLowerCase().includes(searchTerm)
      )
    );
  }, [query, rows]);

  const applyFilters = () => {
    void fetchVirtualBets();
  };

  const clearFilters = () => {
    setOperationFilter(null);
    setDateRange(defaultDateRange);
    resetQuery();
    void fetchVirtualBets();
  };

  const totalTickets = useMemo(() => filteredData.length, [filteredData]);
  const totalStake = useMemo(
    () => filteredData.reduce((sum, bet) => sum + bet.stake, 0),
    [filteredData]
  );
  const totalWinnings = useMemo(
    () => filteredData.reduce((sum, bet) => sum + bet.amountWon, 0),
    [filteredData]
  );

  return (
    <div className="space-y-6">
      <span className="flex items-center gap-1 mb-2 text-gray-500 dark:text-gray-400">
        <Info className="h-4 w-4" />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Use the global search to filter by Player or Ticket Number, or use the
          filters below to narrow down the results.
        </p>
      </span>

      <TableFilterToolbar<FilterOption>
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        actions={{
          onSearch: applyFilters,
          onClear: clearFilters,
        }}
        selectProps={{
          containerClassName: "max-w-[22rem]",
          options: operationOptions,
          placeholder: "Filter Options",
          value: operationFilter,
          onChange: handleOperationChange,
        }}
      />

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 shadow-sm">
          <div className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">
            Total Tickets
          </div>
          <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
            {totalTickets.toFixed(2)}
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-800 rounded-lg p-4 shadow-sm">
          <div className="text-sm text-green-600 dark:text-green-400 font-medium mb-1">
            Total Stake
          </div>
          <div className="text-2xl font-bold text-green-700 dark:text-green-300">
            ₦{totalStake.toLocaleString()}
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 shadow-sm">
          <div className="text-sm text-purple-600 dark:text-purple-400 font-medium mb-1">
            Total Winnings
          </div>
          <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
            ₦{totalWinnings.toLocaleString()}
          </div>
        </div>
      </div>

      <DataTable columns={columns} data={filteredData} loading={isLoading} />
    </div>
  );
}

export default VirtualSportTab;
