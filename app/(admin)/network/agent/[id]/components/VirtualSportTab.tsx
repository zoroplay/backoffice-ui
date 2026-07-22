"use client";

import Link from "next/link";
import { useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";

import type { Agency } from "@/app/(admin)/network/agency-list/columns";
import {
  asRecord,
  clientId,
  emptyPagination,
  formatDate,
  money,
  paginationFrom,
  rowValue,
  toNumber,
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

type VirtualSportFilter = {
  period: Period;
  username: string;
  from: string;
  to: string;
  bet_type: string;
  event_type: string;
  sport: string;
  league: string;
  market: string;
  state: string;
  group_type: string;
  amount_range: string;
  status: string;
};

type VirtualSportBet = {
  id: string;
  userId: string;
  username: string;
  roundId: string;
  stake: number;
  createdAt: string;
  winnings: number;
  jackpotAmount: number;
  status: number;
};

interface VirtualSportTabProps {
  agentId: string;
  agent: Agency;
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function displayDate(date: Date, endOfDay = false) {
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

function defaultFilter(): VirtualSportFilter {
  const now = new Date();
  return {
    period: "today",
    username: "",
    from: displayDate(now),
    to: displayDate(now, true),
    bet_type: "",
    event_type: "",
    sport: "",
    league: "",
    market: "",
    state: "",
    group_type: "",
    amount_range: "",
    status: "",
  };
}

function applyPeriod(filter: VirtualSportFilter, period: Period): VirtualSportFilter {
  const now = new Date();

  if (period === "date_range") return { ...filter, period };
  if (period === "yesterday") {
    const yesterday = addDays(now, -1);
    return { ...filter, period, from: displayDate(yesterday), to: displayDate(yesterday, true) };
  }
  if (period === "current_week") {
    const start = startOfIsoWeek(now);
    return { ...filter, period, from: displayDate(start), to: displayDate(addDays(start, 6), true) };
  }
  if (period === "last_week") {
    const start = addDays(startOfIsoWeek(now), -7);
    return { ...filter, period, from: displayDate(start), to: displayDate(addDays(start, 6), true) };
  }
  if (period === "current_month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { ...filter, period, from: displayDate(start), to: displayDate(end, true) };
  }
  if (period === "last_month") {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);
    return { ...filter, period, from: displayDate(start), to: displayDate(end, true) };
  }
  if (period === "last_30_days") {
    return { ...filter, period, from: displayDate(addDays(now, -30)), to: displayDate(now, true) };
  }

  return { ...filter, period, from: displayDate(now), to: displayDate(now, true) };
}

function statusLabel(status: number) {
  if (status === 1) return "Won";
  if (status === 2) return "Lost";
  if (status === 3) return "Cancelled";
  if (status === 4) return "CUT1 (stake)";
  if (status === 5) return "CUT1 (5%)";
  return "Pending";
}

function statusClass(status: number) {
  if (status === 1) return "text-green-600 dark:text-green-300";
  if (status === 2 || status === 3) return "text-red-600 dark:text-red-300";
  return "text-amber-600 dark:text-amber-300";
}

function mapBet(value: unknown, index: number): VirtualSportBet {
  const bet = asRecord(value);
  return {
    id: String(rowValue(bet, ["id", "round_id"], `virtual-${index}`)),
    userId: String(rowValue(bet, ["user_id", "userId"], "")),
    username: String(rowValue(bet, ["username"])),
    roundId: String(rowValue(bet, ["round_id", "roundId", "ticketNumber"])),
    stake: toNumber(bet.stake),
    createdAt: formatDate(bet.created_at ?? bet.createdAt),
    winnings: toNumber(bet.winnings),
    jackpotAmount: toNumber(bet.jackpot_amount ?? bet.jackpotAmount),
    status: toNumber(bet.status),
  };
}

export default function VirtualSportTab({ agentId }: VirtualSportTabProps) {
  const [filter, setFilter] = useState<VirtualSportFilter>(() => defaultFilter());
  const [rows, setRows] = useState<VirtualSportBet[]>([]);
  const [pagination, setPagination] = useState<Pagination>(emptyPagination);
  const [loading, setLoading] = useState(false);
  const [totalTickets, setTotalTickets] = useState(0);
  const [totalStake, setTotalStake] = useState(0);
  const [totalWinnings, setTotalWinnings] = useState(0);

  async function getResults(page = 1, nextFilter = filter) {
    setLoading(true);
    const response = await POSTREQUEST<any>(
      `/admin/retail/${clientId()}/agent/${agentId}/virtual-bets?page=${page}&limit=100`,
      nextFilter
    );
    setLoading(false);

    const body = asRecord(response.data);
    const data = asRecord(body.data);
    if (!response.ok || body.success === false) {
      toast.error(response.error || body.message || "An error occured");
      return;
    }

    const list = Array.isArray(data.data) ? data.data : Array.isArray(body.data) ? body.data : [];
    const mappedRows = list.map(mapBet);
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
          current_page: page,
          last_page: data.lastPage,
          from: mappedRows.length ? (page - 1) * 100 + 1 : 0,
          to: mappedRows.length ? (page - 1) * 100 + mappedRows.length : 0,
        },
        page,
        mappedRows.length
      )
    );
  }

  function updateFilter<K extends keyof VirtualSportFilter>(key: K, value: VirtualSportFilter[K]) {
    setFilter((current) => ({ ...current, [key]: value }));
  }

  function resetFilter() {
    setFilter(defaultFilter());
    setRows([]);
    setPagination(emptyPagination);
    setTotalTickets(0);
    setTotalStake(0);
    setTotalWinnings(0);
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
            <option value="single">Single Bet</option>
            <option value="multiple">Combo Bet</option>
          </select>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <input value={filter.username} onChange={(event) => updateFilter("username", event.target.value)} placeholder="Username" className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
          <select value={filter.group_type} onChange={(event) => updateFilter("group_type", event.target.value)} className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white">
            <option value="">Stake/Winnings</option>
            <option value="stake">Stake</option>
            <option value="pot_winnings">Winnings</option>
          </select>
          <input value={filter.amount_range} onChange={(event) => updateFilter("amount_range", event.target.value)} placeholder="=> 1000" className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
          <select value={filter.status} onChange={(event) => updateFilter("status", event.target.value)} className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white">
            <option value="">Status</option>
            <option value="2">Lost</option>
            <option value="1">Won</option>
            <option value="3">Cancelled</option>
            <option value="4">CUT1 (stake)</option>
            <option value="5">CUT1 (5%)</option>
          </select>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-700 dark:text-gray-300">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" className="h-4 w-4 rounded border-gray-300" />
            Enable Paging
          </label>
          <button type="submit" disabled={loading} className="inline-flex h-10 items-center gap-2 rounded-md bg-brand-500 px-4 font-medium text-white hover:bg-brand-600 disabled:opacity-50">
            <Search size={16} />
            Search
          </button>
          <button type="button" onClick={resetFilter} className="h-10 rounded-md border border-gray-300 px-4 font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-900">
            Clear all filters
          </button>
        </div>
      </form>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Tickets</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{totalTickets.toLocaleString()}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Stake</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{money(totalStake)}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Winnings</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{money(totalWinnings)}</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              {["Player", "Ticket Number", "Stake", "Placed on", "Amount Won", "Jackpot", "Status"].map((head) => (
                <th key={head} className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
            {rows.map((bet) => (
              <tr key={bet.id}>
                <td className="whitespace-nowrap px-4 py-3 font-medium text-brand-600 dark:text-brand-300">
                  {bet.userId ? <Link href={`/player-management/player-info/${bet.userId}`}>{bet.username}</Link> : bet.username}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{bet.roundId}</td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{money(bet.stake)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{bet.createdAt}</td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{money(bet.winnings)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{money(bet.jackpotAmount)}</td>
                <td className={`whitespace-nowrap px-4 py-3 font-medium ${statusClass(bet.status)}`}>{statusLabel(bet.status)}</td>
              </tr>
            ))}
            {!rows.length ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                  {loading ? "Loading virtual sport bets" : "No record found"}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-gray-200 px-5 py-4 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
          <span>Showing {pagination.total ? `${pagination.from} to ${pagination.to} of ${pagination.total}` : rows.length} entries</span>
          <button type="button" disabled={pagination.current_page <= 1 || loading} onClick={() => void getResults(pagination.current_page - 1)} className="rounded-md border border-gray-300 px-3 py-1.5 disabled:opacity-40 dark:border-gray-700">Previous</button>
          <span>Page {pagination.current_page} of {pagination.last_page ?? 1}</span>
          <button type="button" disabled={pagination.current_page >= (pagination.last_page ?? 1) || loading} onClick={() => void getResults(pagination.current_page + 1)} className="rounded-md border border-gray-300 px-3 py-1.5 disabled:opacity-40 dark:border-gray-700">Next</button>
        </div>
      </div>
    </div>
  );
}
