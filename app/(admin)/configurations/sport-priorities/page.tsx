import {
  ConfigurationBadge,
  ConfigurationField,
  ConfigurationFormGrid,
  ConfigurationMetrics,
  ConfigurationSection,
  ConfigurationShell,
  ConfigurationTable,
} from "../components/ConfigurationShell";

const priorities = [
  { id: "soccer", sport: "Soccer", type: "Sport", scope: "Global", priority: 1000, status: "Pinned" },
  { id: "england", sport: "England", type: "Category", scope: "Soccer", priority: 900, status: "Pinned" },
  { id: "premier-league", sport: "Premier League", type: "Tournament", scope: "Soccer", priority: 850, status: "Pinned" },
  { id: "match-12911", sport: "Arsenal vs Chelsea", type: "Match", scope: "Upcoming", priority: 700, status: "Highlighted" },
];

export default function SportPrioritiesPage() {
  return (
    <ConfigurationShell
      title="Sport Priorities"
      description="Order sportsbook navigation across sports, categories, tournaments, upcoming matches, boosted matches, and highlighted fixtures."
    >
      <ConfigurationMetrics
        metrics={[
          { label: "Priority Items", value: String(priorities.length), detail: "Visible rows" },
          { label: "Pinned", value: "3", detail: "Manual priority" },
          { label: "Highlighted", value: "1", detail: "Fixture boost" },
          { label: "Fixture API", value: "Sports", detail: "Source integration" },
        ]}
      />

      <ConfigurationSection
        title="Priority Editor"
        description="Nuxt loaded sports, categories, tournaments, fixtures, boosted priorities, and highlighted matches from the fixture API."
      >
        <form className="mb-5">
          <ConfigurationFormGrid>
            <ConfigurationField label="Sport" value="Soccer" options={["Soccer", "Basketball", "Tennis", "Virtual Football"]} />
            <ConfigurationField label="Priority Type" value="Sport" options={["Sport", "Category", "Tournament", "Upcoming Match", "Boosted Match", "Highlighted Match"]} />
            <ConfigurationField label="Start Date" value="2026-07-22" />
          </ConfigurationFormGrid>
        </form>
        <ConfigurationTable
          columns={[
            { label: "Item", key: "sport" },
            { label: "Type", key: "type" },
            { label: "Scope", key: "scope" },
            { label: "Priority", key: "priority", align: "right" },
            { label: "Status", key: "status" },
          ]}
          rows={priorities.map((row) => ({
            ...row,
            status: (
              <ConfigurationBadge tone={row.status === "Pinned" ? "success" : "warning"}>
                {row.status}
              </ConfigurationBadge>
            ),
          }))}
        />
      </ConfigurationSection>
    </ConfigurationShell>
  );
}
