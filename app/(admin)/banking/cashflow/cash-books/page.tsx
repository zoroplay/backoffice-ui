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
import { cashBooks } from "../data";

export default function CashBooksPage() {
  const totalClosing = cashBooks.reduce((sum, item) => sum + item.closingBalance, 0);
  const totalSales = cashBooks.reduce((sum, item) => sum + item.normalSales + item.virtualSales, 0);
  const totalPayout = cashBooks.reduce((sum, item) => sum + item.normalPayout + item.virtualPayout, 0);

  return (
    <BankingPageShell
      title="Cash Books"
      description="Review branch cashbook entries, sales, payouts, closing balances, and cashbook lifecycle status."
    >
      <BankingMetrics metrics={[
        { label: "Cashbooks", value: String(cashBooks.length), detail: "Branch records" },
        { label: "Sales", value: money(totalSales), detail: "Normal + virtual" },
        { label: "Payouts", value: money(totalPayout), detail: "Normal + virtual" },
        { label: "Closing Balance", value: money(totalClosing), detail: "Combined balance" },
      ]} />
      <BankingFilters />
      <BankingSection title="Cashbooks">
        <BankingTable
          columns={[
            { label: "Date", key: "date" },
            { label: "Branch", key: "branch" },
            { label: "Normal Sales", key: "normalSales", align: "right" },
            { label: "Normal Payout", key: "normalPayout", align: "right" },
            { label: "Virtual Sales", key: "virtualSales", align: "right" },
            { label: "Virtual Payout", key: "virtualPayout", align: "right" },
            { label: "Closing Balance", key: "closingBalance", align: "right" },
            { label: "Status", key: "status" },
          ]}
          rows={cashBooks.map((item) => ({
            ...item,
            normalSales: money(item.normalSales),
            normalPayout: money(item.normalPayout),
            virtualSales: money(item.virtualSales),
            virtualPayout: money(item.virtualPayout),
            closingBalance: money(item.closingBalance),
            status: <BankingBadge tone={statusTone(item.status)}>{item.status}</BankingBadge>,
          }))}
        />
      </BankingSection>
    </BankingPageShell>
  );
}
