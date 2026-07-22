import {
  ReportBadge,
  ReportMetrics,
  ReportPageShell,
  ReportSection,
  ReportTable,
} from "../components/ReportPageShell";

const dashboardRows = [
  { id: "financial", panel: "Financial Overview", metric: "Net Cash", value: "NGN 41.2m", status: "Healthy" },
  { id: "bonus", panel: "Bonus Spent & NGR Overview", metric: "Bonus Cost", value: "NGN 3.8m", status: "Watch" },
  { id: "virtual", panel: "Virtual Activity GGR", metric: "GGR", value: "NGN 1.9m", status: "Healthy" },
  { id: "players", panel: "Active Players", metric: "Active Users", value: "18,240", status: "Healthy" },
  { id: "client", panel: "GGR & NGR by Client Type", metric: "Mobile NGR", value: "NGN 19.4m", status: "Healthy" },
  { id: "ftd", panel: "FTDs vs Conversions", metric: "Conversion", value: "41.8%", status: "Watch" },
];

export default function ReportingDashboardPage() {
  return (
    <ReportPageShell
      title="Reporting Dashboard"
      description="Executive reporting dashboard preserving the Nuxt overview panels for financials, bonus spend, virtual GGR, active players, client-type revenue, and FTD conversion."
    >
      <ReportMetrics metrics={[
        { label: "Net Cash", value: "NGN 41.2m", detail: "Financial overview" },
        { label: "NGR", value: "NGN 26.9m", detail: "Across products" },
        { label: "Active Players", value: "18,240", detail: "Current period" },
        { label: "FTD Conversion", value: "41.8%", detail: "Registration funnel" },
      ]} />
      <ReportSection title="Dashboard Panels">
        <ReportTable
          columns={[
            { label: "Panel", key: "panel" },
            { label: "Primary Metric", key: "metric" },
            { label: "Value", key: "value", align: "right" },
            { label: "Status", key: "status" },
          ]}
          rows={dashboardRows.map((row) => ({
            ...row,
            status: <ReportBadge tone={row.status === "Healthy" ? "success" : "warning"}>{row.status}</ReportBadge>,
          }))}
        />
      </ReportSection>
    </ReportPageShell>
  );
}
