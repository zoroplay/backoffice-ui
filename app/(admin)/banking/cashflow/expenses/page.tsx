import {
  BankingBadge,
  BankingFilters,
  BankingMetrics,
  BankingPageShell,
  BankingSection,
  BankingTable,
  money,
  statusTone,
} from "../../components/BankingPageShell";
import { expenses } from "../data";

export default function ExpensesPage() {
  const total = expenses.reduce((sum, item) => sum + item.amount, 0);

  return (
    <BankingPageShell
      title="Expenses"
      description="Track branch expenses, requester, amount, approval status, and approver audit information."
    >
      <BankingMetrics metrics={[
        { label: "Expenses", value: money(total), detail: "Submitted amount" },
        { label: "Approved", value: String(expenses.filter((item) => item.status === "Approved").length), detail: "Accepted records" },
        { label: "Pending", value: String(expenses.filter((item) => item.status === "Pending").length), detail: "Awaiting review" },
        { label: "Rejected", value: String(expenses.filter((item) => item.status === "Rejected").length), detail: "Declined expenses" },
      ]} />
      <BankingFilters />
      <BankingSection title="Expense Requests">
        <BankingTable
          columns={[
            { label: "Expense", key: "expense" },
            { label: "Branch", key: "branch" },
            { label: "Requested By", key: "user" },
            { label: "Amount", key: "amount", align: "right" },
            { label: "Approved By", key: "approvedBy" },
            { label: "Status", key: "status" },
            { label: "Actions", key: "actions", align: "right" },
          ]}
          rows={expenses.map((item) => ({
            ...item,
            amount: money(item.amount),
            approvedBy: item.approvedBy ?? "-",
            status: <BankingBadge tone={statusTone(item.status)}>{item.status}</BankingBadge>,
            actions: (
              <div className="flex justify-end gap-2">
                <button className="rounded-md border border-green-200 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-50 dark:border-green-500/30 dark:text-green-300">Approve</button>
                <button className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:text-red-300">Reject</button>
              </div>
            ),
          }))}
        />
      </BankingSection>
    </BankingPageShell>
  );
}
