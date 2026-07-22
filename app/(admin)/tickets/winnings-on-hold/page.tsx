import { ticketsOnHold } from "../ticket-on-hold/data";
import {
  TicketBadge,
  TicketFilters,
  TicketMetrics,
  TicketOpsShell,
  TicketSection,
  TicketTable,
} from "../components/TicketOpsShell";

const heldWinnings = ticketsOnHold.slice(0, 4).map((ticket, index) => ({
  ...ticket,
  holdReason:
    index === 0
      ? "Large payout"
      : index === 1
        ? "Risk review"
        : index === 2
          ? "Duplicate device"
          : "Manual approval",
}));

export default function WinningsOnHoldPage() {
  return (
    <TicketOpsShell
      title="Winnings On Hold"
      description="Review winning tickets held for manual approval or investigation before payout. This preserves the Nuxt approve/reject workflow and audit purpose."
    >
      <TicketMetrics
        metrics={[
          { label: "Held Tickets", value: String(heldWinnings.length), detail: "Awaiting decision" },
          { label: "Held Amount", value: "NGN 35,225", detail: "Potential payout" },
          { label: "Large Payouts", value: "1", detail: "Risk trigger" },
          { label: "Manual Reviews", value: "4", detail: "Operator queue" },
        ]}
      />
      <TicketFilters
        filters={[
          { label: "Username", placeholder: "Username or betslip ID" },
          { label: "Reason", placeholder: "All reasons", options: ["Large payout", "Risk review", "Duplicate device", "Manual approval"] },
          { label: "Client Type", placeholder: "All clients", options: ["Mobile", "Web", "Retail"] },
          { label: "Date", value: "2026-07-22" },
        ]}
      />
      <TicketSection title="Approval Queue">
        <TicketTable
          columns={[
            { label: "Betslip ID", key: "betslipId" },
            { label: "Username", key: "username" },
            { label: "Bet Type", key: "betType" },
            { label: "Selections", key: "selection", align: "right" },
            { label: "Potential Return", key: "potentialReturn", align: "right" },
            { label: "Reason", key: "holdReason" },
            { label: "Actions", key: "actions", align: "right" },
          ]}
          rows={heldWinnings.map((ticket) => ({
            ...ticket,
            potentialReturn: `NGN ${ticket.potentialReturn.toLocaleString()}`,
            holdReason: <TicketBadge tone="warning">{ticket.holdReason}</TicketBadge>,
            actions: (
              <div className="flex justify-end gap-2">
                <button className="rounded-md border border-green-200 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-50 dark:border-green-500/30 dark:text-green-300 dark:hover:bg-green-500/10">
                  Approve
                </button>
                <button className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:text-red-300 dark:hover:bg-red-500/10">
                  Reject
                </button>
              </div>
            ),
          }))}
        />
      </TicketSection>
    </TicketOpsShell>
  );
}
