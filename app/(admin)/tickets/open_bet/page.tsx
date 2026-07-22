"use client";

import Link from "next/link";
import { Fragment, useState } from "react";
import { Ban, Check, ChevronDown, ChevronRight, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { TicketMetrics, TicketOpsShell, TicketSection } from "../components/TicketOpsShell";
import {
  asRecord,
  BetDetailsPanel,
  clientId,
  emptyPagination,
  formatDate,
  money,
  paginationFrom,
  rowValue,
  toNumber,
  type AnyRecord,
  type Pagination,
} from "../components/ticketApiHelpers";
import { GETREQUEST, POSTREQUEST } from "@/utils/base_request";

type Period =
  | "today"
  | "yesterday"
  | "current_week"
  | "last_week"
  | "current_month"
  | "last_month"
  | "last_30_days"
  | "date_range";

type OpenBetFilter = {
  period: Period;
  username: string;
  from: string;
  to: string;
  betType: string;
  eventType: string;
  sport: string;
  league: string;
  market: string;
  state: string;
  clientType: string;
  groupType: string;
  ticketType: string;
  amountRange: string;
  betslipId: string;
  status: number;
  paidStatus: string;
  clientId: string;
};

type OpenBet = {
  id: string;
  betslipId: string;
  betCategory: string;
  betCategoryDesc: string;
  eventType: string;
  created: string;
  userId: string;
  username: string;
  totalOdd: string;
  stake: number;
  possibleWin: number;
  sports: string;
  tournaments: string;
  events: string;
  markets: string;
  totalSelections: number;
  source: string;
  status: number | null;
  raw: AnyRecord;
};

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function apiDate(date: Date, endOfDay = false) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${
    endOfDay ? "23:59:59" : "00:00:00"
  }`;
}

function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function startOfIsoWeek(date: Date) {
  const copy = new Date(date);
  const day = copy.getDay() || 7;
  copy.setDate(copy.getDate() - day + 1);
  return copy;
}

function defaultFilter(): OpenBetFilter {
  const now = new Date();

  return {
    period: "today",
    username: "",
    from: apiDate(now),
    to: apiDate(now, true),
    betType: "",
    eventType: "",
    sport: "",
    league: "",
    market: "",
    state: "",
    clientType: "",
    groupType: "",
    ticketType: "0",
    amountRange: "",
    betslipId: "",
    status: 0,
    paidStatus: "",
    clientId: clientId(),
  };
}

function applyPeriod(filter: OpenBetFilter, period: Period): OpenBetFilter {
  const now = new Date();

  if (period === "date_range") return { ...filter, period };
  if (period === "yesterday") {
    const yesterday = addDays(now, -1);
    return { ...filter, period, from: apiDate(yesterday), to: apiDate(yesterday, true) };
  }
  if (period === "current_week") {
    const start = startOfIsoWeek(now);
    return { ...filter, period, from: apiDate(start), to: apiDate(addDays(start, 6), true) };
  }
  if (period === "last_week") {
    const start = addDays(startOfIsoWeek(now), -7);
    return { ...filter, period, from: apiDate(start), to: apiDate(addDays(start, 6), true) };
  }
  if (period === "current_month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { ...filter, period, from: apiDate(start), to: apiDate(end, true) };
  }
  if (period === "last_month") {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);
    return { ...filter, period, from: apiDate(start), to: apiDate(end, true) };
  }
  if (period === "last_30_days") {
    return { ...filter, period, from: apiDate(addDays(now, -30)), to: apiDate(now, true) };
  }

  return { ...filter, period, from: apiDate(now), to: apiDate(now, true) };
}

function mapOpenBet(value: unknown, index: number): OpenBet {
  const bet = asRecord(value);
  const betCategory = String(rowValue(bet, ["betCategory", "bet_category"]));

  return {
    id: String(rowValue(bet, ["id", "betId"], `open-${index}`)),
    betslipId: String(rowValue(bet, ["betslipId", "betslip_id"])),
    betCategory,
    betCategoryDesc: String(rowValue(bet, ["betCategoryDesc", "bet_type"], betCategory)),
    eventType: String(rowValue(bet, ["eventType", "event_type"])),
    created: formatDate(rowValue(bet, ["created", "created_at"])),
    userId: String(rowValue(bet, ["userId", "user_id"], "")),
    username: String(rowValue(bet, ["username"])),
    totalOdd: String(
      betCategory === "Combo"
        ? `${rowValue(bet, ["minOdds"])}/${toNumber(bet.total_odd ?? bet.totalOdd).toFixed(2)}`
        : rowValue(bet, ["totalOdd", "total_odd", "odds"])
    ),
    stake: toNumber(bet.stake),
    possibleWin: toNumber(bet.possibleWin ?? bet.pot_winnings ?? bet.winnings),
    sports: String(rowValue(bet, ["sports", "sport"])),
    tournaments: String(rowValue(bet, ["tournaments", "league"])),
    events: String(rowValue(bet, ["events", "event"])),
    markets: String(rowValue(bet, ["markets", "market"])),
    totalSelections: toNumber(bet.totalSelections ?? bet.selections_count),
    source: String(rowValue(bet, ["source", "channel"])),
    status: bet.status === undefined ? null : toNumber(bet.status),
    raw: bet,
  };
}

export default function OpenBetsPage() {
  const [filter, setFilter] = useState<OpenBetFilter>(() => defaultFilter());
  const [rows, setRows] = useState<OpenBet[]>([]);
  const [pagination, setPagination] = useState<Pagination>(emptyPagination);
  const [totalTickets, setTotalTickets] = useState(0);
  const [totalStake, setTotalStake] = useState(0);
  const [totalWinnings, setTotalWinnings] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function getResults(page = 1, nextFilter = filter) {
    setLoading(true);
    const response = await POSTREQUEST<any>(
      `/admin/bets/${clientId()}/tickets?page=${page}`,
      { ...nextFilter, clientId: clientId(), status: 0 }
    );
    setLoading(false);

    const body = asRecord(response.data);
    const data = asRecord(body.data);
    if (!response.ok || body.success === false) {
      toast.error(response.error || body.message || "An error occured");
      return;
    }

    const rawRows = Array.isArray(data.data)
      ? data.data
      : Array.isArray(body.data)
        ? body.data
        : [];
    const mappedRows = rawRows.map(mapOpenBet);
    const totals = asRecord(data.totals);

    setRows(mappedRows);
    setTotalTickets(toNumber(data.count, mappedRows.length));
    setTotalStake(toNumber(totals.totalStake));
    setTotalWinnings(toNumber(totals.totalWinnings));
    setPagination(
      paginationFrom(
        {
          total: data.count,
          per_page: 100,
          from: mappedRows.length ? (toNumber(data.currentPage, page) - 1) * 100 + 1 : 0,
          to: mappedRows.length ? (toNumber(data.currentPage, page) - 1) * 100 + mappedRows.length : 0,
          current_page: data.currentPage,
          last_page: data.lastPage,
        },
        page,
        mappedRows.length
      )
    );
  }

  async function updateTicket(id: string, status: "lost" | "void" | "won") {
    if (!window.confirm("Are you sure?")) return;

    setUpdatingId(id);
    const response = await POSTREQUEST<any>(`/bets/update-bet/${clientId()}`, {
      betId: id,
      status,
      entityType: "bet",
    });
    setUpdatingId(null);

    const body = asRecord(response.data);
    if (!response.ok || body.success === false) {
      toast.error(response.error || body.message || "An error occured");
      return;
    }

    toast.success(body.message || "Ticket updated");
    await getResults(pagination.current_page);
  }

  async function deleteTicket(id: string) {
    if (!window.confirm("You will not be able to recover this item")) return;

    setUpdatingId(id);
    const response = await GETREQUEST<any>(`api/admin/sport/delete/${id}`);
    setUpdatingId(null);

    const body = asRecord(response.data);
    if (!response.ok || body.success === false) {
      toast.error(response.error || body.message || "An error occured");
      return;
    }

    toast.success(body.message || "Item has been removed");
    setRows((current) => current.filter((row) => row.id !== id));
  }

  function updateFilter<K extends keyof OpenBetFilter>(key: K, value: OpenBetFilter[K]) {
    setFilter((current) => ({ ...current, [key]: value }));
  }

  function resetFilter() {
    const next = defaultFilter();
    setFilter(next);
    setRows([]);
    setPagination(emptyPagination);
    setTotalTickets(0);
    setTotalStake(0);
    setTotalWinnings(0);
  }

  return (
    <TicketOpsShell
      title="Open Bets"
      description="Search open sports tickets with the Nuxt filter contract, review totals, inspect selections, and settle, void, delete, or mark tickets as won."
    >
      <TicketMetrics
        metrics={[
          { label: "No. of Tickets", value: totalTickets.toLocaleString(), detail: "Current result set" },
          { label: "Amount Played", value: money(totalStake), detail: "Total stake" },
          { label: "Potential Winnings", value: money(totalWinnings), detail: "Total possible winnings" },
          { label: "Status", value: "Open", detail: "Backend status filter 0" },
        ]}
      />

      <TicketSection title="Filters">
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void getResults(1);
          }}
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <select
              value={filter.period}
              onChange={(event) => setFilter((current) => applyPeriod(current, event.target.value as Period))}
              className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="current_week">Current Week</option>
              <option value="last_week">Last Week</option>
              <option value="current_month">Current Month</option>
              <option value="last_month">Last Month</option>
              <option value="last_30_days">Last 30 Days</option>
              <option value="date_range">Date Range</option>
            </select>
            <input
              value={filter.from}
              onChange={(event) => updateFilter("from", event.target.value)}
              className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
            <input
              value={filter.to}
              onChange={(event) => updateFilter("to", event.target.value)}
              className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
            <select
              value={filter.clientType}
              onChange={(event) => updateFilter("clientType", event.target.value)}
              className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              <option value="">Client Type</option>
              <option value="website">Website</option>
              <option value="mobile">Mobile</option>
              <option value="cashier">Cashier</option>
            </select>
            <select
              value={filter.state}
              onChange={(event) => updateFilter("state", event.target.value)}
              className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              <option value="">State</option>
            </select>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <select
              value={filter.betType}
              onChange={(event) => updateFilter("betType", event.target.value)}
              className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              <option value="">Bet Type</option>
              <option value="Single">Single Bet</option>
              <option value="Multiple">Multiple Bet</option>
              <option value="Combo">System Bet</option>
              <option value="Split">Split Bet</option>
            </select>
            <select
              value={filter.eventType}
              onChange={(event) => updateFilter("eventType", event.target.value)}
              className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              <option value="">Pre Match/Live</option>
              <option value="pre">Pre-Match</option>
              <option value="live">Live</option>
            </select>
            <select
              value={filter.sport}
              onChange={(event) => updateFilter("sport", event.target.value)}
              className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              <option value="">Sport</option>
            </select>
            <select
              value={filter.league}
              onChange={(event) => updateFilter("league", event.target.value)}
              className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              <option value="">League</option>
            </select>
            <select
              value={filter.market}
              onChange={(event) => updateFilter("market", event.target.value)}
              className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              <option value="">Markets</option>
            </select>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <input
              value={filter.betslipId}
              onChange={(event) => updateFilter("betslipId", event.target.value)}
              placeholder="Betslip ID"
              className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
            <input
              value={filter.username}
              onChange={(event) => updateFilter("username", event.target.value)}
              placeholder="Username"
              className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
            <select
              value={filter.ticketType}
              onChange={(event) => updateFilter("ticketType", event.target.value)}
              className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              <option value="">Ticket Type</option>
              <option value="0">Real</option>
              <option value="2">Simulated</option>
            </select>
            <select
              value={filter.groupType}
              onChange={(event) => updateFilter("groupType", event.target.value)}
              className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              <option value="">Stake/Winnings</option>
              <option value="stake">Stake</option>
              <option value="pot_winnings">Winnings</option>
            </select>
            <input
              value={filter.amountRange}
              onChange={(event) => updateFilter("amountRange", event.target.value)}
              placeholder="=> 1000"
              className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input type="checkbox" className="h-4 w-4 rounded border-gray-300" />
              Enable Paging
            </label>
            <button
              type="submit"
              disabled={loading}
              className="h-10 rounded-md bg-brand-500 px-5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
            >
              Search
            </button>
            <button
              type="button"
              onClick={resetFilter}
              className="h-10 rounded-md border border-gray-300 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-900"
            >
              Clear all filters
            </button>
          </div>
        </form>
      </TicketSection>

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
                  "Odds",
                  "Stake",
                  "Potential Winnings",
                  "Sport",
                  "League",
                  "Event",
                  "Market",
                  "Selection",
                  "Client Type",
                  "",
                ].map((head) => (
                  <th key={head || "actions"} className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
              {rows.map((bet) => (
                <Fragment key={bet.id}>
                  <tr>
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-brand-600 dark:text-brand-300">
                      <button
                        type="button"
                        onClick={() => setExpandedId((current) => current === bet.id ? null : bet.id)}
                        className="inline-flex items-center gap-1"
                      >
                        {expandedId === bet.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        {bet.betslipId}
                      </button>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">
                      {bet.betCategoryDesc} ({bet.eventType === "pre" || bet.eventType === "prematch" ? "P" : "L"})
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{bet.created}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-brand-600 dark:text-brand-300">
                      {bet.userId ? (
                        <Link href={`/player-management/player-info/${bet.userId}`}>{bet.username}</Link>
                      ) : (
                        bet.username
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{bet.totalOdd}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{money(bet.stake)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{money(bet.possibleWin)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{bet.sports}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{bet.tournaments}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{bet.events}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{bet.markets}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{bet.totalSelections} Selection(s)</td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{bet.source}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => toast.info("Edit ticket modal parity is pending")}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-info-500 text-white hover:bg-info-600"
                          title="Edit ticket"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          disabled={updatingId === bet.id}
                          onClick={() => void deleteTicket(bet.id)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                          title="Delete ticket"
                        >
                          <Trash2 size={15} />
                        </button>
                        {bet.status !== 2 ? (
                          <button
                            type="button"
                            disabled={updatingId === bet.id}
                            onClick={() => void updateTicket(bet.id, "lost")}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                            title="Cancel ticket"
                          >
                            <X size={15} />
                          </button>
                        ) : null}
                        {bet.status !== 3 ? (
                          <button
                            type="button"
                            disabled={updatingId === bet.id}
                            onClick={() => void updateTicket(bet.id, "void")}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                            title="Void ticket"
                          >
                            <Ban size={15} />
                          </button>
                        ) : null}
                        {bet.status !== 1 ? (
                          <button
                            type="button"
                            disabled={updatingId === bet.id}
                            onClick={() => void updateTicket(bet.id, "won")}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                            title="Mark won"
                          >
                            <Check size={15} />
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                  {expandedId === bet.id ? (
                    <tr>
                      <td colSpan={14} className="bg-gray-50 px-4 py-4 dark:bg-gray-900">
                        <BetDetailsPanel bet={bet.raw} />
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              ))}
              {!rows.length ? (
                <tr>
                  <td colSpan={14} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    {loading ? "Loading open bets" : "No data"}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
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
            onClick={() => void getResults(pagination.current_page - 1)}
            className="rounded-md border border-gray-300 px-3 py-1.5 disabled:opacity-40 dark:border-gray-700"
          >
            Previous
          </button>
          <span>Page {pagination.current_page} of {pagination.last_page ?? 1}</span>
          <button
            type="button"
            disabled={pagination.current_page >= (pagination.last_page ?? 1) || loading}
            onClick={() => void getResults(pagination.current_page + 1)}
            className="rounded-md border border-gray-300 px-3 py-1.5 disabled:opacity-40 dark:border-gray-700"
          >
            Next
          </button>
        </div>
      </TicketSection>
    </TicketOpsShell>
  );
}
