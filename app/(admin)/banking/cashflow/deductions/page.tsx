import {
  BankingBadge,
  BankingFilters,
  BankingMetrics,
  BankingPageShell,
  BankingSection,
  BankingTable,
  money,
} from "../../components/BankingPageShell";

const deductions = [
  { id: "DED-001", branch: "Lagos Main Branch", user: "john_admin", reason: "Till shortage", amount: 15000, status: "Approved" },
  { id: "DED-002", branch: "Abuja Branch", user: "sarah_manager", reason: "Settlement correction", amount: 28000, status: "Pending" },
  { id: "DED-003", branch: "Kano Branch", user: "abdul_cashier", reason: "Rejected payout recovery", amount: 9500, status: "Approved" },
];

export default function DeductionsPage() {
  const total = deductions.reduce((sum, item) => sum + item.amount, 0);

  return (
    <BankingPageShell
      title="Deductions"
      description="Record and review cashflow deductions against branches or users, preserving the Nuxt list and new-deduction workflow."
    >
      <BankingMetrics metrics={[
        { label: "Deductions", value: money(total), detail: "Total amount" },
        { label: "Records", value: String(deductions.length), detail: "Visible rows" },
        { label: "Approved", value: "2", detail: "Applied deductions" },
        { label: "Pending", value: "1", detail: "Needs approval" },
      ]} />
      <BankingFilters />
      <BankingSection title="Deduction Records">
        <BankingTable
          columns={[
            { label: "Branch", key: "branch" },
            { label: "User", key: "user" },
            { label: "Reason", key: "reason" },
            { label: "Amount", key: "amount", align: "right" },
            { label: "Status", key: "status" },
          ]}
          rows={deductions.map((item) => ({
            ...item,
            amount: money(item.amount),
            status: <BankingBadge tone={item.status === "Approved" ? "success" : "warning"}>{item.status}</BankingBadge>,
          }))}
        />
      </BankingSection>
    </BankingPageShell>
  );
}
