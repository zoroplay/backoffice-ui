"use client";

import Link from "next/link";
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
  clientType: string;
  noOfBets: number;
  winnings: number;
  payouts: number;
  balance: number;
  previousBalance: number;
};

type Totals = {
  tickets: number;
  winnings: number;
  payouts: number;
  balance: number;
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

function asRecord(value: unknown): Record<string, any> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, any> : {};
}

function toNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function mapRow(itemValue: unknown, index: number): PayoutReportRow {
  const item = asRecord(itemValue);
  return {
    id: String(item.id ?? item.agent_id ?? item.agentId ?? item.username ?? `payout-${index}`),
    agentId: String(item.agent_id ?? item.agentId ?? item.user_id ?? item.userId ?? item.id ?? ""),
    username: String(item.username ?? item.agentUserName ?? item.agentName ?? "-"),
    clientType: String(item.client_type ?? item.clientType ?? item.channel ?? "-"),
    noOfBets: toNumber(item.no_of_bets ?? item.noOfBets ?? item.totalBets),
    winnings: toNumber(item.winnings ?? item.totalWinnings),
    payouts: toNumber(item.payouts ?? item.totalPayouts),
    balance: toNumber(item.balance),
    previousBalance: toNumber(item.previous_balance ?? item.previousBalance ?? item.balance),
  };
}

function paginationFrom(data: unknown, page: number, count: number): Pagination {
  const payload = asRecord(data);
  const bets = asRecord(payload.bets);
  const perPage = toNumber(bets.per_page ?? bets.perPage ?? payload.per_page ?? payload.perPage, count || 10);
  const total = toNumber(bets.total ?? payload.total ?? payload.count, count);
  const currentPage = toNumber(bets.current_page ?? bets.currentPage ?? payload.current_page ?? payload.currentPage, page);

  return {
    total,
    per_page: perPage,
    from: toNumber(bets.from ?? payload.from, total ? (currentPage - 1) * perPage + 1 : 0),
    to: toNumber(bets.to ?? payload.to, Math.min(currentPage * perPage, total)),
    current_page: currentPage,
    last_page: toNumber(bets.last_page ?? bets.lastPage ?? payload.last_page ?? payload.lastPage, perPage ? Math.max(1, Math.ceil(total / perPage)) : 1),
  };
}

export default function PayoutTransactionsClient() {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [changedOnly, setChangedOnly] = useState(false);
  const [paging, setPaging] = useState(true);
  const [rows, setRows] = useState<PayoutReportRow[]>([]);
  const [totals, setTotals] = useState<Totals>({ tickets: 0, winnings: 0, payouts: 0, balance: 0 });
  const [pagination, setPagination] = useState<Pagination>({ total: 0, per_page: 10, from: 0, to: 0, current_page: 1 });
  const [loading, setLoading] = useState(false);

  function updatePeriod(period: Period) {
    setFilters((current) => ({ ...current, period, ...rangeForPeriod(period) }));
  }

  async function search(page = 1) {
    setLoading(true);
    const payload = {
      period: filters.period,
      from: filters.from,
      to: filters.to,
      client_type: filters.clientType,
      changed_balances: changedOnly,
      paging,
    };
    const response = await POSTREQUEST<any>(`api/admin/reporting/payout-report?page=${page}`, payload);
    setLoading(false);

    const body = asRecord(response.data);
    if (!response.ok || body.success === false) {
      toast.error(response.error || body.message || "An error occured");
      return;
    }

    const results = asRecord(body.results);
    const rawRows = Array.isArray(results.data) ? results.data : Array.isArray(body.data) ? body.data : [];
    const mapped = rawRows.map(mapRow);
    const visibleRows = changedOnly ? mapped.filter((row) => row.balance !== row.previousBalance) : mapped;

    setRows(visibleRows);
    setTotals({
      tickets: toNumber(body.totalTicket, visibleRows.reduce((sum, row) => sum + row.noOfBets, 0)),
      winnings: toNumber(body.totalWinnings, visibleRows.reduce((sum, row) => sum + row.winnings, 0)),
      payouts: toNumber(body.totalPayouts, visibleRows.reduce((sum, row) => sum + row.payouts, 0)),
      balance: toNumber(body.totalBalance, visibleRows.reduce((sum, row) => sum + row.balance, 0)),
    });
    setPagination(paginationFrom(body, page, visibleRows.length));
  }

  function resetFilter() {
    setFilters(defaultFilters());
    setChangedOnly(false);
    setPaging(true);
    setRows([]);
    setTotals({ tickets: 0, winnings: 0, payouts: 0, balance: 0 });
    setPagination({ total: 0, per_page: 10, from: 0, to: 0, current_page: 1 });
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); void search(1); }}>
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
            <button type="submit" disabled={loading} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-info-500 px-4 text-sm font-medium text-white hover:bg-info-600 disabled:opacity-60">
              <Search size={16} />
              {loading ? "Searching" : "Search"}
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
            POST api/admin/reporting/payout-report?page={pagination.current_page} with period, from, to, client_type, changed balances, and paging.
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
                    {loading ? "Loading report" : "No record found"}
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
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 px-5 py-4 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
            <span>Showing {pagination.total ? `${pagination.from} to ${pagination.to} of ${pagination.total}` : rows.length} entries</span>
            <div className="flex gap-2">
              <button type="button" disabled={pagination.current_page <= 1 || loading} onClick={() => void search(pagination.current_page - 1)} className="h-8 rounded-md border border-gray-300 px-3 disabled:opacity-40 dark:border-gray-700">Prev</button>
              <button type="button" disabled={pagination.current_page >= (pagination.last_page ?? 1) || loading} onClick={() => void search(pagination.current_page + 1)} className="h-8 rounded-md border border-gray-300 px-3 disabled:opacity-40 dark:border-gray-700">Next</button>
            </div>
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
