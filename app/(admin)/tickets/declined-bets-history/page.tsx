"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Calendar, Search, X } from "lucide-react";

import { TicketOpsShell, TicketSection } from "../components/TicketOpsShell";
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

type FilterState = {
  period: Period;
  betslip_id: string;
  username: string;
  from: string;
  to: string;
};

type DeclinedBet = {
  id: string;
  betslipId: string;
  betType: string;
  createdAt: string;
  username: string;
  sportLimit: string;
  sport: string;
  tournament: string;
  event: string;
  eventDate: string;
  marketName: string;
  oddName: string;
  odd: string;
  stake: number;
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
    betslip_id: "",
    username: "",
    from: formatDateTime(startOfDay(today)),
    to: formatDateTime(endOfDay(today)),
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

function money(value: number) {
  return `NGN ${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function formatResultDate(value: unknown) {
  if (!value) return "-";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function formatUnixDate(value: unknown) {
  const seconds = toNumber(value, Number.NaN);
  if (!Number.isFinite(seconds)) return value ? String(value) : "-";
  const date = new Date(seconds * 1000);
  if (Number.isNaN(date.getTime())) return "-";
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function mapBet(value: unknown, index: number): DeclinedBet {
  const bet = asRecord(value);
  return {
    id: String(bet.id ?? bet.betslip_id ?? `declined-${index}`),
    betslipId: String(bet.betslip_id ?? bet.betslipId ?? "-"),
    betType: String(bet.bet_type ?? bet.betType ?? "-"),
    createdAt: formatResultDate(bet.created_at ?? bet.createdAt),
    username: String(bet.username ?? asRecord(bet.user).username ?? "-"),
    sportLimit: "100%",
    sport: String(bet.sport ?? "-"),
    tournament: String(bet.tournament ?? bet.league ?? "-"),
    event: String(bet.event ?? "-"),
    eventDate: formatUnixDate(bet.start_date ?? bet.startDate),
    marketName: String(bet.market_name ?? bet.marketName ?? "-"),
    oddName: String(bet.odd_name ?? bet.oddName ?? bet.selection ?? "-"),
    odd: String(bet.odd ?? bet.odds ?? "-"),
    stake: toNumber(bet.stake),
  };
}

function paginationFrom(value: unknown, page: number, count: number): Pagination {
  const data = asRecord(value);
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

export default function DeclinedBetsHistoryPage() {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [paging, setPaging] = useState(true);
  const [rows, setRows] = useState<DeclinedBet[]>([]);
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
    const response = await POSTREQUEST<any>(
      `api/admin/sport/get-declined-bets?page=${page}`,
      filters
    );
    setLoading(false);

    const body = asRecord(response.data);
    const bets = asRecord(body.bets);
    if (!response.ok || body.success === false) {
      toast.error(response.error || body.message || "An error occured");
      return;
    }

    const rawRows = Array.isArray(bets.data)
      ? bets.data
      : Array.isArray(body.data)
        ? body.data
        : [];
    const mappedRows = rawRows.map(mapBet);
    setRows(mappedRows);
    setPagination(paginationFrom(bets, page, mappedRows.length));
  }

  function resetFilter() {
    setFilters(defaultFilters());
    setPaging(true);
    setRows([]);
    setPagination({ total: 0, per_page: 10, from: 0, to: 0, current_page: 1 });
  }

  return (
    <TicketOpsShell
      title="Declined Bets History"
      description="Review declined bet slips and the market context that caused each rejection."
    >
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void search(1);
          }}
        >
          <div className="grid gap-3 md:grid-cols-5">
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
            <input
              value={filters.betslip_id}
              onChange={(event) =>
                setFilters((current) => ({ ...current, betslip_id: event.target.value }))
              }
              placeholder="Betslip ID"
              className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
            <input
              value={filters.username}
              onChange={(event) =>
                setFilters((current) => ({ ...current, username: event.target.value }))
              }
              placeholder="Username"
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
            POST api/admin/sport/get-declined-bets?page={pagination.current_page}{" "}
            with period, from, to, betslip_id, and username.
          </div>
        </form>
      </section>

      <TicketSection title="Results">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                {[
                  "Betslip ID",
                  "Bet Type",
                  "Placed on",
                  "By",
                  "Sports Limit",
                  "Sport",
                  "League",
                  "Event",
                  "Event Date",
                  "Market",
                  "Selection",
                  "Odds",
                  "Stake",
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
              {rows.map((bet) => (
                <tr key={bet.id}>
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-brand-600 dark:text-brand-300">
                    <a href="#" onClick={(event) => event.preventDefault()}>
                      {bet.betslipId}
                    </a>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{bet.betType}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{bet.createdAt}</td>
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-brand-600 dark:text-brand-300">
                    <a href="#" onClick={(event) => event.preventDefault()}>
                      {bet.username}
                    </a>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{bet.sportLimit}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{bet.sport}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{bet.tournament}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{bet.event}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{bet.eventDate}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{bet.marketName}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{bet.oddName}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{bet.odd}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{money(bet.stake)}</td>
                </tr>
              ))}
              {!rows.length ? (
                <tr>
                  <td
                    colSpan={13}
                    className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    {loading ? "Loading declined bets" : "No record found"}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        {paging ? (
          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-gray-200 px-5 py-4 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
            <span>
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
              className="rounded-md border border-gray-300 px-3 py-1.5 disabled:opacity-40 dark:border-gray-700"
            >
              Previous
            </button>
            <span>Page {pagination.current_page} of {pagination.last_page ?? 1}</span>
            <button
              type="button"
              disabled={pagination.current_page >= (pagination.last_page ?? 1) || loading}
              onClick={() => void search(pagination.current_page + 1)}
              className="rounded-md border border-gray-300 px-3 py-1.5 disabled:opacity-40 dark:border-gray-700"
            >
              Next
            </button>
          </div>
        ) : null}
      </TicketSection>
    </TicketOpsShell>
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
