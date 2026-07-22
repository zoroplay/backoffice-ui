import { openBets } from "../open_bet/data";
import {
  TicketBadge,
  TicketFilters,
  TicketMetrics,
  TicketOpsShell,
  TicketSection,
  TicketTable,
} from "../components/TicketOpsShell";

const unsettledRows = openBets.map((bet, index) => ({
  ...bet,
  age: index === 0 ? "42m" : index === 1 ? "1h 18m" : "3h 05m",
  settlementRisk: index === 1 ? "High" : "Normal",
}));

export default function UnsettledBetsPage() {
  return (
    <TicketOpsShell
      title="Unsettled Bets"
      description="Track open and unresolved sports tickets that still need settlement, cancellation, voiding, or manual review. The Nuxt page exposed operational actions on each unsettled bet."
    >
      <TicketMetrics
        metrics={[
          { label: "Unsettled", value: String(unsettledRows.length), detail: "Open tickets" },
          { label: "Stake", value: "NGN 180", detail: "Visible sample stake" },
          { label: "Potential Return", value: "NGN 342", detail: "Outstanding liability" },
          { label: "High Risk", value: "1", detail: "Manual review" },
        ]}
      />
      <TicketFilters
        filters={[
          { label: "Username", placeholder: "Username or betslip ID" },
          { label: "Sport", placeholder: "All sports", options: ["Football", "Basketball", "Tennis"] },
          { label: "Ticket Type", placeholder: "All types", options: ["Single", "Multi"] },
          { label: "Risk", placeholder: "All risks", options: ["Normal", "High"] },
        ]}
      />
      <TicketSection title="Unsettled Ticket List">
        <TicketTable
          columns={[
            { label: "Betslip ID", key: "betslipId" },
            { label: "Placed By", key: "by" },
            { label: "Event", key: "event" },
            { label: "Market", key: "market" },
            { label: "Stake", key: "stake", align: "right" },
            { label: "Return", key: "ret", align: "right" },
            { label: "Age", key: "age" },
            { label: "Risk", key: "settlementRisk" },
            { label: "Actions", key: "actions", align: "right" },
          ]}
          rows={unsettledRows.map((bet) => ({
            ...bet,
            stake: `NGN ${bet.stake}`,
            ret: `NGN ${bet.ret}`,
            settlementRisk: (
              <TicketBadge tone={bet.settlementRisk === "High" ? "danger" : "success"}>
                {bet.settlementRisk}
              </TicketBadge>
            ),
            actions: (
              <div className="flex justify-end gap-2">
                <button className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-900">
                  Settle
                </button>
                <button className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:text-red-300 dark:hover:bg-red-500/10">
                  Void
                </button>
              </div>
            ),
          }))}
        />
      </TicketSection>
    </TicketOpsShell>
  );
}
