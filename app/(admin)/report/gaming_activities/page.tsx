"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { toast } from "sonner";
import { Calendar, Search, X } from "lucide-react";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Infotext } from "@/components/common/Info";
import { POSTREQUEST } from "@/utils/base_request";
import { withAuth } from "@/utils/withAuth";

type Period =
  | "today"
  | "yesterday"
  | "current_week"
  | "last_week"
  | "current_month"
  | "last_month"
  | "last_30_days"
  | "date_range";

type GroupBy =
  | "betType"
  | "sports"
  | "tournaments"
  | "markets"
  | "user_id"
  | "productType"
  | "day"
  | "month"
  | "source"
  | "eventType";

type FilterState = {
  period: Period;
  username: string;
  from: string;
  to: string;
  betType: string;
  eventType: string;
  displayType: "real" | "bonus";
  sport: string;
  league: string;
  market: string;
  state: string;
  productType: string;
  source: string;
  groupBy: GroupBy;
  clientID: string;
  ticketType: string | number;
};

type GamingActivityRow = {
  id: string;
  username: string;
  date: string;
  month: string;
  channel: string;
  eventType: string;
  betType: string;
  productType: string;
  sport: string;
  tournament: string;
  marketName: string;
  total: number;
  turnover: number;
  winnings: number;
  bonus: number;
  totalDeposit: number | null;
};

type Totals = {
  tickets: number;
  stake: number;
  winnings: number;
  deposit: number;
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
  { value: "betType", label: "Bet Type" },
  { value: "sports", label: "Sport" },
  { value: "tournaments", label: "League" },
  { value: "markets", label: "Market" },
  { value: "user_id", label: "Player" },
  { value: "productType", label: "Product" },
  { value: "day", label: "Day" },
  { value: "month", label: "Month" },
  { value: "source", label: "Client Type" },
  { value: "eventType", label: "Pre-Match/Live" },
];

function defaultFilters(): FilterState {
  const today = new Date();
  return {
    period: "today",
    username: "",
    from: formatDateTime(startOfDay(today)),
    to: formatDateTime(endOfDay(today)),
    betType: "",
    eventType: "",
    displayType: "real",
    sport: "",
    league: "",
    market: "",
    state: "",
    productType: "sports",
    source: "",
    groupBy: "day",
    clientID: process.env.NEXT_PUBLIC_CLIENT_ID ?? "",
    ticketType: 0,
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

function calcGgr(turnover: number, winnings: number) {
  return turnover - winnings;
}

function calcMargin(turnover: number, winnings: number) {
  if (!winnings) return "100%";
  return `${(((turnover - winnings) / turnover) * 100).toFixed(2)}%`;
}

function displayMonth(value: string) {
  const date = new Date(2026, Math.max(0, Number(value) - 1), 1);
  if (Number.isNaN(date.getTime())) return value || "-";
  return date.toLocaleString("en", { month: "short" });
}

function formatGroupDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value || "-";
  return date.toLocaleDateString("en", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function mapRow(itemValue: unknown, index: number): GamingActivityRow {
  const item = asRecord(itemValue);
  return {
    id: String(item.id ?? item.user_id ?? item.username ?? item.date ?? `gaming-${index}`),
    username: String(item.username ?? "-"),
    date: String(item.date ?? ""),
    month: String(item.month ?? ""),
    channel: String(item.channel ?? item.source ?? "-"),
    eventType: String(item.event_type ?? item.eventType ?? "-"),
    betType: String(item.bet_type ?? item.betType ?? "-"),
    productType: String(item.product_type ?? item.productType ?? "-"),
    sport: String(item.sport ?? item.sports ?? "-"),
    tournament: String(item.tournament ?? item.league ?? "-"),
    marketName: String(item.market_name ?? item.marketName ?? item.market ?? "-"),
    total: toNumber(item.total ?? item.totalTickets),
    turnover: toNumber(item.turnover ?? item.totalStake),
    winnings: toNumber(item.winnings ?? item.totalWinnings),
    bonus: toNumber(item.bonus),
    totalDeposit:
      item.total_deposit === undefined && item.totalDeposit === undefined
        ? null
        : toNumber(item.total_deposit ?? item.totalDeposit),
  };
}

function groupLabel(row: GamingActivityRow, groupBy: GroupBy) {
  switch (groupBy) {
    case "day":
      return formatGroupDate(row.date);
    case "month":
      return displayMonth(row.month);
    case "source":
      return row.channel;
    case "eventType":
      return row.eventType;
    case "betType":
      return row.betType;
    case "productType":
      return row.productType;
    case "sports":
      return row.sport;
    case "tournaments":
      return row.tournament;
    case "markets":
      return row.marketName;
    case "user_id":
      return row.username;
    default:
      return "-";
  }
}

function GamingActivities() {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [activeGroupBy, setActiveGroupBy] = useState<GroupBy>("day");
  const [paging, setPaging] = useState(true);
  const [rows, setRows] = useState<GamingActivityRow[]>([]);
  const [totals, setTotals] = useState<Totals>({
    tickets: 0,
    stake: 0,
    winnings: 0,
    deposit: 0,
  });
  const [loading, setLoading] = useState(false);

  function updatePeriod(period: Period) {
    setFilters((current) => ({ ...current, period, ...rangeForPeriod(period) }));
  }

  async function search(page = 1) {
    setLoading(true);
    const response = await POSTREQUEST<any>(
      `/bets/reporting/gaming-activity?page=${page}`,
      filters
    );
    setLoading(false);

    const body = asRecord(response.data);
    const data = asRecord(body.data ?? body);
    if (!response.ok || body.success === false || data.success === false) {
      toast.error(response.error || body.message || data.message || "An error occured");
      return;
    }

    const rawRows = Array.isArray(data.bets) ? data.bets : Array.isArray(data.data) ? data.data : [];
    const mappedRows = rawRows.map(mapRow);
    setRows(mappedRows);
    setTotals({
      tickets: toNumber(data.totalTickets, mappedRows.reduce((sum, row) => sum + row.total, 0)),
      stake: toNumber(data.totalStake, mappedRows.reduce((sum, row) => sum + row.turnover, 0)),
      winnings: toNumber(
        data.totalWinnings,
        mappedRows.reduce((sum, row) => sum + row.winnings, 0)
      ),
      deposit: toNumber(
        data.totalDeposit,
        mappedRows.reduce((sum, row) => sum + (row.totalDeposit ?? 0), 0)
      ),
    });
    setActiveGroupBy(filters.groupBy);
  }

  function resetFilter() {
    const defaults = defaultFilters();
    setFilters(defaults);
    setActiveGroupBy(defaults.groupBy);
    setPaging(true);
    setRows([]);
    setTotals({ tickets: 0, stake: 0, winnings: 0, deposit: 0 });
  }

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Gaming Activities" />
      <Infotext text="Review gaming activity by product, event, ticket, bet type, client type, user, sport, league, market, and grouping." />

      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void search(1);
          }}
        >
          <div className="grid gap-3 md:grid-cols-4">
            <SelectField
              value={filters.period}
              onChange={(value) => updatePeriod(value as Period)}
              options={periodOptions}
            />
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
            <SelectField
              value={filters.productType}
              onChange={(value) =>
                setFilters((current) => ({ ...current, productType: value }))
              }
              options={[
                { value: "", label: "Product Type" },
                { value: "sports", label: "Sports" },
                { value: "casino", label: "Casino" },
                { value: "games", label: "Games" },
                { value: "virtual", label: "Virtual Sport" },
              ]}
            />
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            <SelectField
              value={filters.eventType}
              onChange={(value) =>
                setFilters((current) => ({ ...current, eventType: value }))
              }
              options={[
                { value: "", label: "Pre Match/Live" },
                { value: "pre_match", label: "Pre-Match" },
                { value: "live", label: "Live" },
              ]}
            />
            <SelectField
              value={String(filters.ticketType)}
              onChange={(value) =>
                setFilters((current) => ({ ...current, ticketType: value }))
              }
              options={[
                { value: "", label: "Ticket Type" },
                { value: "0", label: "Real" },
                { value: "2", label: "Simulated" },
              ]}
            />
            <SelectField
              value={filters.betType}
              onChange={(value) =>
                setFilters((current) => ({ ...current, betType: value }))
              }
              options={[
                { value: "", label: "Bet Type" },
                { value: "single", label: "Single Bet" },
                { value: "multiple", label: "Combo Bet" },
              ]}
            />
            <SelectField
              value={filters.source}
              onChange={(value) =>
                setFilters((current) => ({ ...current, source: value }))
              }
              options={[
                { value: "", label: "Client Type" },
                { value: "website", label: "Website" },
                { value: "mobile", label: "Mobile" },
                { value: "cashier", label: "Cashier" },
              ]}
            />
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            <input
              value={filters.username}
              onChange={(event) =>
                setFilters((current) => ({ ...current, username: event.target.value }))
              }
              placeholder="Username"
              className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
            <SelectField
              value={filters.sport}
              onChange={(value) =>
                setFilters((current) => ({ ...current, sport: value }))
              }
              options={[{ value: "", label: "Sport" }]}
            />
            <SelectField
              value={filters.league}
              onChange={(value) =>
                setFilters((current) => ({ ...current, league: value }))
              }
              options={[{ value: "", label: "League" }]}
            />
            <SelectField
              value={filters.market}
              onChange={(value) =>
                setFilters((current) => ({ ...current, market: value }))
              }
              options={[{ value: "", label: "Market Type" }]}
            />
          </div>

          <RadioGroup
            label="Group By"
            value={filters.groupBy}
            options={groupOptions}
            onChange={(value) =>
              setFilters((current) => ({ ...current, groupBy: value as GroupBy }))
            }
          />

          <RadioGroup
            label="Display Type"
            value={filters.displayType}
            options={[
              { value: "real", label: "Real Money" },
              { value: "bonus", label: "Bonus Money" },
            ]}
            onChange={(value) =>
              setFilters((current) => ({
                ...current,
                displayType: value as FilterState["displayType"],
              }))
            }
          />

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
            POST /bets/reporting/gaming-activity?page=1 with Nuxt gaming
            activity filters and groupBy.
          </div>
        </form>
      </section>

      {activeGroupBy === "user_id" ? (
        <PlayerResults
          rows={rows}
          totals={totals}
          loading={loading}
          paging={paging}
        />
      ) : (
        <GroupedResults
          rows={rows}
          totals={totals}
          groupBy={activeGroupBy}
          loading={loading}
          paging={paging}
        />
      )}
    </div>
  );
}

function SelectField({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
    >
      {options.map((option) => (
        <option key={`${option.value}-${option.label}`} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
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

function RadioGroup({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <fieldset className="grid gap-3 rounded-md border border-gray-200 p-3 dark:border-gray-800 md:grid-cols-[8rem_minmax(0,1fr)] md:items-center">
      <legend className="px-1 text-sm font-medium text-gray-700 dark:text-gray-300 md:sr-only">
        {label}
      </legend>
      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </div>
      <div className="flex flex-wrap gap-3">
        {options.map((option) => (
          <label
            key={option.value}
            className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
          >
            <input
              type="radio"
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="h-4 w-4 border-gray-300 text-brand-500"
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function ResultSection({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          Results
        </h2>
        <span className="rounded-md border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600 dark:border-gray-800 dark:text-gray-300">
          Excel export
        </span>
      </div>
      <div className="overflow-x-auto">{children}</div>
    </section>
  );
}

function GroupedResults({
  rows,
  totals,
  groupBy,
  loading,
  paging,
}: {
  rows: GamingActivityRow[];
  totals: Totals;
  groupBy: GroupBy;
  loading: boolean;
  paging: boolean;
}) {
  return (
    <ResultSection>
      <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
        <thead className="bg-gray-50 dark:bg-gray-900">
          <tr>
            {["Group", "# of Bets", "Turnover", "Winnings", "GGR", "Margin (%)"].map((head) => (
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
              <td className="whitespace-nowrap px-4 py-3 font-medium text-brand-600 dark:text-brand-300">
                <a href="#" onClick={(event) => event.preventDefault()}>
                  {groupLabel(row, groupBy)}
                </a>
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">
                {row.total.toLocaleString()}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">
                {money(row.turnover)}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">
                {money(row.winnings)}
              </td>
              <td
                className={`whitespace-nowrap px-4 py-3 font-medium ${
                  calcGgr(row.turnover, row.winnings) < 0
                    ? "text-red-600 dark:text-red-300"
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                {money(calcGgr(row.turnover, row.winnings))}
              </td>
              <td
                className={`whitespace-nowrap px-4 py-3 font-medium ${
                  calcGgr(row.turnover, row.winnings) < 0
                    ? "text-red-600 dark:text-red-300"
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                {calcMargin(row.turnover, row.winnings)}
              </td>
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
            <td className="px-4 py-3 text-gray-900 dark:text-white">Total</td>
            <td className="px-4 py-3 text-gray-900 dark:text-white">{totals.tickets.toLocaleString()}</td>
            <td className="px-4 py-3 text-gray-900 dark:text-white">{money(totals.stake)}</td>
            <td className="px-4 py-3 text-gray-900 dark:text-white">{money(totals.winnings)}</td>
            <td className={`px-4 py-3 ${calcGgr(totals.stake, totals.winnings) < 0 ? "text-red-600 dark:text-red-300" : "text-gray-900 dark:text-white"}`}>
              {money(calcGgr(totals.stake, totals.winnings))}
            </td>
            <td className={`px-4 py-3 ${calcGgr(totals.stake, totals.winnings) < 0 ? "text-red-600 dark:text-red-300" : "text-gray-900 dark:text-white"}`}>
              {calcMargin(totals.stake, totals.winnings)}
            </td>
          </tr>
        </tfoot>
      </table>
      {paging ? <PagingNote rows={rows.length} /> : null}
    </ResultSection>
  );
}

function PlayerResults({
  rows,
  totals,
  loading,
  paging,
}: {
  rows: GamingActivityRow[];
  totals: Totals;
  loading: boolean;
  paging: boolean;
}) {
  return (
    <ResultSection>
      <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
        <thead className="bg-gray-50 dark:bg-gray-900">
          <tr>
            {[
              "Username",
              "Total Deposit",
              "# of Bets",
              "Turnover",
              "Winnings",
              "GGR",
              "Margin (%)",
              "NGR",
              "Bonus Spent",
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
          {rows.map((row) => {
            const ngr = row.turnover - row.winnings - row.bonus;
            return (
              <tr key={row.id}>
                <td className="whitespace-nowrap px-4 py-3 font-medium text-brand-600 dark:text-brand-300">
                  <a href="#" onClick={(event) => event.preventDefault()}>
                    {row.username}
                  </a>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">
                  {row.totalDeposit === null ? "-" : money(row.totalDeposit)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">
                  {row.total.toLocaleString()}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">
                  {money(row.turnover)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">
                  {money(row.winnings)}
                </td>
                <td className={`whitespace-nowrap px-4 py-3 font-medium ${calcGgr(row.turnover, row.winnings) < 0 ? "text-red-600 dark:text-red-300" : "text-gray-700 dark:text-gray-300"}`}>
                  {money(calcGgr(row.turnover, row.winnings))}
                </td>
                <td className={`whitespace-nowrap px-4 py-3 font-medium ${calcGgr(row.turnover, row.winnings) < 0 ? "text-red-600 dark:text-red-300" : "text-gray-700 dark:text-gray-300"}`}>
                  {calcMargin(row.turnover, row.winnings)}
                </td>
                <td className={`whitespace-nowrap px-4 py-3 font-medium ${ngr < 0 ? "text-red-600 dark:text-red-300" : "text-gray-700 dark:text-gray-300"}`}>
                  {money(ngr)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">
                  {money(row.bonus)}
                </td>
              </tr>
            );
          })}
          {!rows.length ? (
            <tr>
              <td colSpan={9} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                {loading ? "Loading report" : "No record found"}
              </td>
            </tr>
          ) : null}
        </tbody>
        <tfoot className="bg-gray-50 font-semibold dark:bg-gray-900">
          <tr>
            <td className="px-4 py-3 text-gray-900 dark:text-white">Total</td>
            <td className="px-4 py-3 text-gray-900 dark:text-white">{money(totals.deposit)}</td>
            <td className="px-4 py-3 text-gray-900 dark:text-white">{totals.tickets.toLocaleString()}</td>
            <td className="px-4 py-3 text-gray-900 dark:text-white">{money(totals.stake)}</td>
            <td className="px-4 py-3 text-gray-900 dark:text-white">{money(totals.winnings)}</td>
            <td className={`px-4 py-3 ${calcGgr(totals.stake, totals.winnings) < 0 ? "text-red-600 dark:text-red-300" : "text-gray-900 dark:text-white"}`}>
              {money(calcGgr(totals.stake, totals.winnings))}
            </td>
            <td className={`px-4 py-3 ${calcGgr(totals.stake, totals.winnings) < 0 ? "text-red-600 dark:text-red-300" : "text-gray-900 dark:text-white"}`}>
              {calcMargin(totals.stake, totals.winnings)}
            </td>
            <td className="px-4 py-3" />
            <td className="px-4 py-3" />
          </tr>
        </tfoot>
      </table>
      {paging ? <PagingNote rows={rows.length} /> : null}
    </ResultSection>
  );
}

function PagingNote({ rows }: { rows: number }) {
  return (
    <div className="border-t border-gray-200 px-5 py-4 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
      Showing {rows ? `1 to ${rows} of ${rows}` : "0"} entries
    </div>
  );
}

export default withAuth(GamingActivities);
