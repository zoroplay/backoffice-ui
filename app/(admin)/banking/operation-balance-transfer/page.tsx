import {
  BankingMetrics,
  BankingPageShell,
  BankingSection,
  BankingTable,
  money,
} from "../components/BankingPageShell";

const balanceRows = [
  { id: "main", account: "Operations Main", balance: 12400000, updated: "2026-07-22 09:00" },
  { id: "bonus", account: "Bonus Float", balance: 3800000, updated: "2026-07-22 09:15" },
  { id: "retail", account: "Retail Cash Float", balance: 7200000, updated: "2026-07-22 10:10" },
];

export default function OperationBalanceTransferPage() {
  const totalBalance = balanceRows.reduce((sum, row) => sum + row.balance, 0);

  return (
    <BankingPageShell
      title="Operations Account & Transfers"
      description="Review operations account balances and submit balance transfer updates, preserving the Nuxt update-balance workflow."
    >
      <BankingMetrics metrics={[
        { label: "Operations Balance", value: money(totalBalance), detail: "Available float" },
        { label: "Accounts", value: String(balanceRows.length), detail: "Transfer targets" },
        { label: "Last Update", value: "10:10", detail: "Today" },
        { label: "Workflow", value: "Manual", detail: "Admin transfer" },
      ]} />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr),420px]">
        <BankingSection title="Menu Items">
          <BankingTable
            columns={[
              { label: "Account", key: "account" },
              { label: "Balance", key: "balance", align: "right" },
              { label: "Updated", key: "updated" },
            ]}
            rows={balanceRows.map((row) => ({ ...row, balance: money(row.balance) }))}
          />
        </BankingSection>
        <BankingSection title="Update Balance">
          <form className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Account</span>
              <select className="mt-2 h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900">
                {balanceRows.map((row) => <option key={row.id}>{row.account}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Amount</span>
              <input className="mt-2 h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Comment</span>
              <textarea className="mt-2 min-h-24 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900" />
            </label>
            <button type="button" className="w-full rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">Submit Transfer</button>
          </form>
        </BankingSection>
      </div>
    </BankingPageShell>
  );
}
