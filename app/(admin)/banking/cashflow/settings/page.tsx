import {
  BankingMetrics,
  BankingPageShell,
  BankingSection,
  BankingTable,
  money,
} from "../../components/BankingPageShell";
import { expenseCategories, expenseTypes } from "../data";

export default function CashflowSettingsPage() {
  return (
    <BankingPageShell
      title="Cashflow Settings"
      description="Manage expense types and expense categories used by cashflow expense and deduction workflows."
    >
      <BankingMetrics metrics={[
        { label: "Expense Types", value: String(expenseTypes.length), detail: "Configured types" },
        { label: "Categories", value: String(expenseCategories.length), detail: "Expense groups" },
        { label: "Highest Limit", value: money(Math.max(...expenseTypes.map((item) => item.amount))), detail: "Type ceiling" },
        { label: "Workflow", value: "Editable", detail: "Add/update/delete" },
      ]} />
      <BankingSection title="Expense Types">
        <BankingTable
          columns={[
            { label: "Title", key: "title" },
            { label: "Category", key: "category" },
            { label: "Amount", key: "amount", align: "right" },
            { label: "Action", key: "action", align: "right" },
          ]}
          rows={expenseTypes.map((type) => ({
            ...type,
            amount: money(type.amount),
            action: <button className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 dark:border-gray-700 dark:text-gray-200">Edit</button>,
          }))}
        />
      </BankingSection>
      <BankingSection title="Expense Categories">
        <BankingTable
          columns={[
            { label: "Title", key: "title" },
            { label: "Description", key: "description" },
            { label: "Action", key: "action", align: "right" },
          ]}
          rows={expenseCategories.map((category) => ({
            ...category,
            action: <button className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 dark:border-gray-700 dark:text-gray-200">Edit</button>,
          }))}
        />
      </BankingSection>
    </BankingPageShell>
  );
}
