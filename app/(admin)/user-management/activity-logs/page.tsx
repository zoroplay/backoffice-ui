"use client";

import React, { useMemo, useState, useEffect } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Clock,
  MonitorSmartphone,
  Eye,
  Info,
} from "lucide-react";
import { addDays, format } from "date-fns";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { TableFilterToolbar } from "@/components/common/TableFilterToolbar";
import { DataTable } from "@/components/tables/DataTable";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { defaultDateRange } from "@/components/common/DateRangeFilter";
import type { Range } from "react-date-range";
import { withAuth } from "@/utils/withAuth";

import LogDetailsModal from "./components/LogDetailsModal";
import { activityLogsSeed } from "./data";
import { useSearch } from "@/context/SearchContext";
import type { ActivityFilters, ActivityLog } from "./types";

const defaultFilters: ActivityFilters = {
  username: "",
  ipAddress: "",
  dateRange: {
    from: defaultDateRange.startDate ?? addDays(new Date(), -1),
    to: defaultDateRange.endDate ?? new Date(),
  },
};

function ActivityLogsPage() {
  const [logs] = useState<ActivityLog[]>(activityLogsSeed);
  const [filters, setFilters] = useState<ActivityFilters>(defaultFilters);
  const [appliedFilters, setAppliedFilters] =
    useState<ActivityFilters>(defaultFilters);
  const [activeTab, setActiveTab] = useState<
    "all" | "success" | "errors"
  >("all");

  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { query, setPlaceholder, resetPlaceholder, resetQuery } = useSearch();

  useEffect(() => {
    setPlaceholder("Search by username or IP address");
    return () => {
      resetPlaceholder();
      resetQuery();
    };
  }, [resetPlaceholder, resetQuery, setPlaceholder]);

  const handleChangeFilterValue = (
    field: keyof ActivityFilters,
    value: string | ActivityFilters["dateRange"]
  ) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDateRangeChange = (range: Range) => {
    handleChangeFilterValue("dateRange", {
      from: range.startDate ?? defaultFilters.dateRange.from,
      to: range.endDate ?? defaultFilters.dateRange.to,
    });
  };

  const dateRangeForToolbar: Range = useMemo(
    () => ({
      startDate: filters.dateRange.from,
      endDate: filters.dateRange.to,
      key: "selection",
    }),
    [filters.dateRange.from, filters.dateRange.to]
  );

  const handleApplyFilters = () => {
    setAppliedFilters(filters);
  };

  const handleClearFilters = () => {
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
  };

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const searchTerm = query.trim().toLowerCase();
      const matchesSearch = searchTerm
        ? log.username.toLowerCase().includes(searchTerm) ||
          log.ipAddress.toLowerCase().includes(searchTerm)
        : true;
      const matchesUsername = appliedFilters.username
        ? log.username.toLowerCase().includes(appliedFilters.username.toLowerCase())
        : true;
      const matchesIp = appliedFilters.ipAddress
        ? log.ipAddress.includes(appliedFilters.ipAddress)
        : true;
      const logDate = new Date(log.timestamp);
      const matchesDate =
        logDate >= appliedFilters.dateRange.from &&
        logDate <= appliedFilters.dateRange.to;
      const isError =
        log.action.toLowerCase().includes("error") ||
        log.response?.status === false ||
        log.response?.status === "failed";
      const matchesTab =
        activeTab === "all"
          ? true
          : activeTab === "errors"
          ? isError
          : !isError;
      return matchesSearch && matchesUsername && matchesIp && matchesDate && matchesTab;
    });
  }, [logs, appliedFilters, activeTab, query]);

  const columns = useMemo<ColumnDef<ActivityLog>[]>(() => {
    return [
      {
        accessorKey: "username",
        header: "Username",
        cell: ({ row }) => (
          <span className="text-sm font-semibold text-brand-600 dark:text-brand-200">
            {row.original.username}
          </span>
        ),
      },
      {
        accessorKey: "action",
        header: "Action",
        meta: { cellClassName: "text-left" },
        cell: ({ row }) => (
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {row.original.action}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "ipAddress",
        header: "IP Address",
        cell: ({ row }) => (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {row.original.ipAddress}
          </span>
        ),
      },
      {
        accessorKey: "timestamp",
        header: "Timestamp",
        cell: ({ row }) => (
          <div className="flex flex-col text-xs text-gray-500 dark:text-gray-400">
            <span className="font-semibold text-gray-700 dark:text-gray-200">
              {format(new Date(row.original.timestamp), "MMMM d, yyyy")}
            </span>
            <span>{format(new Date(row.original.timestamp), "p")}</span>
          </div>
        ),
      },
      {
        accessorKey: "userAgent",
        header: "Browser / Device",
        meta: { cellClassName: "text-left" },
        cell: ({ row }) => (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {row.original.userAgent}
          </span>
        ),
      },
      {
        id: "details",
        header: "Details",
        cell: ({ row }) => (
          <Button
            variant="outline"
            size="sm"
            className="px-2 py-1"
            onClick={() => {
              setSelectedLog(row.original);
              setIsModalOpen(true);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
        ),
      },
    ];
  }, []);

  const totalLogs = logs.length;
  const errorLogs = logs.filter((log) =>
    log.action.toLowerCase().includes("error")
  ).length;

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="User Management · Activity Logs" />

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Activity Logs
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Investigate administrative actions, API calls, and sensitive events in real time.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/60">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Total Records
            </p>
            <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {totalLogs}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              All time log retention
            </p>
          </div>
          <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-500/5 p-4 dark:border-emerald-500/30 dark:bg-emerald-500/10">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-200">
              Success Events
            </p>
            <p className="mt-2 text-2xl font-semibold text-emerald-600 dark:text-emerald-200">
              {totalLogs - errorLogs}
            </p>
            <p className="text-xs text-emerald-500/80 dark:text-emerald-200/70">
              Completed without errors
            </p>
          </div>
          <div className="rounded-2xl border border-dashed border-rose-200 bg-rose-500/5 p-4 dark:border-rose-500/30 dark:bg-rose-500/10">
            <p className="text-xs font-semibold uppercase tracking-wide text-rose-600 dark:text-rose-200">
              Errors & Retries
            </p>
            <p className="mt-2 text-2xl font-semibold text-rose-600 dark:text-rose-200">
              {errorLogs}
            </p>
            <p className="text-xs text-rose-500/80 dark:text-rose-200/70">
              Investigate recurring issues
            </p>
          </div>
          <div className="rounded-2xl border border-dashed border-brand-200 bg-brand-500/5 p-4 dark:border-brand-500/30 dark:bg-brand-500/10">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-200">
              Time Range
            </p>
            <p className="mt-2 text-2xl font-semibold text-brand-600 dark:text-brand-200">
              {format(appliedFilters.dateRange.from, "MMM d")} -{" "}
              {format(appliedFilters.dateRange.to, "MMM d")}
            </p>
            <p className="text-xs text-brand-500/80 dark:text-brand-200/70">
              Last refresh {format(new Date(), "h:mm a")}
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)} className="mt-6">
          <TabsList className="flex w-full flex-wrap items-center gap-2 rounded-full border border-gray-100 bg-white p-1 shadow-sm dark:border-gray-800 dark:bg-gray-950">
            <TabsTrigger
              value="all"
              className="rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 transition data-[state=active]:bg-brand-500 data-[state=active]:text-white dark:text-gray-400 dark:data-[state=active]:bg-brand-400 dark:data-[state=active]:text-gray-950"
            >
              All Logs
            </TabsTrigger>
            <TabsTrigger
              value="success"
              className="rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 transition data-[state=active]:bg-emerald-500 data-[state=active]:text-white dark:text-gray-400 dark:data-[state=active]:bg-emerald-500 dark:data-[state=active]:text-gray-950"
            >
              Success
            </TabsTrigger>
            <TabsTrigger
              value="errors"
              className="rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 transition data-[state=active]:bg-rose-500 data-[state=active]:text-white dark:text-gray-400 dark:data-[state=active]:bg-rose-500 dark:data-[state=active]:text-gray-950"
            >
              Errors
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6 space-y-6">
            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr),minmax(0,0.9fr)] xl:grid-cols-[minmax(0,1.6fr),minmax(0,0.9fr)]">
              <span className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Info className="h-4 w-4 " />
                Use the global search to filter by Username or IP Address
              </span>
              <TableFilterToolbar
                dateRange={dateRangeForToolbar}
                onDateRangeChange={handleDateRangeChange}
                actions={{
                  onSearch: handleApplyFilters,
                  onClear: handleClearFilters,
                }}
              />

              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950">
                <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                  <MonitorSmartphone className="h-4 w-4 text-brand-500" />
                  Recent IPs
                </h3>
                <ul className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  {[...new Set(logs.map((log) => log.ipAddress))].slice(0, 5).map((ip) => (
                    <li key={ip} className="flex items-center justify-between">
                      <span>{ip}</span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {logs.filter((log) => log.ipAddress === ip).length} events
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    Results ({filteredLogs.length})
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Click a record to view the original payload and response.
                  </p>
                </div>
                <Badge variant="light" color="info" size="sm">
                  {appliedFilters.username
                    ? `Filtered by ${appliedFilters.username}`
                    : "Global search ready"}
                </Badge>
              </div>
              <DataTable columns={columns} data={filteredLogs} />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <LogDetailsModal
        isOpen={isModalOpen}
        log={selectedLog}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedLog(null);
        }}
      />
    </div>
  );
}

export default withAuth(ActivityLogsPage);

