"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Eye } from "lucide-react";
import { toast } from "sonner";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { FilterActions } from "@/components/common/FilterActions";
import Button from "@/components/ui/button/Button";
import { withAuth } from "@/utils/withAuth";
import { POSTREQUEST } from "@/utils/base_request";

import LogDetailsModal from "./components/LogDetailsModal";
import type { ActivityLog } from "./types";

type Period =
  | "today"
  | "yesterday"
  | "current_week"
  | "last_week"
  | "current_month"
  | "last_month"
  | "last_30_days"
  | "date_range";

type Filters = {
  period: Period;
  username: string;
  from: string;
  to: string;
  ipAddress: string;
};

type Pagination = {
  total: number;
  per_page: number;
  from: number;
  to: number;
  current_page: number;
  last_page: number;
};

const periodOptions: Array<{ value: Period; label: string }> = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "current_week", label: "Current Week" },
  { value: "last_week", label: "Last Week" },
  { value: "current_month", label: "Current Month" },
  { value: "last_month", label: "Last Month" },
  { value: "last_30_days", label: "Last 30 Days" },
  { value: "date_range", label: "Date Range" },
];

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function formatRequestDateTime(date: Date) {
  return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()} ${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function formatInputDateTime(value: string) {
  if (!value) return "";
  const [datePart = "", timePart = ""] = value.split(" ");
  const [day = "", month = "", year = ""] = datePart.split("-");
  return year && month && day ? `${year}-${month}-${day}T${timePart.slice(0, 5)}` : "";
}

function requestValueFromInput(value: string) {
  if (!value) return "";
  const [datePart = "", timePart = ""] = value.split("T");
  const [year = "", month = "", day = ""] = datePart.split("-");
  return `${day}-${month}-${year} ${timePart}:00`;
}

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function endOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(23, 59, 59, 0);
  return copy;
}

function startOfIsoWeek(date: Date) {
  const copy = startOfDay(date);
  const day = copy.getDay() || 7;
  copy.setDate(copy.getDate() - day + 1);
  return copy;
}

function endOfIsoWeek(date: Date) {
  const copy = startOfIsoWeek(date);
  copy.setDate(copy.getDate() + 6);
  copy.setHours(23, 59, 59, 0);
  return copy;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
}

function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function addMonths(date: Date, months: number) {
  const copy = new Date(date);
  copy.setMonth(copy.getMonth() + months);
  return copy;
}

function rangeForPeriod(period: Period) {
  const today = new Date();

  switch (period) {
    case "yesterday": {
      const date = addDays(today, -1);
      return { from: formatRequestDateTime(startOfDay(date)), to: formatRequestDateTime(endOfDay(date)) };
    }
    case "current_week":
      return {
        from: formatRequestDateTime(startOfIsoWeek(today)),
        to: formatRequestDateTime(endOfIsoWeek(today)),
      };
    case "last_week": {
      const week = addDays(today, -7);
      return {
        from: formatRequestDateTime(startOfIsoWeek(week)),
        to: formatRequestDateTime(endOfIsoWeek(week)),
      };
    }
    case "current_month":
      return {
        from: formatRequestDateTime(startOfMonth(today)),
        to: formatRequestDateTime(endOfMonth(today)),
      };
    case "last_month": {
      const month = addMonths(today, -1);
      return {
        from: formatRequestDateTime(startOfMonth(month)),
        to: formatRequestDateTime(endOfMonth(month)),
      };
    }
    case "last_30_days":
      return {
        from: formatRequestDateTime(startOfDay(addDays(today, -30))),
        to: formatRequestDateTime(endOfDay(today)),
      };
    case "date_range":
      return {
        from: formatRequestDateTime(startOfDay(today)),
        to: formatRequestDateTime(endOfDay(today)),
      };
    case "today":
    default:
      return {
        from: formatRequestDateTime(startOfDay(today)),
        to: formatRequestDateTime(endOfDay(today)),
      };
  }
}

function defaultFilters(): Filters {
  return {
    period: "today",
    username: "",
    ipAddress: "",
    ...rangeForPeriod("today"),
  };
}

function asRecord(value: unknown): Record<string, any> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, any>)
    : {};
}

function parseJsonValue(value: unknown) {
  if (!value) return {};
  if (typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  if (typeof value !== "string") {
    return { value };
  }

  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
    return { value: parsed };
  } catch {
    return { value };
  }
}

function mapLog(value: unknown, index: number): ActivityLog {
  const row = asRecord(value);
  return {
    id: String(row.id ?? `${row.userName ?? row.username ?? "log"}-${index}`),
    username: String(row.userName ?? row.username ?? "-"),
    action: String(row.action ?? row.event ?? "-"),
    ipAddress: String(row.ipAddress ?? row.ip ?? "-"),
    timestamp: String(row.timestamp ?? row.created_at ?? row.createdAt ?? ""),
    userAgent: String(row.userAgent ?? row.browser ?? "-"),
    payload: parseJsonValue(row.payload),
    response: parseJsonValue(row.response),
  };
}

function toNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function formatTimestamp(value: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);
}

function pageNumbers(pagination: Pagination) {
  const total = Math.max(1, pagination.last_page);
  const current = Math.max(1, pagination.current_page);
  const pages: Array<number | string> = [];

  for (let page = Math.max(1, current - 2); page <= Math.min(total, current + 2); page += 1) {
    pages.push(page);
  }
  if (pages[0] !== 1) {
    pages.unshift(1);
    if (pages[1] !== 2) pages.splice(1, 0, "...");
  }
  if (pages[pages.length - 1] !== total) {
    if (pages[pages.length - 1] !== total - 1) pages.push("...");
    pages.push(total);
  }

  return pages;
}

function downloadCsv(rows: ActivityLog[]) {
  const header = ["Username", "Action", "IP Address", "Timestamp", "Browser"];
  const body = rows.map((row) => [
    row.username,
    row.action,
    row.ipAddress,
    row.timestamp,
    row.userAgent,
  ]);
  const csv = [header, ...body]
    .map((line) =>
      line
        .map((value) => {
          if (value.includes(",") || value.includes("\"") || value.includes("\n")) {
            return `"${value.replace(/"/g, "\"\"")}"`;
          }
          return value;
        })
        .join(",")
    )
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "activity_logs.csv";
  anchor.click();
  URL.revokeObjectURL(url);
}

function ActivityLogsPage() {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [rows, setRows] = useState<ActivityLog[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    per_page: 10,
    from: 0,
    to: 0,
    current_page: 1,
    last_page: 1,
  });
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  async function loadLogs(page = 1, nextFilters = filters) {
    setLoading(true);
    try {
      const response = await POSTREQUEST<any>(`/admin/get_all_logs?page=${page}`, {
        period: nextFilters.period,
        username: nextFilters.username,
        from: nextFilters.from,
        to: nextFilters.to,
        ipAddress: nextFilters.ipAddress,
        clientId: process.env.NEXT_PUBLIC_CLIENT_ID ?? "",
      });
      const body = asRecord(response.data);
      if (!response.ok || body.success === false) {
        throw new Error(response.error || body.message || "Unable to load activity logs");
      }

      const logs = Array.isArray(body.logs) ? body.logs.map(mapLog) : [];
      const meta = asRecord(body.meta);

      setRows(logs);
      setPagination({
        total: toNumber(meta.totalItems, logs.length),
        per_page: toNumber(meta.itemsPerPage, logs.length || 10),
        from: toNumber(meta.from, logs.length ? 1 : 0),
        to: toNumber(meta.to, logs.length),
        current_page: toNumber(meta.currentPage, page),
        last_page: Math.max(1, toNumber(meta.totalPages, 1)),
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occured");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const initialFilters = defaultFilters();
    setFilters(initialFilters);
    void loadLogs(1, initialFilters);
  }, []);

  const currentPages = useMemo(() => pageNumbers(pagination), [pagination]);

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Activity Logs" />

      <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="grid gap-4 md:grid-cols-5">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Period
            <select
              value={filters.period}
              onChange={(event) => {
                const period = event.target.value as Period;
                setFilters((current) => ({
                  ...current,
                  period,
                  ...rangeForPeriod(period),
                }));
              }}
              className="mt-2 h-10 w-full rounded-md border border-gray-300 px-3 text-sm text-gray-800 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            >
              {periodOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            From
            <input
              type="datetime-local"
              value={formatInputDateTime(filters.from)}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  period: "date_range",
                  from: requestValueFromInput(event.target.value),
                }))
              }
              className="mt-2 h-10 w-full rounded-md border border-gray-300 px-3 text-sm text-gray-800 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            />
          </label>

          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            To
            <input
              type="datetime-local"
              value={formatInputDateTime(filters.to)}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  period: "date_range",
                  to: requestValueFromInput(event.target.value),
                }))
              }
              className="mt-2 h-10 w-full rounded-md border border-gray-300 px-3 text-sm text-gray-800 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            />
          </label>

          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Username
            <input
              value={filters.username}
              placeholder="Username"
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  username: event.target.value,
                }))
              }
              className="mt-2 h-10 w-full rounded-md border border-gray-300 px-3 text-sm text-gray-800 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            />
          </label>

          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            IP Address
            <input
              value={filters.ipAddress}
              placeholder="IP Address"
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  ipAddress: event.target.value,
                }))
              }
              className="mt-2 h-10 w-full rounded-md border border-gray-300 px-3 text-sm text-gray-800 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            />
          </label>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <FilterActions
            onSearch={() => void loadLogs(1, filters)}
            onClear={() => {
              const nextFilters = defaultFilters();
              setFilters(nextFilters);
              void loadLogs(1, nextFilters);
            }}
            isLoading={loading}
          />
          <Button
            variant="outline"
            size="sm"
            disabled={!rows.length}
            startIcon={<Download className="h-4 w-4" />}
            onClick={() => downloadCsv(rows)}
          >
            Export CSV
          </Button>
        </div>
      </section>

      <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
            <thead>
              <tr>
                {["Username", "Action", "IP Address", "Timestamp", "Browser", "Details"].map((header) => (
                  <th
                    key={header}
                    className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                    Loading Please wait....
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                    No record found
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id}>
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-brand-500">{row.username}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{row.action}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{row.ipAddress}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">
                      {formatTimestamp(row.timestamp)}
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{row.userAgent}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedLog(row);
                          setModalOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing {pagination.from} to {pagination.to} of {pagination.total} entries
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.current_page <= 1}
              onClick={() => void loadLogs(pagination.current_page - 1, filters)}
            >
              Previous
            </Button>
            {currentPages.map((page, index) =>
              page === "..." ? (
                <span key={`ellipsis-${index}`} className="px-2 text-sm text-gray-400">
                  ...
                </span>
              ) : (
                <Button
                  key={page}
                  variant={page === pagination.current_page ? "primary" : "outline"}
                  size="sm"
                  disabled={page === pagination.current_page}
                  onClick={() => void loadLogs(Number(page), filters)}
                >
                  {page}
                </Button>
              )
            )}
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.current_page >= pagination.last_page}
              onClick={() => void loadLogs(pagination.current_page + 1, filters)}
            >
              Next
            </Button>
          </div>
        </div>
      </section>

      <LogDetailsModal
        isOpen={modalOpen}
        log={selectedLog}
        onClose={() => {
          setModalOpen(false);
          setSelectedLog(null);
        }}
      />
    </div>
  );
}

export default withAuth(ActivityLogsPage);
