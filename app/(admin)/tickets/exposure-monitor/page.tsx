import {
  TicketBadge,
  TicketFilters,
  TicketMetrics,
  TicketOpsShell,
  TicketSection,
  TicketTable,
} from "../components/TicketOpsShell";

const exposures = [
  {
    id: "EXP-001",
    event: "Arsenal vs Chelsea",
    market: "1X2",
    selection: "Arsenal",
    exposure: "NGN 8.4m",
    threshold: "NGN 10m",
    status: "Normal",
  },
  {
    id: "EXP-002",
    event: "Man City vs Liverpool",
    market: "Over/Under",
    selection: "Over 2.5",
    exposure: "NGN 13.1m",
    threshold: "NGN 12m",
    status: "Exceeded",
  },
  {
    id: "EXP-003",
    event: "Nigeria vs Ghana",
    market: "Both Teams To Score",
    selection: "Yes",
    exposure: "NGN 5.2m",
    threshold: "NGN 7.5m",
    status: "Watch",
  },
];

export default function TicketExposureMonitorPage() {
  return (
    <TicketOpsShell
      title="Exposure Monitor"
      description="Monitor betting exposure across events, markets, and selections. The page preserves the Nuxt exposure query, threshold review, betslip lookup, and risk-triage purpose."
    >
      <TicketMetrics
        metrics={[
          { label: "Total Exposure", value: "NGN 26.7m", detail: "Visible selections" },
          { label: "Exceeded", value: "1", detail: "Above configured limit" },
          { label: "Watch List", value: "1", detail: "Approaching threshold" },
          { label: "Settings", value: "Loaded", detail: "Exposure category" },
        ]}
      />
      <TicketFilters
        filters={[
          { label: "Sport", placeholder: "All sports", options: ["Football", "Basketball", "Tennis"] },
          { label: "Event", placeholder: "Event name or ID" },
          { label: "Market", placeholder: "All markets", options: ["1X2", "Over/Under", "Both Teams To Score"] },
          { label: "Status", placeholder: "All statuses", options: ["Normal", "Watch", "Exceeded"] },
        ]}
      />
      <TicketSection
        title="Exposure By Selection"
        description="Nuxt allowed operators to drill into a betslip by ID; keep that investigation action visible."
      >
        <TicketTable
          columns={[
            { label: "Event", key: "event" },
            { label: "Market", key: "market" },
            { label: "Selection", key: "selection" },
            { label: "Exposure", key: "exposure", align: "right" },
            { label: "Threshold", key: "threshold", align: "right" },
            { label: "Status", key: "status" },
            { label: "Action", key: "action", align: "right" },
          ]}
          rows={exposures.map((row) => ({
            ...row,
            status: (
              <TicketBadge
                tone={
                  row.status === "Exceeded"
                    ? "danger"
                    : row.status === "Watch"
                      ? "warning"
                      : "success"
                }
              >
                {row.status}
              </TicketBadge>
            ),
            action: (
              <button className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-900">
                View Bets
              </button>
            ),
          }))}
        />
      </TicketSection>
    </TicketOpsShell>
  );
}
