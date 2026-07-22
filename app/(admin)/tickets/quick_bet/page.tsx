"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Search } from "lucide-react";
import { toast } from "sonner";

import { TicketBadge, TicketOpsShell, TicketSection } from "../components/TicketOpsShell";
import {
  asRecord,
  BetDetailsPanel,
  clientId,
  formatDate,
  money,
  rowValue,
  toNumber,
  type AnyRecord,
} from "../components/ticketApiHelpers";
import { POSTREQUEST } from "@/utils/base_request";

type QuickBet = {
  id: string;
  betslipId: string;
  betCategory: string;
  created: string;
  username: string;
  sportsCount: number;
  tournamentsCount: number;
  eventsCount: number;
  marketsCount: number;
  totalSelections: number;
  totalOdd: string;
  stake: number;
  winnings: number;
  source: string;
  statusCode: number;
  statusDescription: string;
  settledAt: string;
  raw: AnyRecord;
};

function mapBet(value: unknown): QuickBet {
  const bet = asRecord(value);

  return {
    id: String(rowValue(bet, ["id", "betId", "betslipId"])),
    betslipId: String(rowValue(bet, ["betslipId", "betslip_id"])),
    betCategory: String(rowValue(bet, ["betCategory", "bet_category"])),
    created: formatDate(rowValue(bet, ["created", "created_at"])),
    username: String(rowValue(bet, ["username"])),
    sportsCount: toNumber(bet.sports_count ?? bet.sportsCount),
    tournamentsCount: toNumber(bet.tournaments_count ?? bet.tournamentsCount),
    eventsCount: toNumber(bet.events_count ?? bet.eventsCount),
    marketsCount: toNumber(bet.markets_count ?? bet.marketsCount),
    totalSelections: toNumber(bet.totalSelections ?? bet.selections_count),
    totalOdd: String(
      bet.betCategory === "Combo"
        ? `${rowValue(bet, ["minOdds"])}/${rowValue(bet, ["totalOdd", "total_odd"])}`
        : rowValue(bet, ["totalOdd", "total_odd", "odds"])
    ),
    stake: toNumber(bet.stake),
    winnings: toNumber(bet.winnings),
    source: String(rowValue(bet, ["source", "channel"])),
    statusCode: toNumber(bet.statusCode ?? bet.status),
    statusDescription: String(rowValue(bet, ["statusDescription", "status_description"])),
    settledAt: String(rowValue(bet, ["settled_at", "settledAt"])),
    raw: bet,
  };
}

function winLoss(bet: QuickBet) {
  if (bet.statusCode === 1 || bet.statusCode === 5) {
    if (bet.winnings < bet.stake) return `+${money(bet.stake - bet.winnings)}`;
    return `-${money(bet.winnings - bet.stake)}`;
  }

  if (bet.statusCode === 2) return money(bet.stake);
  return "0";
}

function statusTone(statusCode: number) {
  if (statusCode === 1 || statusCode === 5) return "success";
  if (statusCode === -1 || statusCode === 6) return "warning";
  if (statusCode === 3 || statusCode === 4) return "neutral";
  return "danger";
}

export default function QuickBetPage() {
  const [betslipId, setBetslipId] = useState("");
  const [bet, setBet] = useState<QuickBet | null>(null);
  const [searched, setSearched] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  async function findBet() {
    setLoading(true);
    setSearched(true);
    setExpanded(false);
    const response = await POSTREQUEST<any>("/bets/find-coupon", {
      betslipId,
      clientId: clientId(),
    });
    setLoading(false);

    const body = asRecord(response.data);
    if (!response.ok || body.success === false) {
      setBet(null);
      toast.error(response.error || body.message || "An error occured");
      return;
    }

    setBet(mapBet(body.data));
  }

  return (
    <TicketOpsShell
      title="Quick Bet Search"
      description="Find a single coupon by betslip ID and inspect its selections, status, stake, return, and settlement result."
    >
      <TicketSection title="Search">
        <form
          className="flex flex-col gap-3 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            void findBet();
          }}
        >
          <input
            value={betslipId}
            onChange={(event) => setBetslipId(event.target.value)}
            placeholder="Betslip ID"
            className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white sm:max-w-xs"
          />
          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-brand-500 px-4 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
          >
            <Search size={16} />
            Search
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
                  "Bet Type",
                  "Placed on",
                  "By",
                  "Sports Limit",
                  "Sport",
                  "League",
                  "Event",
                  "Market",
                  "Selection",
                  "Odds",
                  "Stake",
                  "Return",
                  "Win/Loss",
                  "Client Type",
                  "Bet Status",
                  "Bet Settled Date & Time",
                ].map((head) => (
                  <th key={head} className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
              {bet && !loading ? (
                <>
                  <tr>
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-brand-600 dark:text-brand-300">
                      <button
                        type="button"
                        onClick={() => setExpanded((current) => !current)}
                        className="inline-flex items-center gap-1"
                      >
                        {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        {bet.betslipId}
                      </button>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{bet.betCategory}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{bet.created}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{bet.username}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">100%</td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{bet.sportsCount} Sports</td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{bet.tournamentsCount} Leagues</td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{bet.eventsCount} Events</td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{bet.marketsCount} Markets</td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{bet.totalSelections} Selection(s)</td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{bet.totalOdd}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{money(bet.stake)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{money(bet.winnings)}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <TicketBadge tone={statusTone(bet.statusCode)}>{winLoss(bet)}</TicketBadge>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{bet.source}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <TicketBadge tone={statusTone(bet.statusCode)}>{bet.statusDescription}</TicketBadge>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{bet.settledAt}</td>
                  </tr>
                  {expanded ? (
                    <tr>
                      <td colSpan={17} className="bg-gray-50 px-4 py-4 dark:bg-gray-900">
                        <BetDetailsPanel bet={bet.raw} />
                      </td>
                    </tr>
                  ) : null}
                </>
              ) : null}
              {!bet ? (
                <tr>
                  <td colSpan={17} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    {loading ? "Loading bet" : searched ? "No record found" : "Search by betslip ID"}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </TicketSection>
    </TicketOpsShell>
  );
}
