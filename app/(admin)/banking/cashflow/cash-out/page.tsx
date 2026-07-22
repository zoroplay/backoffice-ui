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
import { cashOuts } from "../data";

export default function CashOutPage() {
  const total = cashOuts.reduce((sum, item) => sum + item.amount, 0);

  return (
    <BankingPageShell
      title="Cash Out"
      description="Review outgoing branch cash movements, customer payout requests, and approval status."
    >
      <BankingMetrics metrics={[
        { label: "Cash Out", value: money(total), detail: "Total requests" },
        { label: "Approved", value: String(cashOuts.filter((item) => item.status === "Approved").length), detail: "Paid out" },
        { label: "Pending", value: String(cashOuts.filter((item) => item.status === "Pending").length), detail: "Awaiting approval" },
        { label: "Rejected", value: String(cashOuts.filter((item) => item.status === "Rejected").length), detail: "Declined requests" },
      ]} />
      <BankingFilters />
      <BankingSection title="Cash Out Requests">
        <BankingTable
          columns={[
            { label: "Date", key: "date" },
            { label: "Branch", key: "branch" },
            { label: "Amount", key: "amount", align: "right" },
            { label: "Comment", key: "comment" },
            { label: "Status", key: "status" },
            { label: "Actions", key: "actions", align: "right" },
          ]}
          rows={cashOuts.map((item) => ({
            ...item,
            amount: money(item.amount),
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
