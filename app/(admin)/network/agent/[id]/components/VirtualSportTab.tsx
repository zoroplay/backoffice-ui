"use client";

import React, { useCallback, useEffect, useState, useMemo } from "react";
import { DataTable } from "@/components/tables/DataTable";
import type { SingleValue } from "react-select";
import type { Range } from "react-date-range";
import { ColumnDef } from "@tanstack/react-table";
import { useSearch } from "@/context/SearchContext";
import { TableFilterToolbar } from "@/components/common/TableFilterToolbar";
import { Info } from "lucide-react";
import type { Agency } from "@/app/(admin)/network/agency-list/columns";
import Badge from "@/components/ui/badge/Badge";

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

const mockVirtualSportData: VirtualSportBet[] = [
  {
    player: "player001",
    ticketNumber: "VS-2025-001234",
    stake: 5000,
    placedOn: "2025-11-14 10:30:00",
    amountWon: 15000,
    jackpot: 50000,
    status: "Won",
  },
  {
    player: "player002",
    ticketNumber: "VS-2025-001235",
    stake: 3000,
    placedOn: "2025-11-14 11:15:00",
    amountWon: 0,
    jackpot: 0,
    status: "Lost",
  },
  {
    player: "player003",
    ticketNumber: "VS-2025-001236",
    stake: 7500,
    placedOn: "2025-11-14 12:00:00",
    amountWon: 22500,
    jackpot: 75000,
    status: "Won",
  },
  {
    player: "player004",
    ticketNumber: "VS-2025-001237",
    stake: 2000,
    placedOn: "2025-11-14 13:45:00",
    amountWon: 0,
    jackpot: 0,
    status: "Pending",
  },
  {
    player: "player005",
    ticketNumber: "VS-2025-001238",
    stake: 10000,
    placedOn: "2025-11-14 14:20:00",
    amountWon: 30000,
    jackpot: 100000,
    status: "Won",
  },
  {
    player: "player006",
    ticketNumber: "VS-2025-001239",
    stake: 1500,
    placedOn: "2025-11-14 15:10:00",
    amountWon: 0,
    jackpot: 0,
    status: "Lost",
  },
  {
    player: "player007",
    ticketNumber: "VS-2025-001240",
    stake: 6000,
    placedOn: "2025-11-14 16:00:00",
    amountWon: 18000,
    jackpot: 60000,
    status: "Won",
  },
  {
    player: "player008",
    ticketNumber: "VS-2025-001241",
    stake: 4000,
    placedOn: "2025-11-14 17:30:00",
    amountWon: 0,
    jackpot: 0,
    status: "Pending",
  },
];

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
            status === "Won"
              ? "success"
              : status === "Lost"
              ? "error"
              : "info"
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

const searchableFields: Array<keyof VirtualSportBet> = [
  "player",
  "ticketNumber",
];

interface VirtualSportTabProps {
  agentId: string;
  agent: Agency;
}

function VirtualSportTab({ agentId, agent }: VirtualSportTabProps) {
  const [filteredData, setFilteredData] =
    useState<VirtualSportBet[]>(mockVirtualSportData);
  const [operationFilter, setOperationFilter] = useState<FilterOption | null>(
    null
  );
  const [dateRange, setDateRange] = useState<Range>(defaultDateRange);
  const [appliedOperationFilter, setAppliedOperationFilter] =
    useState<FilterOption | null>(null);
  const [appliedDateRange, setAppliedDateRange] = useState<Range | null>(null);
  const { query, setPlaceholder, resetPlaceholder, resetQuery } = useSearch();

  // Initialize with all data
  useEffect(() => {
    setFilteredData(mockVirtualSportData);
  }, []);

  const handleOperationChange = useCallback(
    (option: SingleValue<FilterOption>) => {
      setOperationFilter(option ?? null);
    },
    []
  );

  useEffect(() => {
    setPlaceholder("Search by Player or Ticket Number");

    return () => {
      resetPlaceholder();
    };
  }, [resetPlaceholder, setPlaceholder]);

  const agentFilteredData = useMemo(() => {
    return mockVirtualSportData;
  }, [agentId]);

  const filterBets = useCallback(
    (
      value: string,
      operation: { value: string; label: string } | null = appliedOperationFilter,
      range: Range | null = appliedDateRange
    ) => {
      const searchTerm = value.trim().toLowerCase();

      return agentFilteredData.filter((row) => {
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
          if (["won", "lost", "pending"].includes(val)) {
            match = match && row.status.toLowerCase() === val;
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
    [appliedDateRange, appliedOperationFilter, agentFilteredData]
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
    setFilteredData(agentFilteredData);
    resetQuery();
  };

  const totalTickets = useMemo(() => {
    return filteredData.length;
  }, [filteredData]);

  const totalStake = useMemo(() => {
    return filteredData.reduce((sum, bet) => sum + bet.stake, 0);
  }, [filteredData]);

  const totalWinnings = useMemo(() => {
    return filteredData.reduce((sum, bet) => sum + bet.amountWon, 0);
  }, [filteredData]);

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

      <DataTable columns={columns} data={filteredData} />
    </div>
  );
}

export default VirtualSportTab;

