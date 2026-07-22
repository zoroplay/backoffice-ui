import { ReportMetrics, ReportPageShell } from "../components/ReportPageShell";

import CommissionReportClient from "./CommissionReportClient";

export default function CommissionReportPage() {
  return (
    <ReportPageShell
      title="Commissions Report"
      description="Track weekly, paid, and bonus commissions with provider filters, agent commission types, profile details, selection, and payout actions."
    >
      <ReportMetrics metrics={[
        { label: "Tabs", value: "3", detail: "Weekly, paid, bonus" },
        { label: "Providers", value: "5", detail: "Sport, casino, poker, virtual, live" },
        { label: "Agent Modes", value: "3", detail: "GGR, multiple, super agent" },
        { label: "Payout Guard", value: "Profile ID", detail: "Invalid commissions cannot be paid" },
      ]} />
      <CommissionReportClient />
    </ReportPageShell>
  );
}
