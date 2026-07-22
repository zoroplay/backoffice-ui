"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { Range } from "react-date-range";
import { toast } from "sonner";

import { TableFilterToolbar } from "@/components/common/TableFilterToolbar";
import { DataTable } from "@/components/tables/DataTable";
import type { Agency } from "@/app/(admin)/network/agency-list/columns";
import {
  asRecord,
  clientId,
  emptyPagination,
  formatDate,
  paginationFrom,
  rowValue,
  type AnyRecord,
  type Pagination,
} from "@/app/(admin)/tickets/components/ticketApiHelpers";
import { useSearch } from "@/context/SearchContext";
import { POSTREQUEST } from "@/utils/base_request";

const defaultDateRange: Range = {
  startDate: startOfIsoWeek(new Date()),
  endDate: endOfIsoWeek(new Date()),
  key: "selection",
};

type ActivityLog = {
  id: string;
  date: string;
  clientType: string;
  username: string;
  action: string;
  ipAddress: string;
  description: string;
  raw: AnyRecord;
};

interface ActivityLogsTabProps {
  agentId: string;
  agent: Agency;
}

function ActivityLogsTab({ agentId, agent }: ActivityLogsTabProps) {
  const [rows, setRows] = useState<ActivityLog[]>([]);
  const [filteredRows, setFilteredRows] = useState<ActivityLog[]>([]);
  const [dateRange, setDateRange] = useState<Range>(defaultDateRange);
  const [pagination, setPagination] = useState<Pagination>(emptyPagination);
  const [loading, setLoading] = useState(false);
  const { query, setPlaceholder, resetPlaceholder, resetQuery } = useSearch();

  const columns = useMemo<ColumnDef<ActivityLog>[]>(
    () => [
      { accessorKey: "id", header: "ID" },
      { accessorKey: "date", header: "Date" },
      { accessorKey: "clientType", header: "Client Type" },
      { accessorKey: "username", header: "Username" },
      { accessorKey: "action", header: "Action" },
      { accessorKey: "ipAddress", header: "IP Address" },
      {
        accessorKey: "description",
        header: "Description",
        meta: { cellClassName: "text-left" },
      },
    ],
    []
  );

  const applyClientSearch = useCallback(
    (sourceRows: ActivityLog[], value: string) => {
      const searchTerm = value.trim().toLowerCase();
      if (!searchTerm) return sourceRows;

      return sourceRows.filter((row) =>
        [
          row.id,
          row.clientType,
          row.username,
          row.action,
          row.ipAddress,
          row.description,
        ]
          .join(" ")
          .toLowerCase()
          .includes(searchTerm)
      );
    },
    []
  );

  async function loadLogs(page = 1, range = dateRange) {
    const from = range.startDate ? formatPayloadDate(range.startDate, "start") : "";
    const to = range.endDate ? formatPayloadDate(range.endDate, "end") : "";

    setLoading(true);
    const response = await POSTREQUEST<any>(`user/account/login-history?page=${page}`, {
      from,
      to,
      username: agent.username,
      userId: agentId,
      agentId,
      clientId: clientId(),
    });
    setLoading(false);

    const body = asRecord(response.data);
    if (!response.ok || body.success === false) {
      toast.error(response.error || body.message || "Unable to fetch activity logs");
      return;
    }

    const rowsSource = extractRows(response.data);
    const mappedRows = rowsSource.map(mapLogRow);
    setRows(mappedRows);
    setFilteredRows(applyClientSearch(mappedRows, query));
    setPagination(paginationFrom(extractPaginationSource(response.data), page, mappedRows.length));
  }

  useEffect(() => {
    setPlaceholder("Search by ID, username, action, IP, or client type");

    return () => {
      resetPlaceholder();
      resetQuery();
    };
  }, [resetPlaceholder, resetQuery, setPlaceholder]);

  useEffect(() => {
    if (agentId) void loadLogs(1);
  }, [agentId]);

  useEffect(() => {
    setFilteredRows(applyClientSearch(rows, query));
  }, [applyClientSearch, query, rows]);

  const applyFilters = () => {
    void loadLogs(1);
  };

  const clearFilters = () => {
    setDateRange(defaultDateRange);
    resetQuery();
    void loadLogs(1, defaultDateRange);
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

      <section className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-5 py-4 dark:border-gray-800">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            Activity Logs
          </h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {loading ? "Loading" : `${filteredRows.length.toLocaleString()} shown`}
          </span>
        </div>
        <div className="p-5">
          <DataTable columns={columns} data={filteredRows} />
        </div>
        <PaginationSummary pagination={pagination} loading={loading} onPage={(page) => void loadLogs(page)} />
      </section>
    </div>
  );
}

function extractRows(data: unknown): AnyRecord[] {
  const body = asRecord(data);
  const nested = asRecord(body.data);

  if (Array.isArray(body.data)) return body.data.map(asRecord);
  if (Array.isArray(nested.data)) return nested.data.map(asRecord);
  if (Array.isArray(body.logs)) return body.logs.map(asRecord);
  if (Array.isArray(nested.logs)) return nested.logs.map(asRecord);
  if (Array.isArray(body.histories)) return body.histories.map(asRecord);
  if (Array.isArray(nested.histories)) return nested.histories.map(asRecord);

  return [];
}

function extractPaginationSource(data: unknown) {
  const body = asRecord(data);
  const nested = asRecord(body.data);
  return Array.isArray(nested.data) ? nested : body;
}

function mapLogRow(row: AnyRecord): ActivityLog {
  const createdAt = rowValue(row, ["created_at", "createdAt", "timestamp", "login_time"], "");
  const id = String(rowValue(row, ["id", "logId", "log_id"], "-"));

  return {
    id,
    date: formatDate(createdAt),
    clientType: String(rowValue(row, ["client_type", "clientType", "channel", "source"], "-")),
    username: String(rowValue(row, ["username", "userName", "user_name"], "-")),
    action: String(rowValue(row, ["action", "event", "activity"], "-")),
    ipAddress: String(rowValue(row, ["ipAddress", "ip_address", "login_ip", "ip"], "-")),
    description: String(rowValue(row, ["description", "details", "message", "endpoint"], "-")),
    raw: row,
  };
}

function PaginationSummary({
  pagination,
  loading,
  onPage,
}: {
  pagination: Pagination;
  loading: boolean;
  onPage: (page: number) => void;
}) {
  const lastPage = pagination.last_page ?? Math.max(1, Math.ceil((pagination.total || 0) / (pagination.per_page || 1)));
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 px-5 py-4 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
      <span>
        Showing {pagination.total ? `${pagination.from} to ${pagination.to} of ${pagination.total}` : "0"} entries
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={loading || pagination.current_page <= 1}
          onClick={() => onPage(pagination.current_page - 1)}
          className="h-8 rounded-md border border-gray-300 px-3 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700"
        >
          Previous
        </button>
        <button
          type="button"
          disabled={loading || pagination.current_page >= lastPage}
          onClick={() => onPage(pagination.current_page + 1)}
          className="h-8 rounded-md border border-gray-300 px-3 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700"
        >
          Next
        </button>
      </div>
    </div>
  );
}

function formatPayloadDate(date: Date, boundary: "start" | "end") {
  const next = new Date(date);
  if (boundary === "start") next.setHours(0, 0, 0, 0);
  if (boundary === "end") next.setHours(23, 59, 59, 999);

  return `${pad(next.getDate())}-${pad(next.getMonth() + 1)}-${next.getFullYear()} ${pad(next.getHours())}:${pad(next.getMinutes())}:${pad(next.getSeconds())}`;
}

function startOfIsoWeek(date: Date) {
  const next = new Date(date);
  const day = next.getDay() || 7;
  next.setDate(next.getDate() - day + 1);
  next.setHours(0, 0, 0, 0);
  return next;
}

function endOfIsoWeek(date: Date) {
  const next = startOfIsoWeek(date);
  next.setDate(next.getDate() + 6);
  next.setHours(23, 59, 59, 999);
  return next;
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export default ActivityLogsTab;
