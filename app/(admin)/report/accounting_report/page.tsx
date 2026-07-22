import {
  ReportFilters,
  ReportMetrics,
  ReportPageShell,
  ReportSection,
  ReportTable,
} from "../components/ReportPageShell";

const rows = [
  { id: "ACC-001", date: "2026-07-22", account: "Deposits", debit: "NGN 0", credit: "NGN 12.4m", balance: "NGN 12.4m" },
  { id: "ACC-002", date: "2026-07-22", account: "Withdrawals", debit: "NGN 7.1m", credit: "NGN 0", balance: "NGN 5.3m" },
  { id: "ACC-003", date: "2026-07-22", account: "Bonuses", debit: "NGN 820k", credit: "NGN 0", balance: "NGN 4.48m" },
];

export default function AccountingReportPage() {
  return (
    <ReportPageShell
      title="Accounting Reporting"
      description="Review debit, credit, and running balance movements by date and account category, preserving the Nuxt accounting report and exportable results table."
    >
      <ReportMetrics metrics={[
        { label: "Credits", value: "NGN 12.4m", detail: "Selected period" },
        { label: "Debits", value: "NGN 7.92m", detail: "Selected period" },
        { label: "Net", value: "NGN 4.48m", detail: "Running result" },
        { label: "Rows", value: String(rows.length), detail: "Report lines" },
      ]} />
      <ReportFilters filters={[
        { label: "From", value: "2026-07-01" },
        { label: "To", value: "2026-07-22" },
        { label: "Account", placeholder: "All accounts", options: ["Deposits", "Withdrawals", "Bonuses"] },
      ]} />
      <ReportSection title="Results" description="Nuxt exposed this table with Excel export.">
        <ReportTable
          columns={[
            { label: "Date", key: "date" },
            { label: "Account", key: "account" },
            { label: "Debit", key: "debit", align: "right" },
            { label: "Credit", key: "credit", align: "right" },
            { label: "Balance", key: "balance", align: "right" },
          ]}
          rows={rows}
        />
      </ReportSection>
    </ReportPageShell>
  );
}
