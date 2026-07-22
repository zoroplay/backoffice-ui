"use client";

import Link from "next/link";
import { Fragment, useEffect, useState } from "react";
import { toast } from "sonner";
import { Ban, Check, ChevronDown, ChevronRight, Pencil, Trash2, X } from "lucide-react";

import { TicketOpsShell, TicketSection } from "../components/TicketOpsShell";
import { GETREQUEST, POSTREQUEST } from "@/utils/base_request";

type UnsettledBet = {
  id: string;
  betslipId: string;
  betType: string;
  createdAt: string;
  userId: string;
  username: string;
  roleId: number | null;
  odds: number;
  stake: number;
  potentialWinnings: number;
  winnings: number;
  sports: string;
  tournaments: string;
  events: string;
  markets: string;
  selectionsCount: number;
  channel: string;
  status: number | null;
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

function mapBet(value: unknown, index: number): UnsettledBet {
  const bet = asRecord(value);
  const user = asRecord(bet.user);

  return {
    id: String(bet.id ?? bet.bet_id ?? bet.betslip_id ?? `unsettled-${index}`),
    betslipId: String(bet.betslip_id ?? bet.betslipId ?? "-"),
    betType: String(bet.bet_type ?? bet.betType ?? "-"),
    createdAt: formatDate(bet.created_at ?? bet.createdAt),
    userId: String(user.id ?? bet.user_id ?? ""),
    username: String(user.username ?? bet.username ?? bet.user_id ?? "-"),
    roleId: user.role_id === undefined ? null : toNumber(user.role_id),
    odds: toNumber(bet.odds),
    stake: toNumber(bet.stake),
    potentialWinnings: toNumber(bet.pot_winnings ?? bet.potentialWinnings),
    winnings: toNumber(bet.winnings),
    sports: String(bet.sports ?? bet.sport ?? "-"),
    tournaments: String(bet.tournaments ?? bet.tournament ?? "-"),
    events: String(bet.events ?? bet.event ?? "-"),
    markets: String(bet.markets ?? bet.market_name ?? "-"),
    selectionsCount: toNumber(bet.selections_count ?? bet.selectionsCount),
    channel: String(bet.channel ?? bet.client_type ?? bet.clientType ?? "-"),
    status: bet.status === undefined ? null : toNumber(bet.status),
    raw: bet,
  };
}

function parseRows(value: unknown) {
  const body = asRecord(value);
  const bets = asRecord(body.bets);
  if (Array.isArray(bets.data)) return bets.data.map(mapBet);
  if (Array.isArray(body.data)) return body.data.map(mapBet);
  if (Array.isArray(value)) return value.map(mapBet);
  return [];
}

function paginationFrom(value: unknown, page: number, count: number): Pagination {
  const body = asRecord(value);
  const source = asRecord(body.bets);
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

export default function UnsettledBetsPage() {
  const [rows, setRows] = useState<UnsettledBet[]>([]);
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
    const response = await GETREQUEST<any>(`api/admin/sport/get-unsettled-bets?page=${page}`);
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

  async function updateTicket(id: string, status: "lost" | "void" | "won") {
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

  useEffect(() => {
    void loadData(1);
  }, []);

  return (
    <TicketOpsShell
      title="Unsettled Bets"
      description="Track open and unresolved sports tickets that still need settlement, cancellation, voiding, or manual review."
    >
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
                  "To Return",
                  "Sport",
                  "League",
                  "Event",
                  "Market",
                  "Selection",
                  "Client Type",
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
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{bet.betType}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{bet.createdAt}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-brand-600 dark:text-brand-300">
                      {bet.userId ? (
                        <Link href={bet.roleId === 4 ? `/network/agent/${bet.userId}` : `/player-management/player-info/${bet.userId}`}>
                          {bet.username}
                        </Link>
                      ) : (
                        bet.username
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{bet.odds.toFixed(2)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{money(bet.stake)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{money(bet.potentialWinnings)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{money(bet.winnings)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{bet.sports}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{bet.tournaments}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{bet.events}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{bet.markets}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{bet.selectionsCount} Selection(s)</td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{bet.channel}</td>
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
                      <td colSpan={15} className="bg-gray-50 px-4 py-4 dark:bg-gray-900">
                        <BetDetails bet={bet.raw} />
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              ))}
              {!rows.length ? (
                <tr>
                  <td
                    colSpan={15}
                    className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    {loading ? "Loading unsettled bets" : "No data"}
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
