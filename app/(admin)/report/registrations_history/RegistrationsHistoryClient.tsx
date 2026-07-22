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

type GroupBy = "day" | "month" | "state" | "player" | "product" | "client_type";

type FilterState = {
  period: Period;
  state: string;
  productType: string;
  from: string;
  to: string;
  clientType: string;
  deposited: string;
  verified: string;
  groupBy: GroupBy;
};

type RegistrationRow = {
  id: string;
  playerId: string;
  username: string;
  date: string;
  month: string;
  state: string;
  productType: string;
  clientType: string;
  deposited: string;
  verified: string;
  count: number;
  registeredDeposited: number;
  firstDepositors: number;
  totalDeposit: number;
  turnover: number;
  winnings: number;
  awufBonus: number;
  bonus: number;
  total: number;
  average: number;
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

const groupOptions: { value: GroupBy; label: string }[] = [
  { value: "day", label: "Day" },
  { value: "month", label: "Month" },
  { value: "state", label: "State" },
  { value: "player", label: "Player" },
  { value: "product", label: "Product" },
  { value: "client_type", label: "Client Type" },
];

function defaultFilters(): FilterState {
  return {
    period: "today",
    state: "",
    productType: "",
    from: "22-07-2026 00:00:00",
    to: "22-07-2026 23:59:59",
    clientType: "",
    deposited: "",
    verified: "",
    groupBy: "day",
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

function groupLabel(row: RegistrationRow, groupBy: GroupBy) {
  switch (groupBy) {
    case "month":
      return row.month;
    case "state":
      return row.state;
    case "product":
      return row.productType;
    case "client_type":
      return row.clientType;
    case "day":
    default:
      return row.date;
  }
}

function asRecord(value: unknown): Record<string, any> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, any> : {};
}

function toNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function money(value: number) {
  return `NGN ${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function monthLabel(value: string) {
  if (!value) return "-";
  const monthNumber = Number(value);
  if (Number.isInteger(monthNumber) && monthNumber >= 1 && monthNumber <= 12) {
    return new Date(2026, monthNumber - 1, 1).toLocaleString("en", { month: "short" });
  }
  return value;
}

function calcGgr(row: RegistrationRow) {
  return row.turnover - row.winnings;
}

function calcNgr(row: RegistrationRow) {
  return row.turnover - row.winnings - row.awufBonus - row.bonus;
}

function margin(row: RegistrationRow) {
  return row.turnover > 0 ? (calcGgr(row) / row.turnover) * 100 : 0;
}

function mapRegistrationRow(itemValue: unknown, index: number): RegistrationRow {
  const item = asRecord(itemValue);
  const turnover = toNumber(item.turnover);
  const winnings = toNumber(item.winnings);
  const total = toNumber(item.total ?? item.noOfBets ?? item.total_bets);
  return {
    id: String(item.id ?? item.user_id ?? item.userId ?? item.playerId ?? item.username ?? `registration-${index}`),
    playerId: String(item.user_id ?? item.userId ?? item.playerId ?? item.id ?? ""),
    username: String(item.username ?? item.userName ?? "-"),
    date: String(item.date ?? item.day ?? "-"),
    month: String(item.month ?? "-"),
    state: String(item.state ?? "-"),
    productType: String(item.product_type ?? item.productType ?? "-"),
    clientType: String(item.channel ?? item.client_type ?? item.clientType ?? "-"),
    deposited: String(item.deposited ?? "-"),
    verified: String(item.verified ?? "-"),
    count: toNumber(item.total_registered ?? item.totalRegistered ?? item.registrations ?? item.count ?? item.total, 0),
    registeredDeposited: toNumber(item.registered_deposited ?? item.registeredDeposited),
    firstDepositors: toNumber(item.first_depositors ?? item.firstDepositors),
    totalDeposit: toNumber(item.total_deposit ?? item.totalDeposit),
    turnover,
    winnings,
    awufBonus: toNumber(item.awuf_bonus ?? item.awufBonus),
    bonus: toNumber(item.bonus),
    total,
    average: toNumber(item.average, total > 0 ? turnover / total : 0),
  };
}

function paginationFrom(data: unknown, page: number, count: number): Pagination {
  const payload = asRecord(data);
  const bets = asRecord(payload.bets);
  const pagination = Object.keys(bets).length ? bets : asRecord(payload.pagination);
  const perPage = toNumber(pagination.per_page ?? pagination.perPage, count || 10);
  const total = toNumber(pagination.total ?? payload.total ?? payload.count, count);
  const currentPage = toNumber(pagination.current_page ?? pagination.currentPage, page);

  return {
    total,
    per_page: perPage,
    from: toNumber(pagination.from, total ? (currentPage - 1) * perPage + 1 : 0),
    to: toNumber(pagination.to, Math.min(currentPage * perPage, total)),
    current_page: currentPage,
    last_page: toNumber(pagination.last_page ?? pagination.lastPage, perPage ? Math.max(1, Math.ceil(total / perPage)) : 1),
  };
}

export default function RegistrationsHistoryClient() {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [paging, setPaging] = useState(true);
  const [activeGroupBy, setActiveGroupBy] = useState<GroupBy>("day");
  const [rows, setRows] = useState<RegistrationRow[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, per_page: 10, from: 0, to: 0, current_page: 1 });
  const [loading, setLoading] = useState(false);

  function updatePeriod(period: Period) {
    setFilters((current) => ({ ...current, period, ...rangeForPeriod(period) }));
  }

  async function search(page = 1) {
    setLoading(true);
    const payload = {
      period: filters.period,
      state: filters.state,
      product_type: filters.productType,
      from: filters.from,
      to: filters.to,
      client_type: filters.clientType,
      deposited: filters.deposited,
      verified: filters.verified,
      group_by: filters.groupBy,
      paging,
    };
    const response = await POSTREQUEST<any>(`/api/admin/reporting/login-history?page=${page}`, payload);
    setLoading(false);

    const body = asRecord(response.data);
    if (!response.ok || body.success === false) {
      toast.error(response.error || body.message || "An error occured");
      return;
    }

    const rawRows = Array.isArray(body.data) ? body.data : Array.isArray(body.histories) ? body.histories : [];
    setRows(rawRows.map(mapRegistrationRow));
    setPagination(paginationFrom(body, page, rawRows.length));
    setActiveGroupBy(filters.groupBy);
  }

  function resetFilter() {
    setFilters(defaultFilters());
    setPaging(true);
    setActiveGroupBy("day");
    setRows([]);
    setPagination({ total: 0, per_page: 10, from: 0, to: 0, current_page: 1 });
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); void search(1); }}>
          <div className="grid gap-3 md:grid-cols-4">
            <select value={filters.period} onChange={(event) => updatePeriod(event.target.value as Period)} className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white">
              {periodOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            <DateInput value={filters.from} onChange={(value) => setFilters((current) => ({ ...current, from: value, period: "date_range" }))} />
            <DateInput value={filters.to} onChange={(value) => setFilters((current) => ({ ...current, to: value, period: "date_range" }))} />
            <select value={filters.state} onChange={(event) => setFilters((current) => ({ ...current, state: event.target.value }))} className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white">
              <option value="">State</option>
              <option value="Lagos">Lagos</option>
              <option value="Abuja">Abuja</option>
              <option value="Rivers">Rivers</option>
            </select>
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            <select value={filters.deposited} onChange={(event) => setFilters((current) => ({ ...current, deposited: event.target.value }))} className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white">
              <option value="">Deposited / Didn't Deposit</option>
              <option value="yes">Deposited</option>
              <option value="no">Didn't Deposit</option>
            </select>
            <select value={filters.productType} onChange={(event) => setFilters((current) => ({ ...current, productType: event.target.value }))} className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white">
              <option value="">Product Type</option>
              <option value="sports">Sports</option>
              <option value="casino">Casino</option>
              <option value="games">Games</option>
              <option value="Virtual">Virtual Sport</option>
            </select>
            <select value={filters.clientType} onChange={(event) => setFilters((current) => ({ ...current, clientType: event.target.value }))} className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white">
              <option value="">Client Type</option>
              <option value="website">Website</option>
              <option value="mobile">Mobile</option>
              <option value="cashier">Cashier</option>
            </select>
            <select value={filters.verified} onChange={(event) => setFilters((current) => ({ ...current, verified: event.target.value }))} className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white">
              <option value="">Email / Mobile Verification</option>
              <option value="email_verified">Email Verified</option>
              <option value="email_not_verified">Email Not Verified</option>
              <option value="mobile_verified">Mobile Phone Verified</option>
              <option value="mobile_not_verified">Mobile Phone Not Verified</option>
            </select>
          </div>

          <div className="space-y-3 rounded-md border border-gray-200 p-3 dark:border-gray-800">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Group By</div>
            <div className="flex flex-wrap gap-3">
              {groupOptions.map((option) => (
                <label key={option.value} className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <input
                    type="radio"
                    checked={filters.groupBy === option.value}
                    onChange={() => setFilters((current) => ({ ...current, groupBy: option.value }))}
                    className="h-4 w-4 border-gray-300 text-brand-500"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_auto_auto] md:items-center">
            <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <input type="checkbox" checked={paging} onChange={(event) => setPaging(event.target.checked)} className="h-4 w-4 rounded border-gray-300 text-brand-500" />
              Enable Paging
            </label>
            <button type="submit" disabled={loading} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-info-500 px-4 text-sm font-medium text-white hover:bg-info-600 disabled:opacity-60">
              <Search size={16} />
              {loading ? "Searching" : "Search"}
            </button>
            <button type="button" onClick={resetFilter} className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-gray-300 px-4 text-sm font-medium dark:border-gray-700">
              <X size={16} />
              Clear all filters
            </button>
            <div className="rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-600 dark:bg-white/[0.03] dark:text-gray-400">
              POST /api/admin/reporting/login-history?page={pagination.current_page}
            </div>
          </div>
        </form>
      </section>

      {activeGroupBy === "player" ? (
        <PlayerResults rows={rows} paging={paging} pagination={pagination} loading={loading} onPage={search} />
      ) : (
        <GroupedResults groupBy={activeGroupBy} rows={rows} paging={paging} pagination={pagination} loading={loading} onPage={search} />
      )}
    </div>
  );
}

function GroupedResults({
  groupBy,
  rows,
  paging,
  pagination,
  loading,
  onPage,
}: {
  groupBy: GroupBy;
  rows: RegistrationRow[];
  paging: boolean;
  pagination: Pagination;
  loading: boolean;
  onPage: (page: number) => Promise<void>;
}) {
  const totals = rows.reduce(
    (sum, row) => ({
      registrations: sum.registrations + row.count,
      registeredDeposited: sum.registeredDeposited + row.registeredDeposited,
      firstDepositors: sum.firstDepositors + row.firstDepositors,
      totalDeposit: sum.totalDeposit + row.totalDeposit,
      turnover: sum.turnover + row.turnover,
      ngr: sum.ngr + calcNgr(row),
      bonus: sum.bonus + row.bonus,
    }),
    { registrations: 0, registeredDeposited: 0, firstDepositors: 0, totalDeposit: 0, turnover: 0, ngr: 0, bonus: 0 },
  );

  return (
    <section className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">Results grouped by {groupBy.replace("_", " ")}</h2>
        <span className="rounded-md border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600 dark:border-gray-800 dark:text-gray-300">Excel export</span>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              {["Group", "Registrations", "Registered and Deposited", "First Depositors", "Conversion Ratio", "Total Deposit Amount", "Turnover", "NGR", "Bonus Spent"].map((head) => (
                <th key={head} className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{groupBy === "month" ? monthLabel(row.month) : groupLabel(row, groupBy)}</td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{row.count.toLocaleString()}</td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{row.registeredDeposited.toLocaleString()}</td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{row.firstDepositors.toLocaleString()}</td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">0%</td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{money(row.totalDeposit)}</td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{money(row.turnover)}</td>
                <td className={`px-4 py-3 ${calcNgr(row) < 0 ? "text-red-600 dark:text-red-400" : "text-gray-700 dark:text-gray-300"}`}>{money(calcNgr(row))}</td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{money(row.bonus)}</td>
              </tr>
            ))}
            {!rows.length ? <tr><td colSpan={9} className="px-4 py-8 text-center text-sm text-gray-500">{loading ? "Loading report" : "No record found"}</td></tr> : null}
          </tbody>
          <tfoot className="bg-gray-50 font-semibold dark:bg-gray-900">
            <tr>
              <td className="px-4 py-3 text-gray-700 dark:text-gray-300">Total</td>
              <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{totals.registrations.toLocaleString()}</td>
              <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{totals.registeredDeposited.toLocaleString()}</td>
              <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{totals.firstDepositors.toLocaleString()}</td>
              <td className="px-4 py-3 text-gray-700 dark:text-gray-300">0%</td>
              <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{money(totals.totalDeposit)}</td>
              <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{money(totals.turnover)}</td>
              <td className={`px-4 py-3 ${totals.ngr < 0 ? "text-red-600 dark:text-red-400" : "text-gray-700 dark:text-gray-300"}`}>{money(totals.ngr)}</td>
              <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{money(totals.bonus)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      {paging ? <PaginationSummary pagination={pagination} loading={loading} onPage={onPage} /> : null}
    </section>
  );
}

function PlayerResults({
  rows,
  paging,
  pagination,
  loading,
  onPage,
}: {
  rows: RegistrationRow[];
  paging: boolean;
  pagination: Pagination;
  loading: boolean;
  onPage: (page: number) => Promise<void>;
}) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">Player Registrations</h2>
        <span className="rounded-md border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600 dark:border-gray-800 dark:text-gray-300">Excel export</span>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              {["Username", "Total Deposit", "# of Bets", "Turnover", "Avg. Bet Amount", "GGR", "Margin (%)", "NGR", "Bonus Spent"].map((head) => (
                <th key={head} className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="whitespace-nowrap px-4 py-3"><Link href={`/player-management/player-info/${row.playerId}`} className="font-medium text-brand-600 dark:text-brand-300">{row.username}</Link></td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{row.totalDeposit ? money(row.totalDeposit) : "-"}</td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{row.total.toLocaleString()}</td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{money(row.turnover)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{money(row.average)}</td>
                <td className={`whitespace-nowrap px-4 py-3 ${calcGgr(row) < 0 ? "text-red-600 dark:text-red-400" : "text-gray-700 dark:text-gray-300"}`}>{money(calcGgr(row))}</td>
                <td className={`whitespace-nowrap px-4 py-3 ${calcGgr(row) < 0 ? "text-red-600 dark:text-red-400" : "text-gray-700 dark:text-gray-300"}`}>{margin(row).toFixed(2)}%</td>
                <td className={`whitespace-nowrap px-4 py-3 ${calcNgr(row) < 0 ? "text-red-600 dark:text-red-400" : "text-gray-700 dark:text-gray-300"}`}>{money(calcNgr(row))}</td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{money(row.bonus + row.awufBonus)}</td>
              </tr>
            ))}
            {!rows.length ? <tr><td colSpan={9} className="px-4 py-8 text-center text-sm text-gray-500">{loading ? "Loading report" : "No record found"}</td></tr> : null}
          </tbody>
        </table>
      </div>
      {paging ? <PaginationSummary pagination={pagination} loading={loading} onPage={onPage} /> : null}
    </section>
  );
}

function PaginationSummary({ pagination, loading, onPage }: { pagination: Pagination; loading: boolean; onPage: (page: number) => Promise<void> }) {
  const lastPage = pagination.last_page ?? Math.max(1, Math.ceil((pagination.total || 0) / (pagination.per_page || 1)));
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 px-5 py-4 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
      <span>Showing {pagination.total ? `${pagination.from} to ${pagination.to} of ${pagination.total}` : "0"} entries</span>
      <div className="flex gap-2">
        <button type="button" disabled={pagination.current_page <= 1 || loading} onClick={() => void onPage(pagination.current_page - 1)} className="h-8 rounded-md border border-gray-300 px-3 disabled:opacity-40 dark:border-gray-700">Prev</button>
        <button type="button" disabled={pagination.current_page >= lastPage || loading} onClick={() => void onPage(pagination.current_page + 1)} className="h-8 rounded-md border border-gray-300 px-3 disabled:opacity-40 dark:border-gray-700">Next</button>
      </div>
    </div>
  );
}

function DateInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <label className="relative block">
      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
      <input value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-full rounded-md border border-gray-300 pl-9 pr-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
    </label>
  );
}
