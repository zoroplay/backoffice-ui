"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { FilterActions } from "@/components/common/FilterActions";
import Button from "@/components/ui/button/Button";
import { withAuth } from "@/utils/withAuth";

import {
  fetchRegistrationReportPage,
  updatePlayerReportStatus,
  verifyPlayerReportAccount,
  type RegistrationFilters,
  type RegistrationPeriod,
} from "../reportsApi";
import { PlayerReportTable, downloadPlayerReportCsv } from "./PlayerReportTable";

const periodOptions: Array<{ value: RegistrationPeriod; label: string }> = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "current_week", label: "Current Week" },
  { value: "last_week", label: "Last Week" },
  { value: "current_month", label: "Current Month" },
  { value: "last_month", label: "Last Month" },
  { value: "last_30_days", label: "Last 30 Days" },
  { value: "all_time", label: "All Time" },
  { value: "date_range", label: "Date Range" },
];

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function formatRequestDateTime(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function formatDateTimeInput(value: string) {
  if (!value) return "";
  const normalized = value.replace(" ", "T");
  return normalized.slice(0, 16);
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

function rangeForPeriod(period: RegistrationPeriod) {
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
    case "all_time":
      return {
        from: "1970-01-01 00:00:00",
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

function defaultFilters(): RegistrationFilters {
  return {
    period: "today",
    ...rangeForPeriod("today"),
  };
}

function RegistrationReportClient() {
  const [filters, setFilters] = useState<RegistrationFilters>(defaultFilters);
  const [rows, setRows] = useState<Awaited<ReturnType<typeof fetchRegistrationReportPage>>["rows"]>([]);
  const [pagination, setPagination] = useState<Awaited<ReturnType<typeof fetchRegistrationReportPage>>["pagination"]>({
    total: 0,
    per_page: 100,
    from: 0,
    to: 0,
    current_page: 1,
    last_page: 1,
  });
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState("");

  const totalRegistered = useMemo(() => pagination.total, [pagination.total]);

  const loadReport = useCallback(
    async (page = 1, nextFilters = filters) => {
      setLoading(true);
      try {
        const result = await fetchRegistrationReportPage(nextFilters, page);
        setRows(result.rows);
        setPagination(result.pagination);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to load registration report");
        setRows([]);
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  useEffect(() => {
    let cancelled = false;
    const initialFilters = defaultFilters();

    async function initialize() {
      setFilters(initialFilters);
      setLoading(true);
      try {
        const result = await fetchRegistrationReportPage(initialFilters, 1);
        if (!cancelled) {
          setRows(result.rows);
          setPagination(result.pagination);
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(error instanceof Error ? error.message : "Unable to load registration report");
          setRows([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void initialize();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSearch() {
    await loadReport(1, filters);
  }

  async function handleClear() {
    const nextFilters = defaultFilters();
    setFilters(nextFilters);
    await loadReport(1, nextFilters);
  }

  async function handleVerify(row: (typeof rows)[number]) {
    const confirmed = window.confirm("Are you sure you want to verify this account?");
    if (!confirmed) return;

    setActingId(row.id);
    try {
      await verifyPlayerReportAccount(row.id);
      toast.success("Account verified");
      await loadReport(pagination.current_page, filters);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to verify account");
    } finally {
      setActingId("");
    }
  }

  async function handleStatusChange(
    row: (typeof rows)[number],
    status: number,
    label: string
  ) {
    const confirmed = window.confirm(`Are you sure you want to ${label.toLowerCase()} this account?`);
    if (!confirmed) return;

    setActingId(row.id);
    try {
      await updatePlayerReportStatus(row.id, status);
      toast.success("Player status updated");
      await loadReport(pagination.current_page, filters);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update player status");
    } finally {
      setActingId("");
    }
  }

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Registration Report" />

      <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="grid gap-4 md:grid-cols-[220px_1fr_1fr_auto]">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Period
            <select
              value={filters.period}
              onChange={(event) => {
                const period = event.target.value as RegistrationPeriod;
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
              value={formatDateTimeInput(filters.from)}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  period: "date_range",
                  from: event.target.value ? `${event.target.value.replace("T", " ")}:00` : "",
                }))
              }
              className="mt-2 h-10 w-full rounded-md border border-gray-300 px-3 text-sm text-gray-800 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            />
          </label>

          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            To
            <input
              type="datetime-local"
              value={formatDateTimeInput(filters.to)}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  period: "date_range",
                  to: event.target.value ? `${event.target.value.replace("T", " ")}:00` : "",
                }))
              }
              className="mt-2 h-10 w-full rounded-md border border-gray-300 px-3 text-sm text-gray-800 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            />
          </label>

          <div className="flex items-end">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Total Registered: {totalRegistered.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <FilterActions onSearch={() => void handleSearch()} onClear={() => void handleClear()} isLoading={loading} />
          <Button
            variant="outline"
            size="sm"
            disabled={!rows.length}
            startIcon={<Download className="h-4 w-4" />}
            onClick={() => downloadPlayerReportCsv("registration", rows, "registration_report.csv")}
          >
            Export CSV
          </Button>
        </div>
      </section>

      <PlayerReportTable
        variant="registration"
        rows={rows}
        loading={loading}
        actingId={actingId}
        pagination={pagination}
        onPageChange={(page) => void loadReport(page, filters)}
        onVerify={(row) => void handleVerify(row)}
        onStatusChange={(row, status, label) => void handleStatusChange(row, status, label)}
      />
    </div>
  );
}

export default withAuth(RegistrationReportClient);
