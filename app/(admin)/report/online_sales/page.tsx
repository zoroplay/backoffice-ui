import {
  ReportFilters,
  ReportMetrics,
  ReportPageShell,
  ReportSection,
  ReportTable,
} from "../components/ReportPageShell";

const rows = [
  { id: "OS-001", username: "john_doe", deposits: "NGN 850k", withdrawals: "NGN 420k", stakes: "NGN 1.8m", ngr: "NGN 260k" },
  { id: "OS-002", username: "mary_j", deposits: "NGN 430k", withdrawals: "NGN 180k", stakes: "NGN 790k", ngr: "NGN 112k" },
  { id: "OS-003", username: "samuel.ng", deposits: "NGN 1.2m", withdrawals: "NGN 940k", stakes: "NGN 2.6m", ngr: "NGN 305k" },
];

export default function OnlineSalesReportPage() {
  return (
    <ReportPageShell
      title="Online Sales Report"
      description="Review online customer sales by username, deposits, withdrawals, stakes, and net gaming revenue."
    >
      <ReportMetrics metrics={[
        { label: "Deposits", value: "NGN 2.48m", detail: "Online payments" },
        { label: "Withdrawals", value: "NGN 1.54m", detail: "Customer payouts" },
        { label: "Stakes", value: "NGN 5.19m", detail: "Online turnover" },
        { label: "NGR", value: "NGN 677k", detail: "Net result" },
      ]} />
      <ReportFilters filters={[
        { label: "Username", placeholder: "Username" },
        { label: "From", value: "2026-07-01" },
        { label: "To", value: "2026-07-22" },
        { label: "Client Type", placeholder: "All clients", options: ["Website", "Mobile"] },
      ]} />
      <ReportSection title="Results">
        <ReportTable
          columns={[
            { label: "Username", key: "username" },
            { label: "Deposits", key: "deposits", align: "right" },
            { label: "Withdrawals", key: "withdrawals", align: "right" },
            { label: "Stakes", key: "stakes", align: "right" },
            { label: "NGR", key: "ngr", align: "right" },
          ]}
          rows={rows}
        />
      </ReportSection>
    </ReportPageShell>
  );
}
