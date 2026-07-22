import {
  BankingBadge,
  BankingFilters,
  BankingMetrics,
  BankingPageShell,
  BankingSection,
  BankingTable,
  money,
} from "../../components/BankingPageShell";
import { cashBooks } from "../data";

const standings = cashBooks.slice(0, 6).map((cashbook) => {
  const sales = cashbook.normalSales + cashbook.virtualSales;
  const payouts = cashbook.normalPayout + cashbook.virtualPayout;
  return {
    id: cashbook.id,
    branch: cashbook.branch,
    sales,
    payouts,
    balance: cashbook.closingBalance,
    standing: sales - payouts + cashbook.closingBalance,
    status: cashbook.status,
  };
});

export default function StandingsPage() {
  const totalStanding = standings.reduce((sum, item) => sum + item.standing, 0);

  return (
    <BankingPageShell
      title="Standings"
      description="Review branch cash standings using sales, payouts, closing balance, and cashbook state."
    >
      <BankingMetrics metrics={[
        { label: "Standing", value: money(totalStanding), detail: "Combined position" },
        { label: "Branches", value: String(standings.length), detail: "Visible rows" },
        { label: "Open", value: String(standings.filter((item) => item.status === "Open").length), detail: "Active books" },
        { label: "Approved", value: String(standings.filter((item) => item.status === "Approved").length), detail: "Reviewed" },
      ]} />
      <BankingFilters />
      <BankingSection title="Branch Standings">
        <BankingTable
          columns={[
            { label: "Branch", key: "branch" },
            { label: "Sales", key: "sales", align: "right" },
            { label: "Payouts", key: "payouts", align: "right" },
            { label: "Closing Balance", key: "balance", align: "right" },
            { label: "Standing", key: "standing", align: "right" },
            { label: "Status", key: "status" },
          ]}
          rows={standings.map((item) => ({
            ...item,
            sales: money(item.sales),
            payouts: money(item.payouts),
            balance: money(item.balance),
            standing: money(item.standing),
            status: <BankingBadge tone={item.status === "Pending" ? "warning" : "success"}>{item.status}</BankingBadge>,
          }))}
        />
      </BankingSection>
    </BankingPageShell>
  );
}
