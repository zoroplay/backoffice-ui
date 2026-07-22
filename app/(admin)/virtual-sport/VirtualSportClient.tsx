"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, Search, X } from "lucide-react";

type Period =
  | "today"
  | "yesterday"
  | "current_week"
  | "last_week"
  | "current_month"
  | "last_month"
  | "last_30_days"
  | "date_range";

type BetStatus = 0 | 1 | 2;

type VirtualBet = {
  id: string;
  userId: string;
  username: string;
  roundId: string;
  stake: number;
  createdAt: string;
  winnings: number;
  jackpotAmount: number;
  status: 1 | 2;
};

type FilterState = {
  period: Period;
  username: string;
  from: string;
  to: string;
  betType: BetStatus;
};

const pageSize = 2;

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

const virtualBets: VirtualBet[] = [
  {
    id: "vs-1001",
    userId: "USR-2024001",
    username: "samuel.ng",
    roundId: "VF-20260722-0001",
    stake: 20000,
    createdAt: "22/07/2026 14:20",
    winnings: 64000,
    jackpotAmount: 0,
    status: 1,
  },
  {
    id: "vs-1002",
    userId: "USR-2024002",
    username: "linda7",
    roundId: "VH-20260722-0002",
    stake: 5000,
    createdAt: "22/07/2026 15:05",
    winnings: 0,
    jackpotAmount: 0,
    status: 2,
  },
  {
    id: "vs-1003",
    userId: "USR-2024003",
    username: "agent-kiosk-12",
    roundId: "VD-20260722-0003",
    stake: 12000,
    createdAt: "22/07/2026 16:10",
    winnings: 0,
    jackpotAmount: 500000,
    status: 2,
  },
  {
    id: "vs-1004",
    userId: "USR-2024004",
    username: "musa88",
    roundId: "VF-20260721-0004",
    stake: 7500,
    createdAt: "21/07/2026 19:30",
    winnings: 21250,
    jackpotAmount: 0,
    status: 1,
  },
  {
    id: "vs-1005",
    userId: "USR-2024005",
    username: "retail.shop.12",
    roundId: "VR-20260720-0005",
    stake: 10000,
    createdAt: "20/07/2026 12:15",
    winnings: 0,
    jackpotAmount: 0,
    status: 2,
  },
];

function money(value: number) {
  return `NGN ${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function defaultFilters(): FilterState {
  return {
    period: "today",
    username: "",
    from: "22-07-2026 00:00:00",
    to: "22-07-2026 23:59:59",
    betType: 0,
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

function getStatus(status: VirtualBet["status"]) {
  return status === 1 ? "Won" : "Lost";
}

export default function VirtualSportClient() {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [paging, setPaging] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredBets = useMemo(() => {
    const username = filters.username.trim().toLowerCase();
    return virtualBets.filter((bet) => {
      const matchesUsername = !username || bet.username.toLowerCase().includes(username);
      const matchesStatus = filters.betType === 0 || bet.status === filters.betType;
      return matchesUsername && matchesStatus;
    });
  }, [filters.betType, filters.username]);

  const totalTickets = filteredBets.length;
  const totalStake = filteredBets.reduce((sum, bet) => sum + bet.stake, 0);
  const totalWinnings = filteredBets.reduce((sum, bet) => sum + bet.winnings, 0);
  const pageCount = Math.max(1, Math.ceil(filteredBets.length / pageSize));
  const visibleBets = paging
    ? filteredBets.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : filteredBets;

  function updatePeriod(period: Period) {
    setFilters((current) => ({ ...current, period, ...rangeForPeriod(period) }));
    setCurrentPage(1);
  }

  function search() {
    setCurrentPage(1);
  }

  function resetFilters() {
    setFilters(defaultFilters());
    setPaging(true);
    setCurrentPage(1);
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
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <DateInput value={filters.from} onChange={(value) => setFilters((current) => ({ ...current, from: value, period: "date_range" }))} />
            <DateInput value={filters.to} onChange={(value) => setFilters((current) => ({ ...current, to: value, period: "date_range" }))} />
            <select
              value={filters.betType}
              onChange={(event) => {
                setFilters((current) => ({ ...current, betType: Number(event.target.value) as BetStatus }));
                setCurrentPage(1);
              }}
              className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              <option value={0}>All</option>
              <option value={1}>Won</option>
              <option value={2}>Lost</option>
            </select>
          </div>

          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_auto_auto] md:items-center">
            <label className="relative block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                value={filters.username}
                onChange={(event) => setFilters((current) => ({ ...current, username: event.target.value }))}
                placeholder="Username"
                className="h-10 w-full rounded-md border border-gray-300 pl-9 pr-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </label>
            <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <input type="checkbox" checked={paging} onChange={(event) => setPaging(event.target.checked)} className="h-4 w-4 rounded border-gray-300 text-brand-500" />
              Enable Paging
            </label>
            <button type="button" onClick={search} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-info-500 px-4 text-sm font-medium text-white hover:bg-info-600">
              <Search size={16} />
              Search
            </button>
            <button type="button" onClick={resetFilters} className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-gray-300 px-4 text-sm font-medium dark:border-gray-700">
              <X size={16} />
              Clear all filters
            </button>
          </div>

          <div className="grid gap-3 text-sm md:grid-cols-3">
            <Metric label="No. of Tickets" value={totalTickets.toLocaleString()} />
            <Metric label="Amount Played" value={money(totalStake)} />
            <Metric label="Amount Won" value={money(totalWinnings)} />
          </div>

          <div className="rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-600 dark:bg-white/[0.03] dark:text-gray-400">
            POST process.env.newAPI/admin/bets/process.env.clientId/virtuals?page={currentPage}
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
                {["Player", "Ticket Number", "Stake", "Placed on", "Amount Won", "Jackpot", "Status"].map((head) => (
                  <th key={head} className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
              {visibleBets.map((bet) => (
                <tr key={bet.id}>
                  <td className="px-4 py-3">
                    <Link href={`/player-management/player-info/${bet.userId}`} className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-300">
                      {bet.username}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-700 dark:text-gray-300">{bet.roundId}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{money(bet.stake)}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{bet.createdAt}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{money(bet.winnings)}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{money(bet.jackpotAmount)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      bet.status === 1
                        ? "bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300"
                        : "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300"
                    }`}>
                      {getStatus(bet.status)}
                    </span>
                  </td>
                </tr>
              ))}
              {!visibleBets.length ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    No record found
                  </td>
                </tr>
              ) : null}
            </tbody>
            <tfoot className="bg-gray-50 font-semibold dark:bg-gray-900">
              <tr>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">Total Tickets:</td>
                <td className="px-4 py-3 text-center text-gray-700 dark:text-gray-300">{totalTickets.toLocaleString()}</td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{money(totalStake)}</td>
                <td className="px-4 py-3" />
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{money(totalWinnings)}</td>
                <td className="px-4 py-3" />
                <td className="px-4 py-3" />
              </tr>
            </tfoot>
          </table>
        </div>
        {paging ? (
          <div className="flex items-center justify-end gap-2 border-t border-gray-200 px-5 py-4 dark:border-gray-800">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 disabled:opacity-40 dark:border-gray-700"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-300">Page {currentPage} of {pageCount}</span>
            <button
              type="button"
              disabled={currentPage === pageCount}
              onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 disabled:opacity-40 dark:border-gray-700"
            >
              <ChevronRight size={16} />
            </button>
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
