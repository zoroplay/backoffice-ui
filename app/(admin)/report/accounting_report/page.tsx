import { ReportMetrics, ReportPageShell } from "../components/ReportPageShell";

import AccountingReportClient from "./AccountingReportClient";

export default function AccountingReportPage() {
  return (
    <ReportPageShell
      title="Accounting Reporting"
      description="Review player accounting by period, client type, total stake, total winnings, company profit, and available balance."
    >
      <ReportMetrics metrics={[
        { label: "Client Types", value: "3", detail: "Website, mobile, cashier" },
        { label: "Profit Rule", value: "Stake - Win", detail: "Negative values highlighted" },
        { label: "Balance Filter", value: "Changed", detail: "Optional balance-change view" },
        { label: "Source API", value: "Bets", detail: "getAccountingReport" },
      ]} />
      <AccountingReportClient />
    </ReportPageShell>
  );
}
