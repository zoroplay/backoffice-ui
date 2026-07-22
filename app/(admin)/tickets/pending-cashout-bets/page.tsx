"use client";

import { Fragment, useEffect, useState } from "react";
import { Ban, Check, ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";

import { TicketOpsShell, TicketSection } from "../components/TicketOpsShell";
import {
  asRecord,
  BetDetailsPanel,
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
import { GETREQUEST } from "@/utils/base_request";

type PendingCashoutBet = {
  id: string;
  betslipId: string;
  placedBy: string;
  cashoutBy: string;
  selectionsCount: number;
  odds: string;
  stake: number;
  potentialWinnings: number;
  cashoutAmount: number;
  createdAt: string;
  raw: AnyRecord;
};

function mapBet(value: unknown, index: number): PendingCashoutBet {
  const bet = asRecord(value);
  const user = asRecord(bet.user);
  const cashoutBy = asRecord(bet.cashout_by ?? bet.cashoutBy);

  return {
    id: String(rowValue(bet, ["id", "bet_id"], `pending-cashout-${index}`)),
    betslipId: String(rowValue(bet, ["betslip_id", "betslipId"])),
    placedBy: String(rowValue(user, ["username"], rowValue(bet, ["username"]))),
    cashoutBy: String(rowValue(cashoutBy, ["username"], "-")),
    selectionsCount: toNumber(bet.selections_count ?? bet.selectionsCount),
    odds: String(rowValue(bet, ["odds"])),
    stake: toNumber(bet.stake),
    potentialWinnings: toNumber(bet.pot_winnings ?? bet.potentialWinnings),
    cashoutAmount: toNumber(bet.cashout_amount ?? bet.cashoutAmount),
    createdAt: formatDate(bet.created_at ?? bet.createdAt),
    raw: bet,
  };
}

export default function PendingCashoutPage() {
  const [rows, setRows] = useState<PendingCashoutBet[]>([]);
  const [pagination, setPagination] = useState<Pagination>(emptyPagination);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function loadData(page = 1) {
    setLoading(true);
    const response = await GETREQUEST<any>(`api/admin/sport/pending-cashout?page=${page}`);
    setLoading(false);

    const body = asRecord(response.data);
    if (!response.ok || body.success === false) {
      toast.error(response.error || body.message || "An error occured");
      return;
    }

    const source = asRecord(body.bets);
    const mappedRows = getPaginatedRows(response.data, "bets").map(mapBet);
    setRows(mappedRows);
    setPagination(paginationFrom(source, page, mappedRows.length));
  }

  async function updateTicket(id: string, action: "reject" | "approve") {
    if (!window.confirm("Are you sure?")) return;

    setUpdatingId(id);
    const response = await GETREQUEST<any>(
      `api/admin/sport/ticket/cashout-status?id=${id}&action=${action}`
    );
    setUpdatingId(null);

    const body = asRecord(response.data);
    if (!response.ok || body.success === false) {
      toast.error(response.error || body.message || "An error occured");
      return;
    }

    toast.success(body.message || "Cashout status updated");
    await loadData(pagination.current_page);
  }

  useEffect(() => {
    void loadData(1);
  }, []);

  return (
    <TicketOpsShell
      title="Pending Cashout Bets"
      description="Review cashout requests, inspect their selections, and approve or reject the pending cashout status."
    >
      <TicketSection title="Results">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                {[
                  "Betslip ID",
                  "Placed By",
                  "Cashout By",
                  "Selection",
                  "Odds",
                  "Stake",
                  "Pot. Wins",
                  "Cashout Amount",
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
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{bet.placedBy}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{bet.cashoutBy}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{bet.selectionsCount} Selection(s)</td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{bet.odds}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{money(bet.stake)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{money(bet.potentialWinnings)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{money(bet.cashoutAmount)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{bet.createdAt}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={updatingId === bet.id}
                          onClick={() => void updateTicket(bet.id, "reject")}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                          title="Reject cashout"
                        >
                          <Ban size={15} />
                        </button>
                        <button
                          type="button"
                          disabled={updatingId === bet.id}
                          onClick={() => void updateTicket(bet.id, "approve")}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                          title="Approve cashout"
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
                    {loading ? "Loading pending cashouts" : "There are no pending cashout bets"}
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
