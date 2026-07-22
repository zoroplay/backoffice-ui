import {
  ReportBadge,
  ReportFilters,
  ReportMetrics,
  ReportPageShell,
  ReportSection,
  ReportTable,
} from "../components/ReportPageShell";

const rows = [
  { id: "PO-8821", username: "john_doe", method: "Bank Transfer", amount: "NGN 250,000", reference: "NIP-77821", status: "Paid" },
  { id: "PO-8822", username: "samuel.ng", method: "Wallet", amount: "NGN 75,000", reference: "WAL-82910", status: "Pending" },
  { id: "PO-8823", username: "agent_007", method: "Cashier", amount: "NGN 180,000", reference: "CSH-10082", status: "Failed" },
];

export default function PayoutTransactionsPage() {
  return (
    <ReportPageShell
      title="Payout Transactions"
      description="Audit payout transaction records by user, method, reference, amount, and settlement status."
    >
      <ReportMetrics metrics={[
        { label: "Payouts", value: "NGN 505k", detail: "Visible total" },
        { label: "Paid", value: "1", detail: "Completed" },
        { label: "Pending", value: "1", detail: "Awaiting processing" },
        { label: "Failed", value: "1", detail: "Needs review" },
      ]} />
      <ReportFilters filters={[
        { label: "Username", placeholder: "Username or reference" },
        { label: "Method", placeholder: "All methods", options: ["Bank Transfer", "Wallet", "Cashier"] },
        { label: "From", value: "2026-07-01" },
        { label: "To", value: "2026-07-22" },
      ]} />
      <ReportSection title="Results">
        <ReportTable
          columns={[
            { label: "Transaction ID", key: "id" },
            { label: "Username", key: "username" },
            { label: "Method", key: "method" },
            { label: "Reference", key: "reference" },
            { label: "Amount", key: "amount", align: "right" },
            { label: "Status", key: "status" },
          ]}
          rows={rows.map((row) => ({
            ...row,
            status: (
              <ReportBadge
                tone={row.status === "Paid" ? "success" : row.status === "Failed" ? "danger" : "warning"}
              >
                {row.status}
              </ReportBadge>
            ),
          }))}
        />
      </ReportSection>
    </ReportPageShell>
  );
}
