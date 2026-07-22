import { ReportPageShell } from "../components/ReportPageShell";

import SystemTransactionsClient from "./SystemTransactionsClient";

export default function SystemTransactionsPage() {
  return (
    <ReportPageShell
      title="System Transactions"
      description="Audit internal system transactions by username, module, type, amount, status, and date range."
    >
      <SystemTransactionsClient />
    </ReportPageShell>
  );
}
