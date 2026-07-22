"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Calendar, Search, X } from "lucide-react";

import { POSTREQUEST } from "@/utils/base_request";

type Period =
  | "today"
  | "yesterday"
  | "current_week"
  | "last_week"
  | "current_month"
  | "last_month"
  | "last_30_days"
  | "date_range";

type ClientType = "" | "web" | "mobile" | "shop";

type FilterState = {
  period: Period;
  username: string;
  from: string;
  to: string;
  clientType: ClientType;
  ipAddress: string;
};

type LoginHistory = {
  id: string;
  loginTime: string;
  username: string;
  ipAddress: string;
  country: string;
  cookies: string;
  clientType: string;
  device: string;
  browserType: string;
  browserVersion: string;
  operatingSystem: string;
};

type Pagination = {
  total: number;
  per_page: number;
  from: number;
  to: number;
  current_page: number;
  last_page?: number;
};

const periodOptions: { value: Period; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "current_week", label: "Current Week" },
  { value: "last_week", label: "Last Week" },
  { value: "current_month", label: "Current Month" },
  { value: "last_month", label: "Last Month" },
  { value: "last_30_days", label: "Last 30 Days" },
  { value: "date_range", label: "Date Range" },
];

function defaultFilters(): FilterState {
  const today = new Date();
  return {
    period: "today",
    username: "",
    from: formatDateTime(startOfDay(today)),
    to: formatDateTime(endOfDay(today)),
    clientType: "",
    ipAddress: "",
  };
}

function rangeForPeriod(period: Period): Pick<FilterState, "from" | "to"> {
  const today = new Date();
  switch (period) {
    case "yesterday":
      return rangeForDate(addDays(today, -1));
    case "current_week":
      return {
        from: formatDateTime(startOfIsoWeek(today)),
        to: formatDateTime(endOfIsoWeek(today)),
      };
    case "last_week": {
      const lastWeek = addDays(today, -7);
      return {
        from: formatDateTime(startOfIsoWeek(lastWeek)),
        to: formatDateTime(endOfIsoWeek(lastWeek)),
      };
    }
    case "current_month":
      return {
        from: formatDateTime(startOfMonth(today)),
        to: formatDateTime(endOfMonth(today)),
      };
    case "last_month": {
      const lastMonth = addMonths(today, -1);
      return {
        from: formatDateTime(startOfMonth(lastMonth)),
        to: formatDateTime(endOfMonth(lastMonth)),
      };
    }
    case "last_30_days":
      return {
        from: formatDateTime(startOfDay(addDays(today, -30))),
        to: formatDateTime(endOfDay(today)),
      };
    case "today":
      return rangeForDate(today);
    case "date_range":
    default:
      return rangeForDate(today);
  }
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function formatDateTime(date: Date) {
  return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function endOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(23, 59, 59, 999);
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
  copy.setHours(23, 59, 59, 999);
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

function rangeForDate(date: Date) {
  return {
    from: formatDateTime(startOfDay(date)),
    to: formatDateTime(endOfDay(date)),
  };
}

function asRecord(value: unknown): Record<string, any> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, any>)
    : {};
}

function toNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function formatResultDate(value: unknown) {
  if (!value) return "-";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function mapRow(itemValue: unknown, index: number): LoginHistory {
  const item = asRecord(itemValue);
  return {
    id: String(item.id ?? item.username ?? item.login_ip ?? `login-${index}`),
    loginTime: formatResultDate(item.created_at ?? item.createdAt),
    username: String(item.username ?? "-"),
    ipAddress: String(item.login_ip ?? item.ip_address ?? item.ipAddress ?? "-"),
    country: String(item.country ?? "-"),
    cookies: String(item.cookies ?? "-"),
    clientType: String(item.client_type ?? item.clientType ?? "-"),
    device: String(item.device ?? "-"),
    browserType: String(item.browser_type ?? item.browserType ?? "-"),
    browserVersion: String(item.browser_version ?? item.browserVersion ?? "-"),
    operatingSystem: String(item.os ?? item.operatingSystem ?? "-"),
  };
}

function paginationFrom(dataValue: unknown, page: number, count: number): Pagination {
  const data = asRecord(dataValue);
  const perPage = toNumber(data.per_page ?? data.perPage, count || 10);
  const total = toNumber(data.total, count);
  const currentPage = toNumber(data.current_page ?? data.currentPage, page);

  return {
    total,
    per_page: perPage,
    from: toNumber(data.from, total ? (currentPage - 1) * perPage + 1 : 0),
    to: toNumber(data.to, Math.min(currentPage * perPage, total)),
    current_page: currentPage,
    last_page: toNumber(
      data.last_page ?? data.lastPage,
      perPage ? Math.max(1, Math.ceil(total / perPage)) : 1
    ),
  };
}

export default function LoginHistoryClient() {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [paging, setPaging] = useState(true);
  const [rows, setRows] = useState<LoginHistory[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    per_page: 10,
    from: 0,
    to: 0,
    current_page: 1,
  });
  const [loading, setLoading] = useState(false);

  function updatePeriod(period: Period) {
    setFilters((current) => ({ ...current, period, ...rangeForPeriod(period) }));
  }

  async function search(page = 1) {
    setLoading(true);
    const payload = {
      period: filters.period,
      username: filters.username,
      from: filters.from,
      to: filters.to,
      client_type: filters.clientType,
      ip_address: filters.ipAddress,
    };
    const response = await POSTREQUEST<any>(
      `/api/admin/reporting/login-history?page=${page}`,
      payload
    );
    setLoading(false);

    const body = asRecord(response.data);
    if (!response.ok || body.success === false) {
      toast.error(response.error || body.message || "An error occured");
      return;
    }

    const rawRows = Array.isArray(body.data)
      ? body.data
      : Array.isArray(body.histories)
        ? body.histories
        : [];
    const mappedRows = rawRows.map(mapRow);
    setRows(mappedRows);
    setPagination(paginationFrom(body, page, mappedRows.length));
  }

  function resetFilter() {
    setFilters(defaultFilters());
    setPaging(true);
    setRows([]);
    setPagination({ total: 0, per_page: 10, from: 0, to: 0, current_page: 1 });
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void search(1);
          }}
        >
          <div className="grid gap-3 md:grid-cols-3">
            <select
              value={filters.period}
              onChange={(event) => updatePeriod(event.target.value as Period)}
              className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              {periodOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <DateInput
              value={filters.from}
              onChange={(value) =>
                setFilters((current) => ({ ...current, from: value, period: "date_range" }))
              }
            />
            <DateInput
              value={filters.to}
              onChange={(value) =>
                setFilters((current) => ({ ...current, to: value, period: "date_range" }))
              }
            />
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <select
              value={filters.clientType}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  clientType: event.target.value as ClientType,
                }))
              }
              className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              <option value="">Client Type</option>
              <option value="web">Website</option>
              <option value="mobile">Mobile</option>
              <option value="shop">Shop</option>
            </select>
            <input
              value={filters.username}
              onChange={(event) =>
                setFilters((current) => ({ ...current, username: event.target.value }))
              }
              placeholder="Username"
              className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
            <input
              value={filters.ipAddress}
              onChange={(event) =>
                setFilters((current) => ({ ...current, ipAddress: event.target.value }))
              }
              placeholder="IP Address"
              className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>

          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-center">
            <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={paging}
                onChange={(event) => setPaging(event.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-brand-500"
              />
              Enable Paging
            </label>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-info-500 px-4 text-sm font-medium text-white hover:bg-info-600 disabled:opacity-60"
            >
              <Search size={16} />
              {loading ? "Searching" : "Search"}
            </button>
            <button
              type="button"
              onClick={resetFilter}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-gray-300 px-4 text-sm font-medium dark:border-gray-700"
            >
              <X size={16} />
              Clear all filters
            </button>
          </div>

          <div className="rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-600 dark:bg-white/[0.03] dark:text-gray-400">
            POST /api/admin/reporting/login-history?page={pagination.current_page}{" "}
            with period, from, to, client_type, username, and ip_address.
          </div>
        </form>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Results
          </h2>
          <span className="rounded-md border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600 dark:border-gray-800 dark:text-gray-300">
            Excel export
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                {[
                  "Login Time",
                  "Username",
                  "IP Address",
                  "Country",
                  "Cookies",
                  "Client Type",
                  "Device",
                  "Browser Type",
                  "Browser Version",
                  "Operating System",
                ].map((head) => (
                  <th
                    key={head}
                    className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300"
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">
                    {row.loginTime}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-brand-600 dark:text-brand-300">
                    <a href="#" onClick={(event) => event.preventDefault()}>
                      {row.username}
                    </a>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">
                    {row.ipAddress}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">
                    {row.country}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">
                    {row.cookies}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">
                    {row.clientType}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">
                    {row.device}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">
                    {row.browserType}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">
                    {row.browserVersion}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">
                    {row.operatingSystem}
                  </td>
                </tr>
              ))}
              {!rows.length ? (
                <tr>
                  <td
                    colSpan={10}
                    className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    {loading ? "Loading report" : "No record found"}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        {paging ? (
          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-gray-200 px-5 py-4 dark:border-gray-800">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Showing{" "}
              {pagination.total
                ? `${pagination.from} to ${pagination.to} of ${pagination.total}`
                : rows.length}{" "}
              entries
            </span>
            <button
              type="button"
              disabled={pagination.current_page <= 1 || loading}
              onClick={() => void search(pagination.current_page - 1)}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-40 dark:border-gray-700"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Page {pagination.current_page} of {pagination.last_page ?? 1}
            </span>
            <button
              type="button"
              disabled={pagination.current_page >= (pagination.last_page ?? 1) || loading}
              onClick={() => void search(pagination.current_page + 1)}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-40 dark:border-gray-700"
            >
              Next
            </button>
          </div>
        ) : null}
      </section>
    </div>
  );
}

function DateInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <label className="relative block">
      <Calendar
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        size={16}
      />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-md border border-gray-300 pl-9 pr-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
      />
    </label>
  );
}
