import {
  ConfigurationBadge,
  ConfigurationMetrics,
  ConfigurationSection,
  ConfigurationShell,
  ConfigurationTable,
} from "../components/ConfigurationShell";

const marketGroups = [
  { id: "main", tab: "Market Grouping", sport: "Soccer", market: "1X2", group: "Main Markets", status: "Active" },
  { id: "highlight", tab: "Highlight Markets", sport: "Soccer", market: "Both Teams To Score", group: "Highlights", status: "Active" },
  { id: "derived", tab: "Derived Markets", sport: "Basketball", market: "Total Points", group: "Derived", status: "Draft" },
];

export default function MarketSettingsPage() {
  return (
    <ConfigurationShell
      title="Market Settings"
      description="Configure market grouping, highlighted markets, and derived markets from fixture API sports and markets."
    >
      <ConfigurationMetrics
        metrics={[
          { label: "Sports", value: "4", detail: "Loaded from fixture API" },
          { label: "Markets", value: "128", detail: "Available markets" },
          { label: "Groups", value: "12", detail: "Configured groups" },
          { label: "Highlights", value: "8", detail: "Promoted markets" },
        ]}
      />

      <ConfigurationSection
        title="Market Configuration Tabs"
        description="Nuxt separated this workflow into Market Grouping, Highlight Markets, and Derived Markets tabs."
      >
        <ConfigurationTable
          columns={[
            { label: "Tab", key: "tab" },
            { label: "Sport", key: "sport" },
            { label: "Market", key: "market" },
            { label: "Group", key: "group" },
            { label: "Status", key: "status" },
          ]}
          rows={marketGroups.map((row) => ({
            ...row,
            status: (
              <ConfigurationBadge tone={row.status === "Active" ? "success" : "warning"}>
                {row.status}
              </ConfigurationBadge>
            ),
          }))}
        />
      </ConfigurationSection>
    </ConfigurationShell>
  );
}
