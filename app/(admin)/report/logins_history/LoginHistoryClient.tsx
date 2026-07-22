"use client";

import { useMemo, useState } from "react";
import { Calendar, Search, X } from "lucide-react";

type Period =
  | "today"
  | "yesterday"
  | "current_week"
  | "last_week"
  | "current_month"
  | "last_month"
  | "last_30_days"
  | "date_range";

type FilterState = {
  period: Period;
  username: string;
  from: string;
  to: string;
  clientType: "" | "web" | "mobile" | "shop";
  ipAddress: string;
};

type LoginHistory = {
  id: string;
  loginTime: string;
  username: string;
  ipAddress: string;
  country: string;
  cookies: string;
  clientType: "web" | "mobile" | "shop";
  device: string;
  browserType: string;
  browserVersion: string;
  operatingSystem: string;
};

const loginRows: LoginHistory[] = [
  {
    id: "login-1001",
    loginTime: "22/07/2026 09:14:23",
    username: "admin@sbe",
    ipAddress: "102.88.12.7",
    country: "Nigeria",
    cookies: "Enabled",
    clientType: "web",
    device: "Desktop",
    browserType: "Chrome",
    browserVersion: "126.0.6478",
    operatingSystem: "macOS",
  },
  {
    id: "login-1002",
    loginTime: "22/07/2026 10:02:41",
    username: "risk@sbe",
    ipAddress: "41.190.3.4",
    country: "Nigeria",
    cookies: "Enabled",
    clientType: "web",
    device: "Desktop",
    browserType: "Edge",
    browserVersion: "126.0.2592",
    operatingSystem: "Windows",
  },
  {
    id: "login-1003",
    loginTime: "22/07/2026 10:45:08",
    username: "support.mobile",
    ipAddress: "197.210.45.9",
    country: "Ghana",
    cookies: "Disabled",
    clientType: "mobile",
    device: "Mobile",
    browserType: "Safari",
    browserVersion: "17.5",
    operatingSystem: "iOS",
  },
  {
    id: "login-1004",
    loginTime: "21/07/2026 18:25:12",
    username: "shop-lagos-12",
    ipAddress: "105.112.84.13",
    country: "Nigeria",
    cookies: "Enabled",
    clientType: "shop",
    device: "POS",
    browserType: "Chrome",
    browserVersion: "124.0.6367",
    operatingSystem: "Android",
  },
];

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
  return {
    period: "today",
    username: "",
    from: "22-07-2026 00:00:00",
    to: "22-07-2026 23:59:59",
    clientType: "",
    ipAddress: "",
  };
}

function rangeForPeriod(period: Period): Pick<FilterState, "from" | "to"> {
  switch (period) {
    case "yesterday":
      return { from: "21-07-2026 00:00:00", to: "21-07-2026 23:59:59" };
    case "current_week":
      return { from: "20-07-2026 00:00:00", to: "26-07-2026 23:59:59" };
    case "last_week":
      return { from: "13-07-2026 00:00:00", to: "19-07-2026 23:59:59" };
    case "current_month":
      return { from: "01-07-2026 00:00:00", to: "31-07-2026 23:59:59" };
    case "last_month":
      return { from: "01-06-2026 00:00:00", to: "30-06-2026 23:59:59" };
    case "last_30_days":
      return { from: "22-06-2026 00:00:00", to: "22-07-2026 23:59:59" };
    case "today":
    case "date_range":
    default:
      return { from: "22-07-2026 00:00:00", to: "22-07-2026 23:59:59" };
  }
}

export default function LoginHistoryClient() {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [paging, setPaging] = useState(true);

  const rows = useMemo(() => {
    const username = filters.username.trim().toLowerCase();
    const ipAddress = filters.ipAddress.trim();
    return loginRows.filter((row) => {
      const matchesUsername = !username || row.username.toLowerCase().includes(username);
      const matchesIp = !ipAddress || row.ipAddress.includes(ipAddress);
      const matchesClient = !filters.clientType || row.clientType === filters.clientType;
      return matchesUsername && matchesIp && matchesClient;
    });
  }, [filters.clientType, filters.ipAddress, filters.username]);

  function updatePeriod(period: Period) {
    setFilters((current) => ({ ...current, period, ...rangeForPeriod(period) }));
  }

  function resetFilter() {
    setFilters(defaultFilters());
    setPaging(true);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <form className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <select
              value={filters.period}
              onChange={(event) => updatePeriod(event.target.value as Period)}
              className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              {periodOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <DateInput value={filters.from} onChange={(value) => setFilters((current) => ({ ...current, from: value, period: "date_range" }))} />
            <DateInput value={filters.to} onChange={(value) => setFilters((current) => ({ ...current, to: value, period: "date_range" }))} />
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <select
              value={filters.clientType}
              onChange={(event) => setFilters((current) => ({ ...current, clientType: event.target.value as FilterState["clientType"] }))}
              className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              <option value="">Client Type</option>
              <option value="web">Website</option>
              <option value="mobile">Mobile</option>
              <option value="shop">Shop</option>
            </select>
            <input
              value={filters.username}
              onChange={(event) => setFilters((current) => ({ ...current, username: event.target.value }))}
              placeholder="Username"
              className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
            <input
              value={filters.ipAddress}
              onChange={(event) => setFilters((current) => ({ ...current, ipAddress: event.target.value }))}
              placeholder="IP Address"
              className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>

          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-center">
            <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <input type="checkbox" checked={paging} onChange={(event) => setPaging(event.target.checked)} className="h-4 w-4 rounded border-gray-300 text-brand-500" />
              Enable Paging
            </label>
            <button type="button" className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-info-500 px-4 text-sm font-medium text-white hover:bg-info-600">
              <Search size={16} />
              Search
            </button>
            <button type="button" onClick={resetFilter} className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-gray-300 px-4 text-sm font-medium dark:border-gray-700">
              <X size={16} />
              Clear all filters
            </button>
          </div>

          <div className="rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-600 dark:bg-white/[0.03] dark:text-gray-400">
            Users.getLoginHistory(filterData, page) with period, from, to, client_type, username, and ip_address.
          </div>
        </form>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Results</h2>
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
                  <th key={head} className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{row.loginTime}</td>
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-brand-600 dark:text-brand-300">{row.username}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{row.ipAddress}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{row.country}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{row.cookies}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{row.clientType}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{row.device}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{row.browserType}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{row.browserVersion}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{row.operatingSystem}</td>
                </tr>
              ))}
              {!rows.length ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    No record found
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        {paging ? (
          <div className="border-t border-gray-200 px-5 py-4 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
            Showing 1 to {rows.length} of {rows.length} entries
          </div>
        ) : null}
      </section>
    </div>
  );
}

function DateInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <label className="relative block">
      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-md border border-gray-300 pl-9 pr-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
      />
    </label>
  );
}
