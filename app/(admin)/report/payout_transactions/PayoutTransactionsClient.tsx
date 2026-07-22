"use client";

import Link from "next/link";
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

type ClientType = "" | "website" | "mobile" | "cashier";

type FilterState = {
  period: Period;
  from: string;
  to: string;
  clientType: ClientType;
};

type PayoutReportRow = {
  id: string;
  agentId: string;
  username: string;
  clientType: Exclude<ClientType, "">;
  noOfBets: number;
  winnings: number;
  payouts: number;
  balance: number;
  previousBalance: number;
};

const payoutRows: PayoutReportRow[] = [
  {
    id: "payout-1001",
    agentId: "1",
    username: "SPA-NG-1001",
    clientType: "website",
    noOfBets: 84,
    winnings: 1250000,
    payouts: 920000,
    balance: 330000,
    previousBalance: 280000,
  },
  {
    id: "payout-1002",
    agentId: "8",
    username: "agent-lagos-01",
    clientType: "cashier",
    noOfBets: 43,
    winnings: 640000,
    payouts: 415000,
    balance: 225000,
    previousBalance: 225000,
  },
  {
    id: "payout-1003",
    agentId: "11",
    username: "shop-lagos-12",
    clientType: "cashier",
    noOfBets: 28,
    winnings: 360000,
    payouts: 220000,
    balance: 140000,
    previousBalance: 102000,
  },
  {
    id: "payout-1004",
    agentId: "12",
    username: "webaffiliate-001",
    clientType: "mobile",
    noOfBets: 19,
    winnings: 175000,
    payouts: 175000,
    balance: 0,
    previousBalance: 0,
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
    from: "22-07-2026 00:00:00",
    to: "22-07-2026 23:59:59",
    clientType: "",
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

function money(value: number) {
  return `NGN ${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

export default function PayoutTransactionsClient() {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [changedOnly, setChangedOnly] = useState(false);
  const [paging, setPaging] = useState(true);

  const rows = useMemo(
    () =>
      payoutRows.filter((row) => {
        const matchesClient = !filters.clientType || row.clientType === filters.clientType;
        const matchesChanged = !changedOnly || row.balance !== row.previousBalance;
        return matchesClient && matchesChanged;
      }),
    [changedOnly, filters.clientType],
  );

  const totals = rows.reduce(
    (sum, row) => ({
      tickets: sum.tickets + row.noOfBets,
      winnings: sum.winnings + row.winnings,
      payouts: sum.payouts + row.payouts,
      balance: sum.balance + row.balance,
    }),
    { tickets: 0, winnings: 0, payouts: 0, balance: 0 },
  );

  function updatePeriod(period: Period) {
    setFilters((current) => ({ ...current, period, ...rangeForPeriod(period) }));
  }

  function resetFilter() {
    setFilters(defaultFilters());
    setChangedOnly(false);
    setPaging(true);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <form className="space-y-4">
          <div className="grid gap-3 md:grid-cols-4">
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
            <DateInput value={filters.from} onChange={(value) => setFilters((current) => ({ ...current, from: value, period: "date_range" }))} />
            <DateInput value={filters.to} onChange={(value) => setFilters((current) => ({ ...current, to: value, period: "date_range" }))} />
            <select
              value={filters.clientType}
              onChange={(event) => setFilters((current) => ({ ...current, clientType: event.target.value as ClientType }))}
              className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              <option value="">Client Type</option>
              <option value="website">Website</option>
              <option value="mobile">Mobile</option>
              <option value="cashier">Cashier</option>
            </select>
          </div>

          <div className="grid gap-3 md:grid-cols-[auto_auto_minmax(0,1fr)_auto_auto] md:items-center">
            <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <input type="checkbox" checked={changedOnly} onChange={(event) => setChangedOnly(event.target.checked)} className="h-4 w-4 rounded border-gray-300 text-brand-500" />
              Show only changed balances
            </label>
            <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <input type="checkbox" checked={paging} onChange={(event) => setPaging(event.target.checked)} className="h-4 w-4 rounded border-gray-300 text-brand-500" />
              Enable Paging
            </label>
            <div />
            <button type="button" className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-info-500 px-4 text-sm font-medium text-white hover:bg-info-600">
              <Search size={16} />
              Search
            </button>
            <button type="button" onClick={resetFilter} className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-gray-300 px-4 text-sm font-medium dark:border-gray-700">
              <X size={16} />
              Clear all filters
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            <Metric label="No of Bets" value={totals.tickets.toLocaleString()} />
            <Metric label="Total Winning" value={money(totals.winnings)} />
            <Metric label="Total Payout" value={money(totals.payouts)} />
            <Metric label="Pending Payout" value={money(totals.winnings - totals.payouts)} />
          </div>

          <div className="rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-600 dark:bg-white/[0.03] dark:text-gray-400">
            Reports.getPayoutReports(filterData, page) with period, from, to, client_type, changed balances, and paging.
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
                {["Username", "No of Bets", "Total Winning", "Total Payout", "Pending Payout", "Available Balance"].map((head) => (
                  <th key={head} className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="whitespace-nowrap px-4 py-3">
                    <Link href={`/network/agent/${row.agentId}`} className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-300">
                      {row.username}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{row.noOfBets.toLocaleString()}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{money(row.winnings)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{money(row.payouts)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{money(row.winnings - row.payouts)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{money(row.balance)}</td>
                </tr>
              ))}
              {!rows.length ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    No record found
                  </td>
                </tr>
              ) : null}
            </tbody>
            <tfoot className="bg-gray-50 font-semibold dark:bg-gray-900">
              <tr>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">Total</td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{totals.tickets.toLocaleString()}</td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{money(totals.winnings)}</td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{money(totals.payouts)}</td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{money(totals.winnings - totals.payouts)}</td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{money(totals.balance)}</td>
              </tr>
            </tfoot>
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

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-gray-50 px-3 py-2 dark:bg-white/[0.03]">
      <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
      <div className="font-semibold text-gray-900 dark:text-white">{value}</div>
    </div>
  );
}
