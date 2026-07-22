"use client";

import { Fragment, useEffect, useState } from "react";
import { Ban, Check, ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";

import { TicketOpsShell, TicketSection } from "../components/TicketOpsShell";
import {
  asRecord,
  BetDetailsPanel,
  clientId,
  emptyPagination,
  formatDate,
  getPaginatedRows,
  money,
  paginationFrom,
  rowValue,
  toNumber,
  type AnyRecord,
  type Pagination,
} from "../components/ticketApiHelpers";
import { GETREQUEST, POSTREQUEST } from "@/utils/base_request";

type HoldFilter = {
  bet_type: string;
  group_type: string;
  amount_range: string;
  no_of_bets: string;
};

type HoldBet = {
  id: string;
  betslipId: string;
  username: string;
  betType: string;
  selectionsCount: number;
  odd: string;
  stake: number;
  potentialWinnings: number;
  channel: string;
  createdAt: string;
  raw: AnyRecord;
};

const defaultFilter: HoldFilter = {
  bet_type: "",
  group_type: "",
  amount_range: "",
  no_of_bets: "250",
};

function mapHoldBet(value: unknown, index: number): HoldBet {
  const bet = asRecord(value);
  const user = asRecord(bet.user);

  return {
    id: String(rowValue(bet, ["id", "bet_id"], `hold-${index}`)),
    betslipId: String(rowValue(bet, ["betslip_id", "betslipId"])),
    username: String(rowValue(user, ["username"], rowValue(bet, ["username"]))),
    betType: String(rowValue(bet, ["bet_type", "betType"])),
    selectionsCount: toNumber(bet.selections_count ?? bet.selectionsCount),
    odd: String(rowValue(bet, ["odd", "odds"])),
    stake: toNumber(bet.stake),
    potentialWinnings: toNumber(bet.pot_winnings ?? bet.potentialWinnings),
    channel: String(rowValue(bet, ["channel", "source"])),
    createdAt: formatDate(bet.created_at ?? bet.createdAt),
    raw: bet,
  };
}

export default function TicketOnHoldPage() {
  const [filter, setFilter] = useState<HoldFilter>(defaultFilter);
  const [refreshTime, setRefreshTime] = useState("300000");
  const [rows, setRows] = useState<HoldBet[]>([]);
  const [pagination, setPagination] = useState<Pagination>(emptyPagination);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function loadData(page = 1, nextFilter = filter) {
    setLoading(true);
    const response = await POSTREQUEST<any>(
      `api/admin/sport/bets-monitor?page=${page}`,
      nextFilter
    );
    setLoading(false);

    const body = asRecord(response.data);
    if (!response.ok || body.success === false) {
      toast.error(response.error || body.message || "An error occured");
      return;
    }

    const source = asRecord(body.bets);
    const mappedRows = getPaginatedRows(response.data, "bets").map(mapHoldBet);
    setRows(mappedRows);
    setPagination(paginationFrom(source, page, mappedRows.length));
  }

  async function updateTicket(id: string, status: "reject" | "pending") {
    if (!window.confirm("Are you sure?")) return;

    setUpdatingId(id);
    const response = await POSTREQUEST<any>(`/bets/update-bet/${clientId()}`, {
      betId: id,
      status,
    });
    setUpdatingId(null);

    const body = asRecord(response.data);
    if (!response.ok || body.success === false) {
      toast.error(response.error || body.message || "An error occured");
      return;
    }

    toast.success(body.message || "Ticket updated");
    await loadData(pagination.current_page);
  }

  function updateFilter(key: keyof HoldFilter, value: string) {
    setFilter((current) => ({ ...current, [key]: value }));
  }

  useEffect(() => {
    const timer = window.setInterval(() => {
      void loadData(1, filter);
    }, Math.max(5000, toNumber(refreshTime, 300000)));

    return () => window.clearInterval(timer);
  }, [filter, refreshTime]);

  return (
    <TicketOpsShell
      title="Tickets On Hold"
      description="Review recent held tickets by bet type, stake or winnings range, and manually reject or move tickets back to pending."
    >
      <TicketSection title="Filters">
        <form
          className="grid gap-4 md:grid-cols-2 xl:grid-cols-6"
          onSubmit={(event) => {
            event.preventDefault();
            void loadData(1);
          }}
        >
          <input
            value={filter.no_of_bets}
            onChange={(event) => updateFilter("no_of_bets", event.target.value)}
            placeholder="Recent X Placed Bets"
            className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
          <select
            value={refreshTime}
            onChange={(event) => setRefreshTime(event.target.value)}
            className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          >
            <option value="300000">5 mins refresh</option>
            <option value="600000">10 mins refresh</option>
            <option value="900000">15 mins refresh</option>
            <option value="1200000">20 mins refresh</option>
          </select>
          <select
            value={filter.bet_type}
            onChange={(event) => updateFilter("bet_type", event.target.value)}
            className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          >
            <option value="">Bet Type</option>
            <option value="single">Single Bet</option>
            <option value="multiple">Combo Bet</option>
          </select>
          <select
            value={filter.group_type}
            onChange={(event) => updateFilter("group_type", event.target.value)}
            className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          >
            <option value="">Stake/Winnings</option>
            <option value="stake">Stake</option>
            <option value="pot_winnings">Winnings</option>
          </select>
          <input
            value={filter.amount_range}
            onChange={(event) => updateFilter("amount_range", event.target.value)}
            placeholder="=> 1000"
            className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
          <button
            type="submit"
            disabled={loading}
            className="h-10 rounded-md bg-brand-500 px-4 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
          >
            Apply & Refresh
          </button>
        </form>
      </TicketSection>

      <TicketSection title="Results">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                {[
                  "Betslip ID",
                  "Username",
                  "Bet Type",
                  "Selection",
                  "Odds",
                  "Stake",
                  "Return",
                  "Client Type",
                  "Date/Time",
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
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{bet.username}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{bet.betType}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{bet.selectionsCount} Selection(s)</td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{bet.odd}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{money(bet.stake)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{money(bet.potentialWinnings)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{bet.channel}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{bet.createdAt}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={updatingId === bet.id}
                          onClick={() => void updateTicket(bet.id, "reject")}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                          title="Reject ticket"
                        >
                          <Ban size={15} />
                        </button>
                        <button
                          type="button"
                          disabled={updatingId === bet.id}
                          onClick={() => void updateTicket(bet.id, "pending")}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                          title="Mark pending"
                        >
                          <Check size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedId === bet.id ? (
                    <tr>
                      <td colSpan={10} className="bg-gray-50 px-4 py-4 dark:bg-gray-900">
                        <BetDetailsPanel bet={bet.raw} />
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              ))}
              {!rows.length ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    {loading ? "Loading tickets on hold" : "Set your preferences in the filters and press Apply"}
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
            onClick={() => void loadData(pagination.current_page - 1)}
            className="rounded-md border border-gray-300 px-3 py-1.5 disabled:opacity-40 dark:border-gray-700"
          >
            Previous
          </button>
          <span>Page {pagination.current_page} of {pagination.last_page ?? 1}</span>
          <button
            type="button"
            disabled={pagination.current_page >= (pagination.last_page ?? 1) || loading}
            onClick={() => void loadData(pagination.current_page + 1)}
            className="rounded-md border border-gray-300 px-3 py-1.5 disabled:opacity-40 dark:border-gray-700"
          >
            Next
          </button>
        </div>
      </TicketSection>
    </TicketOpsShell>
  );
}
