import {
  TicketBadge,
  TicketFilters,
  TicketMetrics,
  TicketOpsShell,
  TicketSection,
  TicketTable,
} from "../components/TicketOpsShell";

const sportRows = [
  { id: "football", sport: "Football", tickets: "18,420", stake: "NGN 92.4m", payout: "NGN 71.8m", margin: "22.3%", trend: "Strong" },
  { id: "basketball", sport: "Basketball", tickets: "4,214", stake: "NGN 16.7m", payout: "NGN 14.9m", margin: "10.8%", trend: "Watch" },
  { id: "tennis", sport: "Tennis", tickets: "2,998", stake: "NGN 9.6m", payout: "NGN 8.1m", margin: "15.6%", trend: "Normal" },
];

export default function SportsPerformancePage() {
  return (
    <TicketOpsShell
      title="Sports Performance"
      description="Review sport-level ticket volume, stake, payout, and margin so trading teams can understand performance by sport and period."
    >
      <TicketMetrics
        metrics={[
          { label: "Tickets", value: "25,632", detail: "Selected period" },
          { label: "Stake", value: "NGN 118.7m", detail: "Total turnover" },
          { label: "Payout", value: "NGN 94.8m", detail: "Settled returns" },
          { label: "Margin", value: "20.1%", detail: "Blended result" },
        ]}
      />
      <TicketFilters
        filters={[
          { label: "From", value: "2026-07-01" },
          { label: "To", value: "2026-07-22" },
          { label: "Sport", placeholder: "All sports", options: ["Football", "Basketball", "Tennis"] },
          { label: "Channel", placeholder: "All channels", options: ["Web", "Mobile", "Retail"] },
        ]}
      />
      <TicketSection title="Sport Performance">
        <TicketTable
          columns={[
            { label: "Sport", key: "sport" },
            { label: "Tickets", key: "tickets", align: "right" },
            { label: "Stake", key: "stake", align: "right" },
            { label: "Payout", key: "payout", align: "right" },
            { label: "Margin", key: "margin", align: "right" },
            { label: "Trend", key: "trend" },
          ]}
          rows={sportRows.map((row) => ({
            ...row,
            trend: (
              <TicketBadge
                tone={
                  row.trend === "Strong"
                    ? "success"
                    : row.trend === "Watch"
                      ? "warning"
                      : "neutral"
                }
              >
                {row.trend}
              </TicketBadge>
            ),
          }))}
        />
      </TicketSection>
    </TicketOpsShell>
  );
}
