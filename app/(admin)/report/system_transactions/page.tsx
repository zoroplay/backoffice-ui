import { ReportMetrics, ReportPageShell } from "../components/ReportPageShell";

import SystemTransactionsClient from "./SystemTransactionsClient";

export default function SystemTransactionsPage() {
  return (
    <ReportPageShell
      title="System Transactions"
      description="Audit internal system transactions by username, module, type, amount, status, and date range."
    >
      <ReportMetrics metrics={[
        { label: "Transactions", value: "4", detail: "Visible ledger rows" },
        { label: "Credits", value: "2", detail: "Positive movements" },
        { label: "Debits", value: "2", detail: "Negative movements" },
        { label: "Export", value: "Excel", detail: "Matches Nuxt report affordance" },
      ]} />
      <SystemTransactionsClient />
    </ReportPageShell>
  );
}
