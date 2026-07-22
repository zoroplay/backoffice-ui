"use client";

import Link from "next/link";
import { Fragment, useEffect, useState } from "react";
import { Ban, Check, ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";

import { TicketBadge, TicketOpsShell, TicketSection } from "../components/TicketOpsShell";
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

type ExposureFilter = {
  monitor_type: string;
  amount_range: string;
  completion_percent: string;
  page_size: string;
  refresh_time: string;
};

type ExposureBet = {
  id: string;
  betslipId: string;
  userId: string;
  username: string;
  roleId: number | null;
  betType: string;
  stake: number;
  potentialWinnings: number;
  createdAt: string;
  total: number;
  won: number;
  running: number;
  raw: AnyRecord;
};

const defaultFilter: ExposureFilter = {
  monitor_type: "",
  amount_range: "",
  completion_percent: "",
  page_size: "50",
  refresh_time: "30000",
};

function mapExposureBet(value: unknown, index: number): ExposureBet {
  const bet = asRecord(value);

  return {
    id: String(rowValue(bet, ["id", "bet_id"], `exposure-${index}`)),
    betslipId: String(rowValue(bet, ["betslip_id", "betslipId"])),
    userId: String(rowValue(bet, ["user_id", "userId"], "")),
    username: String(rowValue(bet, ["username"])),
    roleId: bet.role_id === undefined ? null : toNumber(bet.role_id),
    betType: String(rowValue(bet, ["bet_type", "betType"])),
    stake: toNumber(bet.stake),
    potentialWinnings: toNumber(bet.pot_winnings ?? bet.potentialWinnings),
    createdAt: formatDate(bet.created_at ?? bet.createdAt),
    total: toNumber(bet.total),
    won: toNumber(bet.won),
    running: toNumber(bet.running),
    raw: bet,
  };
}

function completionTone(percent: number) {
  if (percent < 50) return "info";
  if (percent < 70) return "warning";
  return "danger";
}

export default function TicketExposureMonitorPage() {
  const [filter, setFilter] = useState<ExposureFilter>(defaultFilter);
  const [rows, setRows] = useState<ExposureBet[]>([]);
  const [detailsById, setDetailsById] = useState<Record<string, AnyRecord>>({});
  const [pagination, setPagination] = useState<Pagination>(emptyPagination);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingDetailsId, setLoadingDetailsId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function loadSettings() {
    const response = await GETREQUEST<any>("/admin/settings?category=exposure-monitor");
    if (!response.ok) return;

    const body = response.data;
    const settings = Array.isArray(body)
      ? body
      : Array.isArray(asRecord(body).data)
        ? asRecord(body).data
        : [];

    setFilter((current) => {
      const next = { ...current };
      settings.forEach((setting) => {
        const item = asRecord(setting);
        const option = String(item.option ?? "");
        if (option in next) {
          next[option as keyof ExposureFilter] = String(item.value ?? "");
        }
      });
      return next;
    });
  }

  async function loadData(page = 1, nextFilter = filter) {
    setLoading(true);
    const response = await POSTREQUEST<any>(
      `/admin/sport/exposure-monitor?page=${page}`,
      nextFilter
    );
    setLoading(false);

    const body = asRecord(response.data);
    if (!response.ok || body.success === false) {
      toast.error(response.error || body.message || "An error occured");
      return;
    }

    const mappedRows = getPaginatedRows(response.data).map(mapExposureBet);
    setRows(mappedRows);
    setPagination(paginationFrom(response.data, page, mappedRows.length));
  }

  async function toggleDetails(bet: ExposureBet) {
    const nextExpanded = expandedId === bet.id ? null : bet.id;
    setExpandedId(nextExpanded);
    if (!nextExpanded || detailsById[bet.id]) return;

    setLoadingDetailsId(bet.id);
    const response = await GETREQUEST<any>(`admin/sport/get-bet?betslip_id=${bet.betslipId}`);
    setLoadingDetailsId(null);

    const body = asRecord(response.data);
    if (!response.ok || body.success === false) {
      toast.error(response.error || body.message || "An error occured");
      return;
    }

    setDetailsById((current) => ({ ...current, [bet.id]: body }));
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

  function updateFilter(key: keyof ExposureFilter, value: string) {
    setFilter((current) => ({ ...current, [key]: value }));
  }

  useEffect(() => {
    void loadSettings();
    void loadData(1, defaultFilter);
  }, []);

  useEffect(() => {
    const refreshMs = Math.max(5000, toNumber(filter.refresh_time, 30000));
    const timer = window.setInterval(() => {
      void loadData(1, filter);
    }, refreshMs);

    return () => window.clearInterval(timer);
  }, [filter]);

  return (
    <TicketOpsShell
      title="Exposure Monitor"
      description="Monitor tickets by stake or potential winnings exposure, completion percentage, and configured refresh settings."
    >
      <TicketSection title="Filters">
        <form
          className="grid gap-4 md:grid-cols-2 xl:grid-cols-6"
          onSubmit={(event) => {
            event.preventDefault();
            void loadData(1);
          }}
        >
          <label className="block">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tickets per page</span>
            <input
              value={filter.page_size}
              onChange={(event) => updateFilter("page_size", event.target.value)}
              placeholder="Recent X Placed Bets"
              className="mt-2 h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Refresh Page every</span>
            <select
              value={filter.refresh_time}
              onChange={(event) => updateFilter("refresh_time", event.target.value)}
              className="mt-2 h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              <option value="30000">5 mins</option>
              <option value="60000">10 mins</option>
              <option value="90000">15 mins</option>
              <option value="120000">20 mins</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Completion %</span>
            <input
              value={filter.completion_percent}
              onChange={(event) => updateFilter("completion_percent", event.target.value)}
              placeholder="60%"
              className="mt-2 h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter By</span>
            <select
              value={filter.monitor_type}
              onChange={(event) => updateFilter("monitor_type", event.target.value)}
              className="mt-2 h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              <option value="">Stake/Winnings</option>
              <option value="stake">Stake</option>
              <option value="pot_winnings">Pot. Winnings</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Amount range</span>
            <input
              value={filter.amount_range}
              onChange={(event) => updateFilter("amount_range", event.target.value)}
              placeholder="=> 1000"
              className="mt-2 h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </label>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="h-10 w-full rounded-md bg-brand-500 px-4 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
            >
              Apply Filter
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
                  "Username",
                  "Bet Type",
                  "Stake",
                  "Pot. Winnings",
                  "Date/Time",
                  "Total Selection",
                  "Won",
                  "Running",
                  "% Complete",
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
              {rows.map((bet) => {
                const percent = bet.total ? Number(((bet.won * 100) / bet.total).toFixed(2)) : 0;
                return (
                  <Fragment key={bet.id}>
                    <tr>
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-brand-600 dark:text-brand-300">
                        <button
                          type="button"
                          onClick={() => void toggleDetails(bet)}
                          className="inline-flex items-center gap-1"
                        >
                          {expandedId === bet.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          {bet.betslipId}
                        </button>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-brand-600 dark:text-brand-300">
                        {bet.userId ? (
                          <Link href={bet.roleId === 4 ? `/network/agent/${bet.userId}` : `/player-management/player-info/${bet.userId}`}>
                            {bet.username}
                          </Link>
                        ) : (
                          bet.username
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{bet.betType}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{money(bet.stake)}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{money(bet.potentialWinnings)}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{bet.createdAt}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{bet.total}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{bet.won}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{bet.running}</td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <TicketBadge tone={completionTone(percent)}>{percent}</TicketBadge>
                      </td>
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
                        <td colSpan={11} className="bg-gray-50 px-4 py-4 dark:bg-gray-900">
                          {loadingDetailsId === bet.id ? (
                            <div className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                              Loading bet details
                            </div>
                          ) : (
                            <BetDetailsPanel bet={detailsById[bet.id] ?? bet.raw} />
                          )}
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })}
              {!rows.length ? (
                <tr>
                  <td colSpan={11} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    {loading ? "Loading exposure monitor" : "No result found"}
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
