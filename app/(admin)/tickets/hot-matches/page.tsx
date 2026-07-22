import {
  TicketBadge,
  TicketFilters,
  TicketMetrics,
  TicketOpsShell,
  TicketSection,
  TicketTable,
} from "../components/TicketOpsShell";

const hotMatches = [
  { id: "HM-001", eventId: "EVT-9031", event: "Arsenal vs Chelsea", market: "1X2", priority: 1000, status: "Active" },
  { id: "HM-002", eventId: "EVT-9032", event: "Nigeria vs Ghana", market: "Over 2.5", priority: 850, status: "Active" },
  { id: "HM-003", eventId: "EVT-9033", event: "Lakers vs Heat", market: "Moneyline", priority: 500, status: "Draft" },
];

export default function HotMatchesPage() {
  return (
    <TicketOpsShell
      title="Hot Matches Setup"
      description="Maintain highlighted betting events. Nuxt stored hot match rows, looked up fixture details by event ID, and refreshed the active list after saves."
    >
      <TicketMetrics
        metrics={[
          { label: "Hot Matches", value: "3", detail: "Configured rows" },
          { label: "Active", value: "2", detail: "Shown to operators" },
          { label: "Top Priority", value: "1000", detail: "Manual ranking" },
          { label: "Fixture Lookup", value: "Event ID", detail: "Nuxt behavior preserved" },
        ]}
      />
      <TicketFilters
        filters={[
          { label: "Event ID", placeholder: "Find fixture by event ID" },
          { label: "Event Name", placeholder: "Search event" },
          { label: "Status", placeholder: "All statuses", options: ["Active", "Draft", "Inactive"] },
        ]}
      />
      <TicketSection title="Hot Match List">
        <TicketTable
          columns={[
            { label: "Event ID", key: "eventId" },
            { label: "Event", key: "event" },
            { label: "Market", key: "market" },
            { label: "Priority", key: "priority", align: "right" },
            { label: "Status", key: "status" },
            { label: "Action", key: "action", align: "right" },
          ]}
          rows={hotMatches.map((match) => ({
            ...match,
            status: (
              <TicketBadge tone={match.status === "Active" ? "success" : "warning"}>
                {match.status}
              </TicketBadge>
            ),
            action: (
              <button className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:text-red-300 dark:hover:bg-red-500/10">
                Remove
              </button>
            ),
          }))}
        />
      </TicketSection>
    </TicketOpsShell>
  );
}
