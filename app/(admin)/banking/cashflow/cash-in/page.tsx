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
import { cashIns } from "../data";

export default function CashInPage() {
  const approved = cashIns.filter((item) => item.status === "Approved");
  const pending = cashIns.filter((item) => item.status === "Pending");
  const total = cashIns.reduce((sum, item) => sum + item.amount, 0);

  return (
    <BankingPageShell
      title="Cash In"
      description="Approve, reject, and audit incoming branch cash movements. Nuxt exposed review actions for pending cash-in records."
    >
      <BankingMetrics metrics={[
        { label: "Cash In", value: money(total), detail: "Total requests" },
        { label: "Approved", value: String(approved.length), detail: "Accepted deposits" },
        { label: "Pending", value: String(pending.length), detail: "Awaiting review" },
        { label: "Rejected", value: String(cashIns.filter((item) => item.status === "Rejected").length), detail: "Declined records" },
      ]} />
      <BankingFilters />
      <BankingSection title="Cash In Requests">
        <BankingTable
          columns={[
            { label: "Date", key: "date" },
            { label: "Branch", key: "branch" },
            { label: "Amount", key: "amount", align: "right" },
            { label: "Comment", key: "comment" },
            { label: "Status", key: "status" },
            { label: "Actions", key: "actions", align: "right" },
          ]}
          rows={cashIns.map((item) => ({
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
