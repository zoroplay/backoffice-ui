"use client";

import { Fragment, useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, ChevronDown, ChevronRight, Ban } from "lucide-react";

import {
  TicketOpsShell,
  TicketSection,
} from "../components/TicketOpsShell";
import { GETREQUEST, POSTREQUEST } from "@/utils/base_request";

type WinningsBet = {
  id: string;
  betslipId: string;
  username: string;
  betType: string;
  selectionsCount: number;
  odds: number;
  stake: number;
  winnings: number;
  channel: string;
  createdAt: string;
  raw: Record<string, any>;
};

type Pagination = {
  total: number;
  per_page: number;
  from: number;
  to: number;
  current_page: number;
  last_page?: number;
};

function clientId() {
  return process.env.NEXT_PUBLIC_CLIENT_ID ?? "";
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

function formatDate(value: unknown) {
  if (!value) return "-";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);

  return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`;
}

function mapBet(value: unknown, index: number): WinningsBet {
  const bet = asRecord(value);
  const user = asRecord(bet.user);

  return {
    id: String(bet.id ?? bet.bet_id ?? bet.betslip_id ?? `winning-${index}`),
    betslipId: String(bet.betslip_id ?? bet.betslipId ?? bet.reference ?? "-"),
    username: String(user.username ?? bet.username ?? "-"),
    betType: String(bet.bet_type ?? bet.betType ?? "-"),
    selectionsCount: toNumber(bet.selections_count ?? bet.selectionsCount, 0),
    odds: toNumber(bet.odds, 0),
    stake: toNumber(bet.stake, 0),
    winnings: toNumber(bet.winnings ?? bet.pot_winnings ?? bet.potentialReturn, 0),
    channel: String(bet.channel ?? bet.client_type ?? bet.clientType ?? "-"),
    createdAt: formatDate(bet.created_at ?? bet.createdAt),
    raw: bet,
  };
}

function parseRows(value: unknown) {
  const body = asRecord(value);
  if (Array.isArray(value)) return value.map(mapBet);
  if (Array.isArray(body.data)) return body.data.map(mapBet);
  if (Array.isArray(body.bets)) return body.bets.map(mapBet);
  if (Array.isArray(asRecord(body.data).data)) return asRecord(body.data).data.map(mapBet);
  return [];
}

function paginationFrom(value: unknown, page: number, count: number): Pagination {
  const body = asRecord(value);
  const data = asRecord(body.data);
  const source = Object.keys(data).length ? data : body;
  const perPage = toNumber(source.per_page ?? source.perPage, count || 10);
  const total = toNumber(source.total, count);
  const currentPage = toNumber(source.current_page ?? source.currentPage, page);

  return {
    total,
    per_page: perPage,
    from: toNumber(source.from, total ? (currentPage - 1) * perPage + 1 : 0),
    to: toNumber(source.to, Math.min(currentPage * perPage, total)),
    current_page: currentPage,
    last_page: toNumber(
      source.last_page ?? source.lastPage,
      perPage ? Math.max(1, Math.ceil(total / perPage)) : 1
    ),
  };
}

export default function WinningsOnHoldPage() {
  const [rows, setRows] = useState<WinningsBet[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    per_page: 10,
    from: 0,
    to: 0,
    current_page: 1,
  });
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function loadData(page = 1) {
    setLoading(true);
    const response = await GETREQUEST<any>(`api/admin/sport/winnings-on-hold?page=${page}`);
    setLoading(false);

    const body = asRecord(response.data);
    if (!response.ok || body.success === false) {
      toast.error(response.error || body.message || "An error occured");
      return;
    }

    const mappedRows = parseRows(response.data);
    setRows(mappedRows);
    setPagination(paginationFrom(response.data, page, mappedRows.length));
  }

  async function updateTicket(id: string, status: "won" | "lost") {
    const confirmed = window.confirm("Are you sure?");
    if (!confirmed) return;

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

  useEffect(() => {
    void loadData(1);
  }, []);

  return (
    <TicketOpsShell
      title="Winnings On Hold"
      description="Review winning tickets held for manual approval or investigation before payout."
    >
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
                  <th
                    key={head || "actions"}
                    className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300"
                  >
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
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-brand-600 dark:text-brand-300">
                      <a href="#" onClick={(event) => event.preventDefault()}>
                        {bet.username}
                      </a>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{bet.betType}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{bet.selectionsCount} Selection(s)</td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{bet.odds}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{money(bet.stake)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{money(bet.winnings)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{bet.channel}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{bet.createdAt}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={updatingId === bet.id}
                          onClick={() => void updateTicket(bet.id, "lost")}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                          title="Mark lost"
                        >
                          <Ban size={15} />
                        </button>
                        <button
                          type="button"
                          disabled={updatingId === bet.id}
                          onClick={() => void updateTicket(bet.id, "won")}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                          title="Mark won"
                        >
                          <Check size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedId === bet.id ? (
                    <tr key={`${bet.id}-details`}>
                      <td colSpan={10} className="bg-gray-50 px-4 py-4 dark:bg-gray-900">
                        <BetDetails bet={bet.raw} />
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              ))}
              {!rows.length ? (
                <tr>
                  <td
                    colSpan={10}
                    className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    {loading ? "Loading winnings on hold" : "Set your preferences in the filters and press Apply"}
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

function BetDetails({ bet }: { bet: Record<string, any> }) {
  const selections = Array.isArray(bet.selections)
    ? bet.selections
    : Array.isArray(bet.items)
      ? bet.items
      : [];

  if (!selections.length) {
    return (
      <pre className="max-h-72 overflow-auto rounded-md bg-white p-3 text-xs text-gray-700 dark:bg-gray-950 dark:text-gray-300">
        {JSON.stringify(bet, null, 2)}
      </pre>
    );
  }

  return (
    <div className="space-y-2">
      {selections.map((selection: unknown, index: number) => {
        const item = asRecord(selection);
        return (
          <div
            key={String(item.id ?? index)}
            className="grid gap-2 rounded-md border border-gray-200 bg-white p-3 text-xs text-gray-700 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300 md:grid-cols-4"
          >
            <span>{String(item.sport ?? item.sport_name ?? "-")}</span>
            <span>{String(item.event ?? item.event_name ?? item.match ?? "-")}</span>
            <span>{String(item.market ?? item.market_name ?? "-")}</span>
            <span>{String(item.selection ?? item.selection_name ?? item.name ?? "-")}</span>
          </div>
        );
      })}
    </div>
  );
}
