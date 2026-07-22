import {
  ReportBadge,
  ReportFilters,
  ReportMetrics,
  ReportPageShell,
  ReportSection,
  ReportTable,
} from "../components/ReportPageShell";

const rows = [
  { id: "SYS-1001", username: "finance@sbe", type: "Bonus Adjustment", amount: "NGN 15,000", module: "Bonuses", status: "Completed", date: "2026-07-22 09:20" },
  { id: "SYS-1002", username: "risk@sbe", type: "Ticket Void", amount: "NGN 42,500", module: "Tickets", status: "Completed", date: "2026-07-22 11:05" },
  { id: "SYS-1003", username: "admin@sbe", type: "Manual Credit", amount: "NGN 120,000", module: "Wallet", status: "Pending", date: "2026-07-22 12:17" },
];

export default function SystemTransactionsPage() {
  return (
    <ReportPageShell
      title="System Transactions"
      description="Audit internal system transactions by username, module, type, amount, status, and date range."
    >
      <ReportMetrics metrics={[
        { label: "Transactions", value: "3", detail: "Visible rows" },
        { label: "Amount", value: "NGN 177,500", detail: "Total impact" },
        { label: "Pending", value: "1", detail: "Needs approval" },
        { label: "Modules", value: "3", detail: "Bonuses, tickets, wallet" },
      ]} />
      <ReportFilters filters={[
        { label: "Username", placeholder: "Admin username" },
        { label: "Module", placeholder: "All modules", options: ["Bonuses", "Tickets", "Wallet"] },
        { label: "From", value: "2026-07-22" },
        { label: "To", value: "2026-07-22" },
      ]} />
      <ReportSection title="Results">
        <ReportTable
          columns={[
            { label: "Transaction ID", key: "id" },
            { label: "Username", key: "username" },
            { label: "Type", key: "type" },
            { label: "Module", key: "module" },
            { label: "Amount", key: "amount", align: "right" },
            { label: "Status", key: "status" },
            { label: "Date", key: "date" },
          ]}
          rows={rows.map((row) => ({
            ...row,
            status: <ReportBadge tone={row.status === "Completed" ? "success" : "warning"}>{row.status}</ReportBadge>,
          }))}
        />
      </ReportSection>
    </ReportPageShell>
  );
}
