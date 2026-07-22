"use client";

import Link from "next/link";
import { Fragment, useState } from "react";
import { ChevronDown, ChevronRight, Search } from "lucide-react";
import { toast } from "sonner";

import type { Agency } from "@/app/(admin)/network/agency-list/columns";
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
} from "@/app/(admin)/tickets/components/ticketApiHelpers";
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

type AgentOpenBetFilter = {
  period: Period;
  username: string;
  from: string;
  to: string;
  bet_type: string;
  event_type: string;
  sport: string;
  league: string;
  market: string;
  group_type: string;
  amount_range: string;
  betslipId: string;
  status: number;
};

type AgentOpenBet = {
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
  raw: AnyRecord;
};

interface OpenBetsTabProps {
  agentId: string;
  agent: Agency;
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function agentDate(date: Date, endOfDay = false) {
  return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()} ${
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

function defaultFilter(): AgentOpenBetFilter {
  const now = new Date();
  return {
    period: "today",
    username: "",
    from: agentDate(now),
    to: agentDate(now, true),
    bet_type: "",
    event_type: "",
    sport: "",
    league: "",
    market: "",
    group_type: "",
    amount_range: "",
    betslipId: "",
    status: 0,
  };
}

function applyPeriod(filter: AgentOpenBetFilter, period: Period): AgentOpenBetFilter {
  const now = new Date();

  if (period === "date_range") return { ...filter, period };
  if (period === "yesterday") {
    const yesterday = addDays(now, -1);
    return { ...filter, period, from: agentDate(yesterday), to: agentDate(yesterday, true) };
  }
  if (period === "current_week") {
    const start = startOfIsoWeek(now);
    return { ...filter, period, from: agentDate(start), to: agentDate(addDays(start, 6), true) };
  }
  if (period === "last_week") {
    const start = addDays(startOfIsoWeek(now), -7);
    return { ...filter, period, from: agentDate(start), to: agentDate(addDays(start, 6), true) };
  }
  if (period === "current_month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { ...filter, period, from: agentDate(start), to: agentDate(end, true) };
  }
  if (period === "last_month") {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);
    return { ...filter, period, from: agentDate(start), to: agentDate(end, true) };
  }
  if (period === "last_30_days") {
    return { ...filter, period, from: agentDate(addDays(now, -30)), to: agentDate(now, true) };
  }

  return { ...filter, period, from: agentDate(now), to: agentDate(now, true) };
}

function mapBet(value: unknown, index: number): AgentOpenBet {
  const bet = asRecord(value);
  const betCategory = String(rowValue(bet, ["betCategory", "bet_category"]));

  return {
    id: String(rowValue(bet, ["id", "betId"], `agent-open-${index}`)),
    betslipId: String(rowValue(bet, ["betslipId", "betslip_id"])),
    betCategory,
    betCategoryDesc: String(rowValue(bet, ["betCategoryDesc", "bet_type"], betCategory)),
    eventType: String(rowValue(bet, ["eventType", "event_type"])),
    created: formatDate(rowValue(bet, ["created", "created_at"])),
    userId: String(rowValue(bet, ["userId", "user_id"], "")),
    username: String(rowValue(bet, ["username"])),
    totalOdd: String(
      betCategory === "Combo"
        ? `${rowValue(bet, ["minOdds"])}/${rowValue(bet, ["totalOdd", "total_odd"])}`
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
    raw: bet,
  };
}

export default function OpenBetsTab({ agentId }: OpenBetsTabProps) {
  const [filter, setFilter] = useState<AgentOpenBetFilter>(() => defaultFilter());
  const [rows, setRows] = useState<AgentOpenBet[]>([]);
  const [pagination, setPagination] = useState<Pagination>(emptyPagination);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [totalTickets, setTotalTickets] = useState(0);
  const [amountPlayed, setAmountPlayed] = useState(0);

  async function getResults(page = 1, nextFilter = filter) {
    setLoading(true);
    const response = await POSTREQUEST<any>(
      `/admin/retail/${clientId()}/agent/${agentId}/bet-list?page=${page}&limit=100`,
      nextFilter
    );
    setLoading(false);

    const body = asRecord(response.data);
    const data = asRecord(body.data);
    if (!response.ok || body.success === false) {
      toast.error(response.error || body.message || "An error occured");
      return;
    }

    const tickets = Array.isArray(data.tickets) ? data.tickets : [];
    const mappedRows = tickets.map(mapBet);
    const meta = asRecord(data.meta);

    setRows(mappedRows);
    setTotalTickets(toNumber(data.totalSalesNo, mappedRows.length));
    setAmountPlayed(toNumber(data.totalSales));
    setPagination(
      paginationFrom(
        {
          total: meta.total,
          per_page: 100,
          current_page: page,
          last_page: meta.lastPage,
          from: mappedRows.length ? (page - 1) * 100 + 1 : 0,
          to: mappedRows.length ? (page - 1) * 100 + mappedRows.length : 0,
        },
        page,
        mappedRows.length
      )
    );
  }

  function updateFilter<K extends keyof AgentOpenBetFilter>(key: K, value: AgentOpenBetFilter[K]) {
    setFilter((current) => ({ ...current, [key]: value }));
  }

  function resetFilter() {
    setFilter(defaultFilter());
    setRows([]);
    setPagination(emptyPagination);
    setTotalTickets(0);
    setAmountPlayed(0);
  }

  return (
    <div className="space-y-6">
      <form
        className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950"
        onSubmit={(event) => {
          event.preventDefault();
          void getResults(1);
        }}
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <select value={filter.period} onChange={(event) => setFilter((current) => applyPeriod(current, event.target.value as Period))} className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white">
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="current_week">Current Week</option>
            <option value="last_week">Last Week</option>
            <option value="current_month">Current Month</option>
            <option value="last_month">Last Month</option>
            <option value="last_30_days">Last 30 Days</option>
            <option value="date_range">Date Range</option>
          </select>
          <input value={filter.from} onChange={(event) => updateFilter("from", event.target.value)} className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
          <input value={filter.to} onChange={(event) => updateFilter("to", event.target.value)} className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
          <select value={filter.bet_type} onChange={(event) => updateFilter("bet_type", event.target.value)} className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white">
            <option value="">Bet Type</option>
            <option value="Single">Single Bet</option>
            <option value="Multiple">Multiple Bet</option>
            <option value="Combo">System Bet</option>
            <option value="Split">Split Bet</option>
          </select>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <select value={filter.event_type} onChange={(event) => updateFilter("event_type", event.target.value)} className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white">
            <option value="">Pre Match/Live</option>
            <option value="pre_match">Pre-Match</option>
            <option value="live">Live</option>
          </select>
          <select value={filter.sport} onChange={(event) => updateFilter("sport", event.target.value)} className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white">
            <option value="">Sport</option>
          </select>
          <select value={filter.league} onChange={(event) => updateFilter("league", event.target.value)} className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white">
            <option value="">League</option>
          </select>
          <select value={filter.market} onChange={(event) => updateFilter("market", event.target.value)} className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white">
            <option value="">Markets</option>
          </select>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <input value={filter.username} onChange={(event) => updateFilter("username", event.target.value)} placeholder="Username" className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
          <input value={filter.betslipId} onChange={(event) => updateFilter("betslipId", event.target.value)} placeholder="Betslip ID" className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
          <select value={filter.group_type} onChange={(event) => updateFilter("group_type", event.target.value)} className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white">
            <option value="">Stake/Winnings</option>
            <option value="stake">Stake</option>
            <option value="pot_winnings">Winnings</option>
          </select>
          <input value={filter.amount_range} onChange={(event) => updateFilter("amount_range", event.target.value)} placeholder="=> 1000" className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-700 dark:text-gray-300">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" className="h-4 w-4 rounded border-gray-300" />
            Enable Paging
          </label>
          <span>No. of Tickets: {totalTickets.toLocaleString()}</span>
          <span>Amount Played: {money(amountPlayed)}</span>
          <button type="submit" disabled={loading} className="inline-flex h-10 items-center gap-2 rounded-md bg-brand-500 px-4 font-medium text-white hover:bg-brand-600 disabled:opacity-50">
            <Search size={16} />
            Search
          </button>
          <button type="button" onClick={resetFilter} className="h-10 rounded-md border border-gray-300 px-4 font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-900">
            Clear all filters
          </button>
        </div>
      </form>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
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
              ].map((head) => (
                <th key={head} className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">
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
                    <button type="button" onClick={() => setExpandedId((current) => current === bet.id ? null : bet.id)} className="inline-flex items-center gap-1">
                      {expandedId === bet.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      {bet.betslipId}
                    </button>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">
                    {bet.betCategoryDesc} ({bet.eventType === "pre" || bet.eventType === "prematch" ? "P" : "L"})
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{bet.created}</td>
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-brand-600 dark:text-brand-300">
                    {bet.userId ? <Link href={`/player-management/player-info/${bet.userId}`}>{bet.username}</Link> : bet.username}
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
                </tr>
                {expandedId === bet.id ? (
                  <tr>
                    <td colSpan={13} className="bg-gray-50 px-4 py-4 dark:bg-gray-900">
                      <BetDetailsPanel bet={bet.raw} />
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            ))}
            {!rows.length ? (
              <tr>
                <td colSpan={13} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                  {loading ? "Loading open bets" : "No record found"}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-gray-200 px-5 py-4 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
          <span>Showing {pagination.total ? `${pagination.from} to ${pagination.to} of ${pagination.total}` : rows.length} entries</span>
          <button type="button" disabled={pagination.current_page <= 1 || loading} onClick={() => void getResults(pagination.current_page - 1)} className="rounded-md border border-gray-300 px-3 py-1.5 disabled:opacity-40 dark:border-gray-700">
            Previous
          </button>
          <span>Page {pagination.current_page} of {pagination.last_page ?? 1}</span>
          <button type="button" disabled={pagination.current_page >= (pagination.last_page ?? 1) || loading} onClick={() => void getResults(pagination.current_page + 1)} className="rounded-md border border-gray-300 px-3 py-1.5 disabled:opacity-40 dark:border-gray-700">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
