"use client";

import React, { useCallback, useEffect, useState, useMemo } from "react";
import { DataTable } from "@/components/tables/DataTable";
import type { Range } from "react-date-range";
import { ColumnDef } from "@tanstack/react-table";
import { useSearch } from "@/context/SearchContext";
import { TableFilterToolbar } from "@/components/common/TableFilterToolbar";
import type { Agency } from "@/app/(admin)/network/agency-list/columns";

const defaultDateRange: Range = {
  startDate: new Date(new Date().setDate(new Date().getDate() - 7)),
  endDate: new Date(),
  key: "selection",
};

export type ActivityLog = {
  id: string;
  date: string;
  clientType: string;
  action: string;
  description: string;
};

const mockActivityLogs: ActivityLog[] = [
  {
    id: "LOG-001",
    date: "2025-11-14 09:00:00",
    clientType: "Website",
    action: "Login",
    description: "User logged in successfully",
  },
  {
    id: "LOG-002",
    date: "2025-11-14 09:15:00",
    clientType: "Mobile",
    action: "Transaction",
    description: "Deposit transaction processed",
  },
  {
    id: "LOG-003",
    date: "2025-11-14 10:00:00",
    clientType: "Cashier",
    action: "Bet Placement",
    description: "Bet placed successfully",
  },
  {
    id: "LOG-004",
    date: "2025-11-14 10:30:00",
    clientType: "Website",
    action: "Withdrawal",
    description: "Withdrawal request submitted",
  },
  {
    id: "LOG-005",
    date: "2025-11-14 11:00:00",
    clientType: "Mobile",
    action: "Login",
    description: "User logged in successfully",
  },
  {
    id: "LOG-006",
    date: "2025-11-14 11:45:00",
    clientType: "Cashier",
    action: "Transaction",
    description: "Deposit transaction processed",
  },
  {
    id: "LOG-007",
    date: "2025-11-14 12:30:00",
    clientType: "Website",
    action: "Bet Settlement",
    description: "Bet settled and winnings paid",
  },
  {
    id: "LOG-008",
    date: "2025-11-14 13:00:00",
    clientType: "Mobile",
    action: "Account Update",
    description: "User profile updated",
  },
  {
    id: "LOG-009",
    date: "2025-11-14 14:00:00",
    clientType: "Cashier",
    action: "Login",
    description: "User logged in successfully",
  },
  {
    id: "LOG-010",
    date: "2025-11-14 14:30:00",
    clientType: "Website",
    action: "Transaction",
    description: "Bonus credited to account",
  },
  {
    id: "LOG-011",
    date: "2025-11-14 15:00:00",
    clientType: "Mobile",
    action: "Bet Placement",
    description: "Bet placed successfully",
  },
  {
    id: "LOG-012",
    date: "2025-11-14 16:00:00",
    clientType: "Website",
    action: "Withdrawal",
    description: "Withdrawal processed and completed",
  },
];

const columns: ColumnDef<ActivityLog>[] = [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "date", header: "Date" },
  { accessorKey: "clientType", header: "Client Type" },
  { accessorKey: "action", header: "Action" },
  { accessorKey: "description", header: "Description" },
];

interface ActivityLogsTabProps {
  agentId: string;
  agent: Agency;
}

function ActivityLogsTab({ agentId, agent }: ActivityLogsTabProps) {
  const [filteredData, setFilteredData] =
    useState<ActivityLog[]>(mockActivityLogs);
  const [dateRange, setDateRange] = useState<Range>(defaultDateRange);
  const [appliedDateRange, setAppliedDateRange] = useState<Range | null>(null);
  const { query, setPlaceholder, resetPlaceholder, resetQuery } = useSearch();

  useEffect(() => {
    setPlaceholder("Search by ID, Action, or Description");

    return () => {
      resetPlaceholder();
    };
  }, [resetPlaceholder, setPlaceholder]);

  const agentFilteredData = useMemo(() => {
    return mockActivityLogs;
  }, [agentId]);

  const filterLogs = useCallback(
    (value: string, range: Range | null = appliedDateRange) => {
      const searchTerm = value.trim().toLowerCase();

      return agentFilteredData.filter((row) => {
        let match = true;

        if (searchTerm) {
          const matchesSearch =
            row.id.toLowerCase().includes(searchTerm) ||
            row.action.toLowerCase().includes(searchTerm) ||
            row.description.toLowerCase().includes(searchTerm);

          if (!matchesSearch) {
            return false;
          }
        }

        if (range && range.startDate && range.endDate) {
          const rowDate = new Date(row.date);
          const start = new Date(range.startDate);
          const end = new Date(range.endDate);

          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);

          match = match && rowDate >= start && rowDate <= end;
        }

        return match;
      });
    },
    [appliedDateRange, agentFilteredData]
  );

  useEffect(() => {
    setFilteredData(filterLogs(query));
  }, [filterLogs, query]);

  const applyFilters = () => {
    const nextDateRange = dateRange;
    setAppliedDateRange(nextDateRange);
    setFilteredData(filterLogs(query, nextDateRange));
  };

  const clearFilters = () => {
    setDateRange(defaultDateRange);
    setAppliedDateRange(null);
    setFilteredData(agentFilteredData);
    resetQuery();
  };

  return (
    <div className="space-y-6">
      <TableFilterToolbar
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          actions={{
            onSearch: applyFilters,
            onClear: clearFilters,
          }}
        />

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <span>📋</span>
            Activity Logs
          </h3>
        </div>
        <div className="p-6">
          <DataTable columns={columns} data={filteredData} />
        </div>
      </div>
    </div>
  );
}

export default ActivityLogsTab;

