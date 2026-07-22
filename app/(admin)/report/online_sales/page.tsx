import { ReportMetrics, ReportPageShell } from "../components/ReportPageShell";

import OnlineSalesClient from "./OnlineSalesClient";

export default function OnlineSalesReportPage() {
  return (
    <ReportPageShell
      title="Online Sales Report"
      description="Review online sales by period, product, number of bets, turnover, winnings, gross gaming revenue, and margin."
    >
      <ReportMetrics metrics={[
        { label: "Products", value: "4", detail: "Sports, casino, games, virtual" },
        { label: "Default Product", value: "Sports", detail: "Matches Nuxt filter default" },
        { label: "Date Contract", value: "YYYY-MM-DD", detail: "API payload conversion" },
        { label: "Export", value: "Excel", detail: "Result card action" },
      ]} />
      <OnlineSalesClient />
    </ReportPageShell>
  );
}
