import {
  TicketBadge,
  TicketFilters,
  TicketMetrics,
  TicketOpsShell,
  TicketSection,
  TicketTable,
} from "../components/TicketOpsShell";

const declinedBets = [
  {
    id: "DBH-74021",
    username: "john_doe",
    betType: "Multiple",
    stake: "NGN 25,000",
    reason: "Max exposure exceeded",
    channel: "Web",
    date: "2026-07-22 11:42",
  },
  {
    id: "DBH-74022",
    username: "agent_007",
    betType: "Single",
    stake: "NGN 120,000",
    reason: "Odds changed",
    channel: "Retail",
    date: "2026-07-22 12:18",
  },
  {
    id: "DBH-74023",
    username: "mary_j",
    betType: "Combo",
    stake: "NGN 8,500",
    reason: "Event suspended",
    channel: "Mobile",
    date: "2026-07-22 13:04",
  },
];

export default function DeclinedBetsHistoryPage() {
  return (
    <TicketOpsShell
      title="Declined Bets History"
      description="Review declined bet slips and rejection reasons for trading, support, and risk follow-up. This preserves the Nuxt username/date/status filter workflow and declined ticket audit table."
    >
      <TicketMetrics
        metrics={[
          { label: "Declined Bets", value: "3", detail: "Current result set" },
          { label: "Stake Blocked", value: "NGN 153,500", detail: "Total rejected stake" },
          { label: "Top Reason", value: "Exposure", detail: "Risk threshold" },
          { label: "Channels", value: "3", detail: "Web, mobile, retail" },
        ]}
      />
      <TicketFilters
        filters={[
          { label: "Username", placeholder: "Username or betslip ID" },
          { label: "From", value: "2026-07-22" },
          { label: "To", value: "2026-07-22" },
          { label: "Channel", placeholder: "All channels", options: ["Web", "Mobile", "Retail"] },
        ]}
      />
      <TicketSection title="Declined Tickets">
        <TicketTable
          columns={[
            { label: "Betslip ID", key: "id" },
            { label: "Username", key: "username" },
            { label: "Bet Type", key: "betType" },
            { label: "Stake", key: "stake", align: "right" },
            { label: "Reason", key: "reason" },
            { label: "Channel", key: "channel" },
            { label: "Date", key: "date" },
          ]}
          rows={declinedBets.map((bet) => ({
            ...bet,
            reason: <TicketBadge tone="danger">{bet.reason}</TicketBadge>,
          }))}
        />
      </TicketSection>
    </TicketOpsShell>
  );
}
