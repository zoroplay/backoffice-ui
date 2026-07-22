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

type Product = "sports" | "casino" | "games" | "virtual";

type FilterState = {
  period: Period;
  from: string;
  to: string;
  product: Product;
};

type OnlineSaleRow = {
  id: string;
  userId: string;
  username: string;
  noOfBets: number;
  turnover: number;
  winnings: number;
  ggr: number;
  margin: number;
};

type Totals = {
  bets: number;
  turnover: number;
  winnings: number;
  ggr: number;
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
    product: "sports",
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

function toApiDate(value: string) {
  const [date] = value.split(" ");
  const [day, month, year] = date.split("-");
  return year && month && day ? `${year}-${month}-${day}` : "";
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

function mapRow(itemValue: unknown, index: number): OnlineSaleRow {
  const item = asRecord(itemValue);
  const turnover = toNumber(item.turnover ?? item.totalStake);
  const winnings = toNumber(item.winnings ?? item.totalWinnings);
  const ggr = toNumber(item.ggr, turnover - winnings);
  const marginValue =
    item.margin !== undefined && item.margin !== null && item.margin !== ""
      ? toNumber(item.margin)
      : turnover > 0
        ? (ggr / turnover) * 100
        : 0;

  return {
    id: String(item.id ?? item.userId ?? item.playerId ?? item.username ?? `online-sale-${index}`),
    userId: String(item.userId ?? item.playerId ?? item.id ?? ""),
    username: String(item.username ?? item.userName ?? "-"),
    noOfBets: toNumber(item.noOfBets ?? item.totalBets ?? item.betCount),
    turnover,
    winnings,
    ggr,
    margin: marginValue,
  };
}

export default function OnlineSalesClient() {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [paging, setPaging] = useState(true);
  const [rows, setRows] = useState<OnlineSaleRow[]>([]);
  const [totals, setTotals] = useState<Totals>({ bets: 0, turnover: 0, winnings: 0, ggr: 0 });
  const [loading, setLoading] = useState(false);

  const totalMargin = totals.turnover > 0 ? (totals.ggr / totals.turnover) * 100 : 0;

  function updatePeriod(period: Period) {
    setFilters((current) => ({ ...current, period, ...rangeForPeriod(period) }));
  }

  async function search() {
    setLoading(true);
    const payload = {
      from: toApiDate(filters.from),
      to: toApiDate(filters.to),
      product: filters.product || "sports",
    };
    const response = await POSTREQUEST<any>("/admin/players/online-sales-report", payload);
    setLoading(false);

    const body = asRecord(response.data);
    const responseData = body.data && typeof body.data === "object" && !Array.isArray(body.data) ? body.data : body;

    if (!response.ok || body.success === false) {
      toast.error(response.error || body.message || "An error occured");
      return;
    }

    const resultRows = Array.isArray(responseData.data) ? responseData.data : Array.isArray(body.data) ? body.data : [];
    const total = asRecord(responseData.total);
    const mapped = resultRows.map(mapRow);

    setRows(mapped);
    setTotals({
      bets: toNumber(total.noOfBets, mapped.reduce((sum, row) => sum + row.noOfBets, 0)),
      turnover: toNumber(total.totalStake, mapped.reduce((sum, row) => sum + row.turnover, 0)),
      winnings: toNumber(total.totalWinnings, mapped.reduce((sum, row) => sum + row.winnings, 0)),
      ggr: toNumber(total.ggr, mapped.reduce((sum, row) => sum + row.ggr, 0)),
    });
  }

  function resetFilter() {
    setFilters(defaultFilters());
    setPaging(true);
    setRows([]);
    setTotals({ bets: 0, turnover: 0, winnings: 0, ggr: 0 });
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); void search(); }}>
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
              value={filters.product}
              onChange={(event) => setFilters((current) => ({ ...current, product: event.target.value as Product }))}
              className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              <option value="sports">Sports</option>
              <option value="casino">Casino</option>
              <option value="games">Games</option>
              <option value="virtual">Virtual Sport</option>
            </select>
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
              POST /admin/players/online-sales-report {`{ from: "${toApiDate(filters.from)}", to: "${toApiDate(filters.to)}", product: "${filters.product}" }`}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            <Metric label="# of Bets" value={totals.bets.toLocaleString()} />
            <Metric label="Turnover" value={money(totals.turnover)} />
            <Metric label="Winnings" value={money(totals.winnings)} />
            <Metric label="GGR" value={money(totals.ggr)} danger={totals.ggr < 0} />
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
                {["Name", "# of Bets", "Turnover", "Winnings", "GGR", "Margin (%)"].map((head) => (
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
                    <span className="mr-2 text-gray-400">&gt;</span>
                    <Link href={`/network/agent/${row.userId}`} className="font-medium text-brand-600 dark:text-brand-300">
                      {row.username}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{row.noOfBets.toLocaleString()}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{money(row.turnover)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{money(row.winnings)}</td>
                  <td className={`whitespace-nowrap px-4 py-3 ${row.ggr < 0 ? "text-red-600 dark:text-red-400" : "text-gray-700 dark:text-gray-300"}`}>
                    {money(row.ggr)}
                  </td>
                  <td className={`whitespace-nowrap px-4 py-3 ${row.ggr < 0 ? "text-red-600 dark:text-red-400" : "text-gray-700 dark:text-gray-300"}`}>
                    {row.margin.toFixed(2)}%
                  </td>
                </tr>
              ))}
              {!rows.length ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                    {loading ? "Loading report" : "No record found"}
                  </td>
                </tr>
              ) : null}
            </tbody>
            <tfoot className="bg-gray-50 font-semibold dark:bg-gray-900">
              <tr>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">Total</td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{totals.bets.toLocaleString()}</td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{money(totals.turnover)}</td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{money(totals.winnings)}</td>
                <td className={`px-4 py-3 ${totals.ggr < 0 ? "text-red-600 dark:text-red-400" : "text-gray-700 dark:text-gray-300"}`}>{money(totals.ggr)}</td>
                <td className={`px-4 py-3 ${totals.ggr < 0 ? "text-red-600 dark:text-red-400" : "text-gray-700 dark:text-gray-300"}`}>{totalMargin.toFixed(2)}%</td>
              </tr>
            </tfoot>
          </table>
        </div>
        {paging ? <div className="border-t border-gray-200 px-5 py-4 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">Showing {rows.length} rows</div> : null}
      </section>
    </div>
  );
}

function Metric({ label, value, danger = false }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className="rounded-md border border-gray-200 p-3 dark:border-gray-800">
      <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">{label}</p>
      <p className={`mt-1 text-lg font-semibold ${danger ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-white"}`}>{value}</p>
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
